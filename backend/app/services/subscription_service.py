"""Subscription provisioning and entitlement helpers without billing-provider coupling."""
from copy import deepcopy
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from ..models.organization.subscription import (
    OrganizationSubscription,
    SubscriptionEvent,
    SubscriptionPlan,
)

TRIAL_PLAN_CODE = "FOUNDATION_TRIAL"
TRIAL_DAYS = 30
TRIAL_ENTITLEMENTS = {
    "features": [
        "FEATURE.CRM",
        "FEATURE.GROUPS",
        "FEATURE.TRANSACTIONS",
        "FEATURE.DOCUMENTS",
        "FEATURE.MEETINGS",
        "FEATURE.TASKS",
        "FEATURE.GOALS",
        "FEATURE.PORTFOLIO",
        "FEATURE.REPORTS",
        "FEATURE.EMPLOYEE_MANAGEMENT",
        "FEATURE.MULTI_BRANCH",
        "FEATURE.CLIENT_PORTAL",
    ],
    "limits": {
        "LIMIT.CLIENTS": 250,
        "LIMIT.EMPLOYEES": 25,
        "LIMIT.BRANCHES": 5,
        "LIMIT.STORAGE_BYTES": 10737418240,
        "LIMIT.REPORTS_PER_MONTH": 500,
    },
}


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def ensure_trial_plan(db: Session, *, actor_user_id: int | None = None) -> SubscriptionPlan:
    plan = db.query(SubscriptionPlan).filter(
        SubscriptionPlan.plan_code == TRIAL_PLAN_CODE,
    ).first()
    if plan is None:
        plan = SubscriptionPlan(
            plan_code=TRIAL_PLAN_CODE,
            plan_name="Foundation Trial",
            description="Default trial for newly created organizations",
            billing_interval="TRIAL",
            price=0,
            currency_code="INR",
            entitlements=deepcopy(TRIAL_ENTITLEMENTS),
            created_by=actor_user_id,
            updated_by=actor_user_id,
        )
        db.add(plan)
        db.flush()
    return plan


def create_trial_subscription(
    db: Session, *, organization_id: int, actor_user_id: int,
) -> OrganizationSubscription:
    current = db.query(OrganizationSubscription).filter(
        OrganizationSubscription.organization_id == organization_id,
        OrganizationSubscription.ended_at.is_(None),
        OrganizationSubscription.deleted_at.is_(None),
    ).first()
    if current is not None:
        raise ValueError("Organization already has a current subscription")

    plan = ensure_trial_plan(db, actor_user_id=actor_user_id)
    now = utcnow()
    subscription = OrganizationSubscription(
        organization_id=organization_id,
        plan_id=plan.id,
        status="TRIALING",
        trial_started_at=now,
        trial_ends_at=now + timedelta(days=TRIAL_DAYS),
        current_period_start=now,
        current_period_end=now + timedelta(days=TRIAL_DAYS),
        entitlement_snapshot=deepcopy(plan.entitlements),
        created_by=actor_user_id,
        updated_by=actor_user_id,
    )
    db.add(subscription)
    db.flush()
    db.add(SubscriptionEvent(
        organization_id=organization_id,
        subscription_id=subscription.id,
        event_type="TRIAL_STARTED",
        previous_status=None,
        new_status="TRIALING",
        event_payload={"plan_code": plan.plan_code, "trial_days": TRIAL_DAYS},
        created_by=actor_user_id,
    ))
    return subscription


def subscription_access_active(subscription: OrganizationSubscription | None, now: datetime | None = None) -> bool:
    if subscription is None:
        return False
    now = now or utcnow()
    if subscription.status in {"ACTIVE", "TRIALING"}:
        return subscription.current_period_end >= now
    if subscription.status == "PAST_DUE" and subscription.grace_ends_at is not None:
        return subscription.grace_ends_at >= now
    return False
