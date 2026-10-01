"""reconcile organization administration fields

Revision ID: c38e6f02bd41
Revises: b27d5e91af30
"""
from alembic import op
import sqlalchemy as sa

revision = "c38e6f02bd41"
down_revision = "b27d5e91af30"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("organizations", sa.Column("organization_type", sa.String(50)), schema="organization")
    op.add_column("organizations", sa.Column("financial_year_start", sa.String(5)), schema="organization")
    op.add_column("organizations", sa.Column("default_currency_code", sa.String(3), server_default="INR", nullable=False), schema="organization")
    op.add_column("organizations", sa.Column("timezone", sa.String(100), server_default="Asia/Kolkata", nullable=False), schema="organization")
    for name, column in (
        ("address", sa.Text()), ("city", sa.String(100)), ("district", sa.String(100)),
        ("state", sa.String(100)), ("postal_code", sa.String(15)),
        ("opening_date", sa.Date()), ("closing_date", sa.Date()), ("remarks", sa.Text()),
    ):
        op.add_column("branches", sa.Column(name, column), schema="organization")
    op.add_column("branches", sa.Column("country", sa.String(100), server_default="India", nullable=False), schema="organization")
    op.add_column("departments", sa.Column("head_employee_id", sa.BigInteger()), schema="organization")
    op.create_foreign_key("fk_department_head_employee", "departments", "employees", ["head_employee_id"], ["id"], source_schema="organization", referent_schema="organization")


def downgrade() -> None:
    op.drop_constraint("fk_department_head_employee", "departments", schema="organization", type_="foreignkey")
    op.drop_column("departments", "head_employee_id", schema="organization")
    for name in ("country", "remarks", "closing_date", "opening_date", "postal_code", "state", "district", "city", "address"):
        op.drop_column("branches", name, schema="organization")
    for name in ("timezone", "default_currency_code", "financial_year_start", "organization_type"):
        op.drop_column("organizations", name, schema="organization")
