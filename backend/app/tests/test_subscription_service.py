from datetime import timedelta

from app.models.organization.subscription import OrganizationSubscription, SubscriptionEvent, SubscriptionPlan
from app.services.subscription_service import (
    TRIAL_ENTITLEMENTS,
    create_trial_subscription,
    subscription_access_active,
    utcnow,
)


class EmptyQuery:
    def filter(self, *args):
        return self

    def first(self):
        return None


class RecordingDB:
    def __init__(self):
        self.added = []
        self.next_id = 1

    def query(self, *args):
        return EmptyQuery()

    def add(self, value):
        self.added.append(value)

    def flush(self):
        for value in self.added:
            if hasattr(value, "id") and value.id is None:
                value.id = self.next_id
                self.next_id += 1


def test_trial_subscription_snapshots_entitlements_and_records_event():
    db = RecordingDB()
    subscription = create_trial_subscription(db, organization_id=7, actor_user_id=3)
    plan = next(value for value in db.added if isinstance(value, SubscriptionPlan))
    event = next(value for value in db.added if isinstance(value, SubscriptionEvent))
    assert subscription.status == "TRIALING"
    assert subscription.plan_id == plan.id
    assert subscription.entitlement_snapshot == TRIAL_ENTITLEMENTS
    assert subscription.entitlement_snapshot is not plan.entitlements
    assert event.subscription_id == subscription.id
    assert event.event_type == "TRIAL_STARTED"
    assert event.created_by == 3


def test_subscription_access_status_and_grace_rules():
    now = utcnow()
    active = OrganizationSubscription(status="ACTIVE", current_period_end=now + timedelta(days=1))
    expired = OrganizationSubscription(status="ACTIVE", current_period_end=now - timedelta(seconds=1))
    grace = OrganizationSubscription(
        status="PAST_DUE", current_period_end=now - timedelta(days=1),
        grace_ends_at=now + timedelta(days=1),
    )
    suspended = OrganizationSubscription(status="SUSPENDED", current_period_end=now + timedelta(days=1))
    assert subscription_access_active(active, now)
    assert not subscription_access_active(expired, now)
    assert subscription_access_active(grace, now)
    assert not subscription_access_active(suspended, now)
    assert not subscription_access_active(None, now)

