"""Organization subscription plans, immutable subscription periods, and events."""
from datetime import datetime

from sqlalchemy import (
    BigInteger, Boolean, Column, DateTime, ForeignKey, Index, Numeric, String, Text, text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from ..base import AuditMixin, Base


class SubscriptionPlan(AuditMixin, Base):
    __tablename__ = "subscription_plans"
    __table_args__ = {"schema": "organization"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    plan_code = Column(String(50), nullable=False, unique=True)
    plan_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    billing_interval = Column(String(20), nullable=False)
    price = Column(Numeric(18, 2), nullable=False, server_default=text("0"))
    currency_code = Column(String(3), nullable=False, server_default=text("'INR'"))
    entitlements = Column(JSONB, nullable=False)


class OrganizationSubscription(AuditMixin, Base):
    __tablename__ = "organization_subscriptions"
    __table_args__ = (
        Index("ix_organization_subscriptions_org_status", "organization_id", "status"),
        Index(
            "uq_organization_subscription_current",
            "organization_id",
            unique=True,
            postgresql_where=text("ended_at IS NULL AND deleted_at IS NULL"),
        ),
        {"schema": "organization"},
    )

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    plan_id = Column(BigInteger, ForeignKey("organization.subscription_plans.id"), nullable=False)
    status = Column(String(20), nullable=False)
    trial_started_at = Column(DateTime, nullable=True)
    trial_ends_at = Column(DateTime, nullable=True)
    current_period_start = Column(DateTime, nullable=False)
    current_period_end = Column(DateTime, nullable=False)
    grace_ends_at = Column(DateTime, nullable=True)
    cancel_at_period_end = Column(Boolean, nullable=False, server_default=text("false"))
    cancelled_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    provider = Column(String(30), nullable=True)
    provider_customer_id = Column(String(150), nullable=True)
    provider_subscription_id = Column(String(150), nullable=True, unique=True)
    entitlement_snapshot = Column(JSONB, nullable=False)

    organization = relationship("Organization", lazy="selectin")
    plan = relationship("SubscriptionPlan", lazy="selectin")


class SubscriptionEvent(Base):
    __tablename__ = "subscription_events"
    __table_args__ = (
        Index("ix_subscription_events_subscription_created", "subscription_id", "created_at"),
        {"schema": "organization"},
    )

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    subscription_id = Column(
        BigInteger, ForeignKey("organization.organization_subscriptions.id"), nullable=False,
    )
    event_type = Column(String(40), nullable=False)
    previous_status = Column(String(20), nullable=True)
    new_status = Column(String(20), nullable=False)
    provider_event_id = Column(String(150), nullable=True, unique=True)
    event_payload = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=text("CURRENT_TIMESTAMP"))
    created_by = Column(BigInteger, nullable=True)

    subscription = relationship("OrganizationSubscription", lazy="selectin")
