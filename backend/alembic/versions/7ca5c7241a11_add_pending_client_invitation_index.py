"""add pending client invitation index

Revision ID: 7ca5c7241a11
Revises: 4b503e38df29
Create Date: 2026-10-01
"""
from alembic import op
import sqlalchemy as sa

revision = "7ca5c7241a11"
down_revision = "4b503e38df29"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "uq_client_access_invitation_pending", "access_invitations",
        ["customer_id", "invitation_type"], unique=True, schema="identity",
        postgresql_where=sa.text("accepted_at IS NULL AND revoked_at IS NULL"),
    )


def downgrade() -> None:
    op.drop_index("uq_client_access_invitation_pending", table_name="access_invitations", schema="identity")
