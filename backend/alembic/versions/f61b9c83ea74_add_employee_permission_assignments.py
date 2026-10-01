"""add employee permission assignments

Revision ID: f61b9c83ea74
Revises: e50a8b72df63
Create Date: 2026-10-01
"""
from alembic import op
import sqlalchemy as sa

revision = "f61b9c83ea74"
down_revision = "e50a8b72df63"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "employee_permission_profiles",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("organization_id", sa.BigInteger(), nullable=False),
        sa.Column("employee_id", sa.BigInteger(), nullable=False),
        sa.Column("profile_id", sa.BigInteger(), nullable=False),
        sa.Column("effective_from", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("effective_to", sa.DateTime(), nullable=True),
        sa.Column("assigned_by", sa.BigInteger(), nullable=False),
        sa.Column("assigned_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["employee_id"], ["organization.employees.id"]),
        sa.ForeignKeyConstraint(["profile_id"], ["identity.permission_profiles.id"]),
        sa.PrimaryKeyConstraint("id"), schema="identity",
    )
    op.create_index("uq_employee_permission_profile_active", "employee_permission_profiles", ["employee_id", "profile_id"], unique=True, schema="identity", postgresql_where=sa.text("effective_to IS NULL"))
    op.create_table(
        "employee_permission_overrides",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("organization_id", sa.BigInteger(), nullable=False),
        sa.Column("employee_id", sa.BigInteger(), nullable=False),
        sa.Column("permission_id", sa.BigInteger(), nullable=False),
        sa.Column("allow_access", sa.Boolean(), nullable=False),
        sa.Column("effective_from", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("effective_to", sa.DateTime(), nullable=True),
        sa.Column("assigned_by", sa.BigInteger(), nullable=False),
        sa.Column("assigned_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["employee_id"], ["organization.employees.id"]),
        sa.ForeignKeyConstraint(["permission_id"], ["identity.permissions.id"]),
        sa.PrimaryKeyConstraint("id"), schema="identity",
    )
    op.create_index("uq_employee_permission_override_active", "employee_permission_overrides", ["employee_id", "permission_id"], unique=True, schema="identity", postgresql_where=sa.text("effective_to IS NULL"))


def downgrade() -> None:
    op.drop_index("uq_employee_permission_override_active", table_name="employee_permission_overrides", schema="identity")
    op.drop_table("employee_permission_overrides", schema="identity")
    op.drop_index("uq_employee_permission_profile_active", table_name="employee_permission_profiles", schema="identity")
    op.drop_table("employee_permission_profiles", schema="identity")
