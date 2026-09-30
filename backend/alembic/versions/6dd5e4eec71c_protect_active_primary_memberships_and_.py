"""protect active primary memberships and group heads

Revision ID: 6dd5e4eec71c
Revises: cf623a90aef4
Create Date: 2026-09-30 11:06:19.716143

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6dd5e4eec71c'
down_revision: Union[str, Sequence[str], None] = 'cf623a90aef4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(
        "uq_group_member_active_primary",
        "group_members",
        ["customer_id"],
        unique=True,
        schema="crm",
        postgresql_where=sa.text("left_on IS NULL AND is_primary IS TRUE"),
    )
    op.create_index(
        "uq_group_member_active_head",
        "group_members",
        ["customer_group_id"],
        unique=True,
        schema="crm",
        postgresql_where=sa.text("left_on IS NULL AND is_group_head IS TRUE"),
    )


def downgrade() -> None:
    op.drop_index("uq_group_member_active_head", table_name="group_members", schema="crm")
    op.drop_index("uq_group_member_active_primary", table_name="group_members", schema="crm")
