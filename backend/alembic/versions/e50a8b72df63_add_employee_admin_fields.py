"""add employee administration fields

Revision ID: e50a8b72df63
Revises: d49f7a13ce52
Create Date: 2026-10-01
"""
from alembic import op
import sqlalchemy as sa

revision = "e50a8b72df63"
down_revision = "d49f7a13ce52"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("employees", sa.Column("employment_type", sa.String(30), nullable=True), schema="organization")
    op.add_column("employees", sa.Column("remarks", sa.Text(), nullable=True), schema="organization")
    op.execute("UPDATE organization.employees SET employment_type = 'FULL_TIME' WHERE employment_type IS NULL")
    op.alter_column("employees", "employment_type", nullable=False, server_default="FULL_TIME", schema="organization")
    op.create_unique_constraint("uq_employee_org_code", "employees", ["organization_id", "employee_code"], schema="organization")


def downgrade() -> None:
    op.drop_constraint("uq_employee_org_code", "employees", schema="organization", type_="unique")
    op.drop_column("employees", "remarks", schema="organization")
    op.drop_column("employees", "employment_type", schema="organization")
