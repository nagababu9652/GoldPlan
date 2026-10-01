"""add portal publications

Revision ID: a8e4d32f16b7
Revises: 7ca5c7241a11
Create Date: 2026-10-01
"""
from alembic import op
import sqlalchemy as sa

revision = "a8e4d32f16b7"
down_revision = "7ca5c7241a11"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("portal_publications",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("organization_id", sa.BigInteger(), nullable=False),
        sa.Column("customer_id", sa.BigInteger(), nullable=False),
        sa.Column("resource_type", sa.String(20), nullable=False),
        sa.Column("resource_id", sa.BigInteger(), nullable=False),
        sa.Column("published_by_user_id", sa.BigInteger(), nullable=False),
        sa.Column("published_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("revoked_by_user_id", sa.BigInteger(), nullable=True),
        sa.Column("revoked_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["organization_id"], ["organization.organizations.id"]),
        sa.ForeignKeyConstraint(["customer_id"], ["crm.customers.id"]),
        sa.ForeignKeyConstraint(["published_by_user_id"], ["identity.users.id"]),
        sa.ForeignKeyConstraint(["revoked_by_user_id"], ["identity.users.id"]),
        sa.PrimaryKeyConstraint("id"), schema="crm")
    op.create_index("ix_portal_publication_customer", "portal_publications",
        ["customer_id", "published_at"], schema="crm")
    op.create_index("uq_portal_publication_active", "portal_publications",
        ["customer_id", "resource_type", "resource_id"], unique=True, schema="crm",
        postgresql_where=sa.text("revoked_at IS NULL"))


def downgrade() -> None:
    op.drop_index("uq_portal_publication_active", table_name="portal_publications", schema="crm")
    op.drop_index("ix_portal_publication_customer", table_name="portal_publications", schema="crm")
    op.drop_table("portal_publications", schema="crm")
