"""Add durable keys for retry-safe create requests.

Revision ID: c728f59fd8b1
Revises: 5b8057c5ac93
"""
from alembic import op
import sqlalchemy as sa


revision = "c728f59fd8b1"
down_revision = "5b8057c5ac93"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "idempotency_keys",
        sa.Column("key_hash", sa.String(64), primary_key=True),
        sa.Column("request_hash", sa.String(64), nullable=False),
        sa.Column("operation", sa.String(80), nullable=False),
        sa.Column("actor_scope", sa.String(100), nullable=False),
        sa.Column("resource_id", sa.BigInteger(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        schema="identity",
    )
    op.create_index("ix_idempotency_keys_expires_at", "idempotency_keys", ["expires_at"], schema="identity")


def downgrade() -> None:
    op.drop_index("ix_idempotency_keys_expires_at", table_name="idempotency_keys", schema="identity")
    op.drop_table("idempotency_keys", schema="identity")
