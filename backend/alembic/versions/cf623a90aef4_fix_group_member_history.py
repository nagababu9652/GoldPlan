"""fix group member history

Revision ID: cf623a90aef4
Revises: 1a1470864683
Create Date: 2026-09-30 10:33:45.659653

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cf623a90aef4'
down_revision: Union[str, Sequence[str], None] = '1a1470864683'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Allow separate membership periods for the same customer/group.
    op.drop_constraint(
        "uq_group_member",
        "group_members",
        schema="crm",
        type_="unique",
    )
    # Only one active membership per customer/group is allowed.
    op.create_index(
        "uq_group_member_active",
        "group_members",
        ["customer_group_id", "customer_id"],
        unique=True,
        schema="crm",
        postgresql_where=sa.text("left_on IS NULL"),
    )


def downgrade() -> None:
    op.drop_index(
        "uq_group_member_active",
        table_name="group_members",
        schema="crm",
    )
    op.create_unique_constraint(
        "uq_group_member",
        "group_members",
        ["customer_group_id", "customer_id"],
        schema="crm",
    )
