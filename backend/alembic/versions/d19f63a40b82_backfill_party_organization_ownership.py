"""backfill party organization ownership

Revision ID: d19f63a40b82
Revises: c45a981f2e73
Create Date: 2026-10-01
"""
from alembic import op

revision = "d19f63a40b82"
down_revision = "c45a981f2e73"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        WITH ownership AS (
            SELECT party_id, min(organization_id) AS organization_id
            FROM (
                SELECT party_id, organization_id FROM organization.employees
                WHERE deleted_at IS NULL
                UNION ALL
                SELECT party_id, organization_id FROM crm.customers
                WHERE deleted_at IS NULL
            ) linked
            GROUP BY party_id
            HAVING count(DISTINCT organization_id) = 1
        )
        UPDATE foundation.parties AS party
        SET organization_id = ownership.organization_id,
            updated_at = CURRENT_TIMESTAMP
        FROM ownership
        WHERE party.id = ownership.party_id
          AND party.organization_id IS NULL
    """)


def downgrade() -> None:
    # Ownership is corrected business data and must not be made ambiguous again.
    pass
