"""add transaction history

Revision ID: 4f4e62608bd4
Revises: 70786ed5eae1
Create Date: 2026-09-26 00:14:24.432777
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4f4e62608bd4"
down_revision: Union[str, Sequence[str], None] = "70786ed5eae1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "transaction_history",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column("transaction_id", sa.BigInteger(), nullable=False),
        sa.Column("action", sa.String(length=20), nullable=False),
        sa.Column("changed_by", sa.BigInteger(), nullable=True),
        sa.Column("changed_at", sa.DateTime(), nullable=False),
        sa.Column("old_values", sa.JSON(), nullable=True),
        sa.Column("new_values", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(
            ["transaction_id"],
            ["crm.transactions.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        schema="crm",
    )

    op.create_index(
        "ix_crm_transaction_history_transaction_id",
        "transaction_history",
        ["transaction_id"],
        unique=False,
        schema="crm",
    )

    op.create_index(
        "ix_crm_transaction_history_action",
        "transaction_history",
        ["action"],
        unique=False,
        schema="crm",
    )

    op.create_index(
        "ix_crm_transaction_history_changed_by",
        "transaction_history",
        ["changed_by"],
        unique=False,
        schema="crm",
    )


def downgrade() -> None:
    op.drop_index(
        "ix_crm_transaction_history_changed_by",
        table_name="transaction_history",
        schema="crm",
    )

    op.drop_index(
        "ix_crm_transaction_history_action",
        table_name="transaction_history",
        schema="crm",
    )

    op.drop_index(
        "ix_crm_transaction_history_transaction_id",
        table_name="transaction_history",
        schema="crm",
    )

    op.drop_table(
        "transaction_history",
        schema="crm",
    )