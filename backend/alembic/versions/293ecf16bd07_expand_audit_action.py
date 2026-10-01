"""expand audit action

Revision ID: 293ecf16bd07
Revises: 182dbe05ac96
Create Date: 2026-10-01
"""
from alembic import op
import sqlalchemy as sa

revision = "293ecf16bd07"
down_revision = "182dbe05ac96"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("audit_logs", "action", schema="identity", existing_type=sa.String(20), type_=sa.String(50), existing_nullable=True)


def downgrade() -> None:
    op.alter_column("audit_logs", "action", schema="identity", existing_type=sa.String(50), type_=sa.String(20), existing_nullable=True)
