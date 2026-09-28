

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "4be56a4cb85c"
down_revision = "4f4e62608bd4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "customer_groups",
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        schema="crm",
    )

    op.add_column(
        "customer_groups",
        sa.Column("deleted_by", sa.BigInteger(), nullable=True),
        schema="crm",
    )


def downgrade() -> None:
    op.drop_column(
        "customer_groups",
        "deleted_by",
        schema="crm",
    )

    op.drop_column(
        "customer_groups",
        "deleted_at",
        schema="crm",
    )