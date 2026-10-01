"""add employee designation history

Revision ID: 3a4f0d27ce18
Revises: 293ecf16bd07
Create Date: 2026-10-01
"""
from alembic import op
import sqlalchemy as sa

revision = "3a4f0d27ce18"
down_revision = "293ecf16bd07"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "employee_designation_history",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("employee_id", sa.BigInteger(), nullable=False),
        sa.Column("designation_id", sa.BigInteger(), nullable=False),
        sa.Column("effective_from", sa.Date(), nullable=True),
        sa.Column("effective_to", sa.Date(), nullable=True),
        sa.Column("remarks", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["employee_id"], ["organization.employees.id"]),
        sa.ForeignKeyConstraint(["designation_id"], ["organization.designations.id"]),
        sa.PrimaryKeyConstraint("id"), schema="organization",
    )
    op.execute("""
        INSERT INTO organization.employee_designation_history
            (employee_id, designation_id, effective_from)
        SELECT e.id, e.designation_id, e.joining_date
        FROM organization.employees e
        WHERE e.deleted_at IS NULL
    """)
    op.create_index("uq_employee_designation_history_active", "employee_designation_history", ["employee_id"], unique=True, schema="organization", postgresql_where=sa.text("effective_to IS NULL"))


def downgrade() -> None:
    op.drop_index("uq_employee_designation_history_active", table_name="employee_designation_history", schema="organization")
    op.drop_table("employee_designation_history", schema="organization")
