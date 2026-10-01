"""require branch type

Revision ID: 182dbe05ac96
Revises: 071cad94fb85
Create Date: 2026-10-01
"""
from alembic import op
import sqlalchemy as sa

revision = "182dbe05ac96"
down_revision = "071cad94fb85"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Treat the earliest branch in each organization as its head office. Any
    # additional legacy branch without a type becomes a normal branch.
    op.execute("""
        WITH ranked AS (
            SELECT id, row_number() OVER (PARTITION BY organization_id ORDER BY id) AS position
            FROM organization.branches
        )
        UPDATE organization.branches AS branch
        SET branch_type = CASE WHEN ranked.position = 1 THEN 'HEAD_OFFICE' ELSE 'BRANCH' END
        FROM ranked
        WHERE branch.id = ranked.id AND branch.branch_type IS NULL
    """)
    op.alter_column(
        "branches", "branch_type", schema="organization",
        existing_type=sa.String(length=50), nullable=False,
        server_default="BRANCH",
    )


def downgrade() -> None:
    op.alter_column(
        "branches", "branch_type", schema="organization",
        existing_type=sa.String(length=50), nullable=True,
        server_default=None,
    )
