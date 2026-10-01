"""add holdings

Revision ID: 46bd09fbe213
Revises: 3ac91f20de47
"""
from alembic import op
import sqlalchemy as sa
revision = "46bd09fbe213"
down_revision = "3ac91f20de47"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "holdings",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("financial_account_id", sa.BigInteger(), nullable=False),
        sa.Column("security_type", sa.String(40), nullable=False), sa.Column("security_name", sa.String(250), nullable=False),
        sa.Column("symbol", sa.String(50)), sa.Column("isin", sa.String(20)), sa.Column("folio_number", sa.String(100)),
        sa.Column("quantity", sa.Numeric(24, 8), nullable=False, server_default="0"),
        sa.Column("average_cost", sa.Numeric(18, 4), nullable=False, server_default="0"),
        sa.Column("current_price", sa.Numeric(18, 4), nullable=False, server_default="0"),
        sa.Column("valuation_as_of", sa.Date()), sa.Column("remarks", sa.Text()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")), sa.Column("created_by", sa.BigInteger()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP")), sa.Column("updated_by", sa.BigInteger()),
        sa.Column("deleted_at", sa.DateTime()), sa.Column("deleted_by", sa.BigInteger()),
        sa.Column("version_no", sa.Integer(), nullable=False, server_default="1"), sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.CheckConstraint("quantity >= 0 AND average_cost >= 0 AND current_price >= 0", name="ck_holding_nonnegative_values"),
        sa.ForeignKeyConstraint(["financial_account_id"], ["crm.financial_accounts.id"]), sa.PrimaryKeyConstraint("id"), schema="crm",
    )
    op.create_index("ix_holdings_account", "holdings", ["financial_account_id", "is_active"], schema="crm")

def downgrade():
    op.drop_index("ix_holdings_account", table_name="holdings", schema="crm")
    op.drop_table("holdings", schema="crm")
