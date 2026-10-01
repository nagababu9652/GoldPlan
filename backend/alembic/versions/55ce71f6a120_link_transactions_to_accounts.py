"""link transactions to accounts and holdings"""
from alembic import op
import sqlalchemy as sa
revision = "55ce71f6a120"
down_revision = "46bd09fbe213"
branch_labels = None
depends_on = None
def upgrade():
    op.add_column("transactions", sa.Column("financial_account_id", sa.BigInteger()), schema="crm")
    op.add_column("transactions", sa.Column("holding_id", sa.BigInteger()), schema="crm")
    op.create_foreign_key("fk_transaction_account", "transactions", "financial_accounts", ["financial_account_id"], ["id"], source_schema="crm", referent_schema="crm")
    op.create_foreign_key("fk_transaction_holding", "transactions", "holdings", ["holding_id"], ["id"], source_schema="crm", referent_schema="crm")
def downgrade():
    op.drop_constraint("fk_transaction_holding", "transactions", schema="crm", type_="foreignkey")
    op.drop_constraint("fk_transaction_account", "transactions", schema="crm", type_="foreignkey")
    op.drop_column("transactions", "holding_id", schema="crm")
    op.drop_column("transactions", "financial_account_id", schema="crm")
