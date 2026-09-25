"""add crm transactions

Revision ID: 044bfde6bd51
Revises: 1841067199ea
Create Date: 2026-09-13 18:00:55.921548

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "044bfde6bd51"
down_revision: Union[str, Sequence[str], None] = "1841067199ea"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create CRM transactions table."""

    op.create_table(
        "transactions",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column("customer_id", sa.BigInteger(), nullable=False),
        sa.Column("transaction_date", sa.Date(), nullable=False),
        sa.Column("transaction_type", sa.String(length=30), nullable=False),
        sa.Column("amount", sa.Numeric(precision=18, scale=2), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default="COMPLETED",
        ),
        sa.Column("reference_number", sa.String(length=100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("created_by", sa.BigInteger(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("updated_by", sa.BigInteger(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("deleted_by", sa.BigInteger(), nullable=True),
        sa.Column("version_no", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.ForeignKeyConstraint(
            ["customer_id"],
            ["crm.customers.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        schema="crm",
    )

    op.create_index(
        "ix_crm_transactions_customer_id",
        "transactions",
        ["customer_id"],
        unique=False,
        schema="crm",
    )

    op.create_index(
        "ix_crm_transactions_transaction_date",
        "transactions",
        ["transaction_date"],
        unique=False,
        schema="crm",
    )

    op.create_index(
        "ix_crm_transactions_transaction_type",
        "transactions",
        ["transaction_type"],
        unique=False,
        schema="crm",
    )

    op.create_index(
        "ix_crm_transactions_status",
        "transactions",
        ["status"],
        unique=False,
        schema="crm",
    )

    op.create_index(
        "ix_crm_transactions_reference_number",
        "transactions",
        ["reference_number"],
        unique=True,
        schema="crm",
    )


def downgrade() -> None:
    """Drop CRM transactions table."""

    op.drop_index(
        "ix_crm_transactions_reference_number",
        table_name="transactions",
        schema="crm",
    )

    op.drop_index(
        "ix_crm_transactions_status",
        table_name="transactions",
        schema="crm",
    )

    op.drop_index(
        "ix_crm_transactions_transaction_type",
        table_name="transactions",
        schema="crm",
    )

    op.drop_index(
        "ix_crm_transactions_transaction_date",
        table_name="transactions",
        schema="crm",
    )

    op.drop_index(
        "ix_crm_transactions_customer_id",
        table_name="transactions",
        schema="crm",
    )

    op.drop_table("transactions", schema="crm")