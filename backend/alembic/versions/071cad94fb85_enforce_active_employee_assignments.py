"""enforce active employee assignments

Revision ID: 071cad94fb85
Revises: f61b9c83ea74
Create Date: 2026-10-01
"""
from alembic import op
import sqlalchemy as sa

revision = "071cad94fb85"
down_revision = "f61b9c83ea74"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "uq_employee_assignment_active", "employee_assignments",
        ["employee_id", "assignment_type", "entity_type", "entity_id"], unique=True,
        schema="organization",
        postgresql_where=sa.text("effective_to IS NULL AND is_active IS TRUE AND deleted_at IS NULL"),
    )


def downgrade() -> None:
    op.drop_index("uq_employee_assignment_active", table_name="employee_assignments", schema="organization")
