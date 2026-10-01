"""add financial goals

Revision ID: 2f45d8c991ab
Revises: 13eecab33402
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "2f45d8c991ab"
down_revision: Union[str, Sequence[str], None] = "13eecab33402"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "financial_goals",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("organization_id", sa.BigInteger(), nullable=False),
        sa.Column("customer_id", sa.BigInteger(), nullable=True),
        sa.Column("customer_group_id", sa.BigInteger(), nullable=True),
        sa.Column("goal_type", sa.String(30), nullable=False),
        sa.Column("title", sa.String(250), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("target_amount", sa.Numeric(18, 2), nullable=False),
        sa.Column("current_amount", sa.Numeric(18, 2), nullable=False, server_default="0"),
        sa.Column("target_date", sa.Date(), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("expected_inflation_rate", sa.Numeric(7, 4), nullable=True),
        sa.Column("expected_return_rate", sa.Numeric(7, 4), nullable=True),
        sa.Column("status", sa.String(30), nullable=False, server_default="ACTIVE"),
        sa.Column("remarks", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("created_by", sa.BigInteger(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_by", sa.BigInteger(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("deleted_by", sa.BigInteger(), nullable=True),
        sa.Column("version_no", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.CheckConstraint("(customer_id IS NOT NULL) <> (customer_group_id IS NOT NULL)", name="ck_financial_goal_one_owner"),
        sa.CheckConstraint("target_amount > 0", name="ck_financial_goal_target_positive"),
        sa.CheckConstraint("current_amount >= 0", name="ck_financial_goal_current_nonnegative"),
        sa.CheckConstraint("priority BETWEEN 1 AND 5", name="ck_financial_goal_priority"),
        sa.ForeignKeyConstraint(["organization_id"], ["organization.organizations.id"]),
        sa.ForeignKeyConstraint(["customer_id"], ["crm.customers.id"]),
        sa.ForeignKeyConstraint(["customer_group_id"], ["crm.customer_groups.id"]),
        sa.PrimaryKeyConstraint("id"), schema="crm",
    )
    op.create_index("ix_financial_goals_customer", "financial_goals", ["customer_id", "is_active"], schema="crm")
    op.create_index("ix_financial_goals_group", "financial_goals", ["customer_group_id", "is_active"], schema="crm")


def downgrade() -> None:
    op.drop_index("ix_financial_goals_group", table_name="financial_goals", schema="crm")
    op.drop_index("ix_financial_goals_customer", table_name="financial_goals", schema="crm")
    op.drop_table("financial_goals", schema="crm")
