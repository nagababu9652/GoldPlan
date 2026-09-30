"""align master audit columns with models

Revision ID: 13eecab33402
Revises: 7ed7c088b0a9
Create Date: 2026-09-30 13:09:20.616858

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '13eecab33402'
down_revision: Union[str, Sequence[str], None] = '7ed7c088b0a9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    for table in ("currencies", "financial_years"):
        op.add_column(table, sa.Column("deleted_at", sa.DateTime(), nullable=True), schema="foundation")
        op.add_column(table, sa.Column("deleted_by", sa.BigInteger(), nullable=True), schema="foundation")


def downgrade() -> None:
    for table in ("financial_years", "currencies"):
        op.drop_column(table, "deleted_by", schema="foundation")
        op.drop_column(table, "deleted_at", schema="foundation")
