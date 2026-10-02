"""baseline current database

Revision ID: 1841067199ea
Revises: 
Create Date: 2026-09-12 16:05:00.917509

"""
from typing import Sequence, Union
from pathlib import Path

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1841067199ea'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Install the pre-Alembic schema on an empty database.

    Existing installations already stamped at this revision are unaffected.
    The SQL is the original schema definition, without its destructive reset
    section or development seed data. Foundational reference values are included.
    """
    schema = Path(__file__).resolve().parents[1] / "baseline_schema.sql"
    op.get_bind().connection.cursor().execute(schema.read_text(encoding="utf-8"), prepare=False)


def downgrade() -> None:
    """Downgrade schema."""
    pass
