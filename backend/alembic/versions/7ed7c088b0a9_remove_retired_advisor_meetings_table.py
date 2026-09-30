"""remove retired advisor meetings table

Revision ID: 7ed7c088b0a9
Revises: 9781f0b971a5
Create Date: 2026-09-30 12:55:53.246358

"""
from typing import Sequence, Union

from alembic import context, op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7ed7c088b0a9'
down_revision: Union[str, Sequence[str], None] = '9781f0b971a5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if inspector.has_table("meetings", schema="advisor"):
        # Prevent writes between the data check and DROP. No CASCADE is used:
        # any unexpected dependency must stop the migration.
        bind.execute(sa.text("LOCK TABLE advisor.meetings IN ACCESS EXCLUSIVE MODE"))
        count = bind.scalar(sa.text("SELECT count(*) FROM advisor.meetings"))
        approved = context.get_x_argument(as_dictionary=True).get("drop_legacy_meetings")
        if count and approved != "true":
            raise RuntimeError(
                f"advisor.meetings contains {count} records. Back up and review them first; "
                "after approval run alembic -x drop_legacy_meetings=true upgrade head."
            )
        op.drop_table("meetings", schema="advisor")
    bind.execute(sa.text("DROP SCHEMA IF EXISTS advisor RESTRICT"))


def downgrade() -> None:
    raise RuntimeError(
        "Restore the advisor schema from the reviewed pg_dump archive, then stamp "
        "9781f0b971a5. An empty recreated table would not restore legacy meeting data."
    )
