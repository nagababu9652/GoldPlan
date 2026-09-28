"""add is_primary to group members"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "9691d15cda8f"
down_revision = "4be56a4cb85c"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "group_members",
        sa.Column("is_primary", sa.Boolean(), nullable=True),
        schema="crm",
    )


def downgrade() -> None:
    op.drop_column(
        "group_members",
        "is_primary",
        schema="crm",
    )