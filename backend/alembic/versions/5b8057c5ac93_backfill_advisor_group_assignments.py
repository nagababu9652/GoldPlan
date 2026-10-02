"""backfill advisor group assignments

Revision ID: 5b8057c5ac93
Revises: 17b1514df345
Create Date: 2026-10-02 05:43:59.449037

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = "5b8057c5ac93"
down_revision = "17b1514df345"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # The old group router granted access using primary_advisor_employee_id.
    # Preserve that intended access as explicit, live assignment data.
    op.execute("""
        INSERT INTO organization.employee_assignments
            (employee_id, assignment_type, entity_type, entity_id,
             effective_from, is_primary, is_active, remarks)
        SELECT group_row.primary_advisor_employee_id, 'ADVISOR',
               'CUSTOMER_GROUP', group_row.id, CURRENT_DATE, true, true,
               'Backfilled by 5b8057c5ac93'
        FROM crm.customer_groups AS group_row
        JOIN organization.employees AS employee
          ON employee.id = group_row.primary_advisor_employee_id
         AND employee.organization_id = group_row.organization_id
        WHERE group_row.deleted_at IS NULL
          AND group_row.primary_advisor_employee_id IS NOT NULL
          AND employee.deleted_at IS NULL
          AND NOT EXISTS (
              SELECT 1 FROM organization.employee_assignments AS existing
              WHERE existing.employee_id = employee.id
                AND existing.assignment_type = 'ADVISOR'
                AND existing.entity_type = 'CUSTOMER_GROUP'
                AND existing.entity_id = group_row.id
                AND existing.is_active IS TRUE
                AND existing.deleted_at IS NULL
                AND existing.effective_from <= CURRENT_DATE
                AND (existing.effective_to IS NULL OR existing.effective_to >= CURRENT_DATE)
          )
        ON CONFLICT DO NOTHING
    """)


def downgrade() -> None:
    op.execute("""
        DELETE FROM organization.employee_assignments
        WHERE assignment_type = 'ADVISOR'
          AND entity_type = 'CUSTOMER_GROUP'
          AND remarks = 'Backfilled by 5b8057c5ac93'
    """)
