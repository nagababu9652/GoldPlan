"""add transaction position values"""
from alembic import op
import sqlalchemy as sa
revision = "64dd8d21c320"
down_revision = "55ce71f6a120"
branch_labels = None
depends_on = None
def upgrade():
    op.add_column("transactions", sa.Column("quantity", sa.Numeric(24, 8)), schema="crm")
    op.add_column("transactions", sa.Column("unit_price", sa.Numeric(18, 4)), schema="crm")
def downgrade():
    op.drop_column("transactions", "unit_price", schema="crm")
    op.drop_column("transactions", "quantity", schema="crm")
