"""add financial accounts

Revision ID: 3ac91f20de47
Revises: 2f45d8c991ab
"""
from alembic import op
import sqlalchemy as sa

revision = "3ac91f20de47"
down_revision = "2f45d8c991ab"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "financial_accounts",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("organization_id", sa.BigInteger(), nullable=False),
        sa.Column("customer_id", sa.BigInteger(), nullable=True),
        sa.Column("customer_group_id", sa.BigInteger(), nullable=True),
        sa.Column("account_type", sa.String(40), nullable=False),
        sa.Column("account_nature", sa.String(20), nullable=False),
        sa.Column("account_name", sa.String(250), nullable=False),
        sa.Column("institution_name", sa.String(250), nullable=True),
        sa.Column("account_number_masked", sa.String(100), nullable=True),
        sa.Column("currency_code", sa.String(3), nullable=False, server_default="INR"),
        sa.Column("current_balance", sa.Numeric(18, 2), nullable=False, server_default="0"),
        sa.Column("valuation_as_of", sa.Date(), nullable=True),
        sa.Column("opened_on", sa.Date(), nullable=True),
        sa.Column("maturity_date", sa.Date(), nullable=True),
        sa.Column("interest_rate", sa.Numeric(7, 4), nullable=True),
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
        sa.CheckConstraint("(customer_id IS NOT NULL) <> (customer_group_id IS NOT NULL)", name="ck_financial_account_one_owner"),
        sa.CheckConstraint("current_balance >= 0", name="ck_financial_account_balance_nonnegative"),
        sa.ForeignKeyConstraint(["organization_id"], ["organization.organizations.id"]),
        sa.ForeignKeyConstraint(["customer_id"], ["crm.customers.id"]),
        sa.ForeignKeyConstraint(["customer_group_id"], ["crm.customer_groups.id"]),
        sa.PrimaryKeyConstraint("id"), schema="crm",
    )
    op.create_index("ix_financial_accounts_customer", "financial_accounts", ["customer_id", "is_active"], schema="crm")
    op.create_index("ix_financial_accounts_group", "financial_accounts", ["customer_group_id", "is_active"], schema="crm")


def downgrade() -> None:
    op.drop_index("ix_financial_accounts_group", table_name="financial_accounts", schema="crm")
    op.drop_index("ix_financial_accounts_customer", table_name="financial_accounts", schema="crm")
    op.drop_table("financial_accounts", schema="crm")
