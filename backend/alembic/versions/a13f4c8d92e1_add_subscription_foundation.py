"""add organization subscription foundation

Revision ID: a13f4c8d92e1
Revises: 91ad7e60c2b4
"""
import json

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "a13f4c8d92e1"
down_revision = "91ad7e60c2b4"
branch_labels = None
depends_on = None

TRIAL_ENTITLEMENTS = {
    "features": [
        "FEATURE.CRM", "FEATURE.GROUPS", "FEATURE.TRANSACTIONS", "FEATURE.DOCUMENTS",
        "FEATURE.MEETINGS", "FEATURE.TASKS", "FEATURE.GOALS", "FEATURE.PORTFOLIO",
        "FEATURE.REPORTS", "FEATURE.EMPLOYEE_MANAGEMENT", "FEATURE.MULTI_BRANCH",
        "FEATURE.CLIENT_PORTAL",
    ],
    "limits": {
        "LIMIT.CLIENTS": 250, "LIMIT.EMPLOYEES": 25, "LIMIT.BRANCHES": 5,
        "LIMIT.STORAGE_BYTES": 10737418240, "LIMIT.REPORTS_PER_MONTH": 500,
    },
}


def audit_columns():
    return [
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("created_by", sa.BigInteger(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.Column("updated_by", sa.BigInteger(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("deleted_by", sa.BigInteger(), nullable=True),
        sa.Column("version_no", sa.Integer(), server_default=sa.text("1"), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
    ]


def upgrade() -> None:
    op.create_table(
        "subscription_plans",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("plan_code", sa.String(50), nullable=False),
        sa.Column("plan_name", sa.String(150), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("billing_interval", sa.String(20), nullable=False),
        sa.Column("price", sa.Numeric(18, 2), server_default=sa.text("0"), nullable=False),
        sa.Column("currency_code", sa.String(3), server_default=sa.text("'INR'"), nullable=False),
        sa.Column("entitlements", postgresql.JSONB(), nullable=False),
        *audit_columns(),
        sa.CheckConstraint(
            "billing_interval IN ('TRIAL','MONTHLY','QUARTERLY','ANNUAL')",
            name="ck_subscription_plan_interval",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("plan_code"),
        schema="organization",
    )
    op.create_table(
        "organization_subscriptions",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("organization_id", sa.BigInteger(), nullable=False),
        sa.Column("plan_id", sa.BigInteger(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("trial_started_at", sa.DateTime(), nullable=True),
        sa.Column("trial_ends_at", sa.DateTime(), nullable=True),
        sa.Column("current_period_start", sa.DateTime(), nullable=False),
        sa.Column("current_period_end", sa.DateTime(), nullable=False),
        sa.Column("grace_ends_at", sa.DateTime(), nullable=True),
        sa.Column("cancel_at_period_end", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("cancelled_at", sa.DateTime(), nullable=True),
        sa.Column("ended_at", sa.DateTime(), nullable=True),
        sa.Column("provider", sa.String(30), nullable=True),
        sa.Column("provider_customer_id", sa.String(150), nullable=True),
        sa.Column("provider_subscription_id", sa.String(150), nullable=True),
        sa.Column("entitlement_snapshot", postgresql.JSONB(), nullable=False),
        *audit_columns(),
        sa.CheckConstraint(
            "status IN ('TRIALING','ACTIVE','PAST_DUE','SUSPENDED','CANCELLED','EXPIRED')",
            name="ck_organization_subscription_status",
        ),
        sa.ForeignKeyConstraint(["organization_id"], ["organization.organizations.id"]),
        sa.ForeignKeyConstraint(["plan_id"], ["organization.subscription_plans.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("provider_subscription_id"),
        schema="organization",
    )
    op.create_index(
        "ix_organization_subscriptions_org_status",
        "organization_subscriptions", ["organization_id", "status"], schema="organization",
    )
    op.create_index(
        "uq_organization_subscription_current",
        "organization_subscriptions", ["organization_id"], unique=True, schema="organization",
        postgresql_where=sa.text("ended_at IS NULL AND deleted_at IS NULL"),
    )
    op.create_table(
        "subscription_events",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("organization_id", sa.BigInteger(), nullable=False),
        sa.Column("subscription_id", sa.BigInteger(), nullable=False),
        sa.Column("event_type", sa.String(40), nullable=False),
        sa.Column("previous_status", sa.String(20), nullable=True),
        sa.Column("new_status", sa.String(20), nullable=False),
        sa.Column("provider_event_id", sa.String(150), nullable=True),
        sa.Column("event_payload", postgresql.JSONB(), server_default=sa.text("'{}'::jsonb"), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("created_by", sa.BigInteger(), nullable=True),
        sa.ForeignKeyConstraint(["organization_id"], ["organization.organizations.id"]),
        sa.ForeignKeyConstraint(["subscription_id"], ["organization.organization_subscriptions.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("provider_event_id"),
        schema="organization",
    )
    op.create_index(
        "ix_subscription_events_subscription_created", "subscription_events",
        ["subscription_id", "created_at"], schema="organization",
    )

    connection = op.get_bind()
    snapshot = json.dumps(TRIAL_ENTITLEMENTS)
    connection.execute(sa.text("""
        INSERT INTO organization.subscription_plans
            (plan_code, plan_name, description, billing_interval, price, currency_code, entitlements)
        VALUES
            ('FOUNDATION_TRIAL', 'Foundation Trial',
             'Default trial for newly created organizations', 'TRIAL', 0, 'INR',
             CAST(:snapshot AS jsonb))
        ON CONFLICT (plan_code) DO NOTHING
    """), {"snapshot": snapshot})
    connection.execute(sa.text("""
        INSERT INTO organization.organization_subscriptions
            (organization_id, plan_id, status, trial_started_at, trial_ends_at,
             current_period_start, current_period_end, entitlement_snapshot)
        SELECT o.id, p.id, 'TRIALING', CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP + INTERVAL '30 days', CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP + INTERVAL '30 days', p.entitlements
        FROM organization.organizations o
        CROSS JOIN organization.subscription_plans p
        WHERE p.plan_code = 'FOUNDATION_TRIAL'
          AND o.deleted_at IS NULL
          AND NOT EXISTS (
              SELECT 1 FROM organization.organization_subscriptions s
              WHERE s.organization_id = o.id AND s.ended_at IS NULL AND s.deleted_at IS NULL
          )
    """))
    connection.execute(sa.text("""
        INSERT INTO organization.subscription_events
            (organization_id, subscription_id, event_type, new_status, event_payload)
        SELECT s.organization_id, s.id, 'TRIAL_STARTED', 'TRIALING',
               jsonb_build_object('plan_code', 'FOUNDATION_TRIAL', 'trial_days', 30,
                                  'source', 'migration_backfill')
        FROM organization.organization_subscriptions s
        JOIN organization.subscription_plans p ON p.id = s.plan_id
        WHERE p.plan_code = 'FOUNDATION_TRIAL'
          AND NOT EXISTS (
              SELECT 1 FROM organization.subscription_events e
              WHERE e.subscription_id = s.id AND e.event_type = 'TRIAL_STARTED'
          )
    """))


def downgrade() -> None:
    op.drop_index("ix_subscription_events_subscription_created", table_name="subscription_events", schema="organization")
    op.drop_table("subscription_events", schema="organization")
    op.drop_index("uq_organization_subscription_current", table_name="organization_subscriptions", schema="organization")
    op.drop_index("ix_organization_subscriptions_org_status", table_name="organization_subscriptions", schema="organization")
    op.drop_table("organization_subscriptions", schema="organization")
    op.drop_table("subscription_plans", schema="organization")
