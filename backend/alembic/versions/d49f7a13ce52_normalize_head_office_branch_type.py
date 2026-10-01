"""normalize legacy main branch type

Revision ID: d49f7a13ce52
Revises: c38e6f02bd41
"""
from alembic import op

revision = "d49f7a13ce52"
down_revision = "c38e6f02bd41"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.execute("UPDATE organization.branches SET branch_type = 'HEAD_OFFICE' WHERE branch_type = 'MAIN'")

def downgrade() -> None:
    op.execute("UPDATE organization.branches SET branch_type = 'MAIN' WHERE branch_type = 'HEAD_OFFICE'")
