"""attach default persona profiles

Revision ID: e62b51d94c07
Revises: d19f63a40b82
Create Date: 2026-10-01
"""
from alembic import op

revision = "e62b51d94c07"
down_revision = "d19f63a40b82"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        INSERT INTO identity.role_permission_profiles
            (role_id, profile_id, assigned_at, assigned_by)
        SELECT role.id, profile.id, CURRENT_TIMESTAMP, NULL
        FROM identity.roles role
        JOIN identity.permission_profiles profile
          ON profile.profile_code = CASE
              WHEN role.role_code = 'EMPLOYEE' THEN 'FINANCIAL_ADVISOR_STANDARD'
              WHEN role.role_code = 'CLIENT' THEN 'CLIENT_PORTAL_STANDARD'
          END
         AND profile.organization_id IS NULL
         AND profile.is_active IS TRUE
        WHERE role.role_code IN ('EMPLOYEE', 'CLIENT')
          AND role.is_active IS TRUE
          AND NOT EXISTS (
              SELECT 1 FROM identity.role_permission_profiles current
              WHERE current.role_id = role.id
                AND current.profile_id = profile.id
          )
    """)


def downgrade() -> None:
    op.execute("""
        DELETE FROM identity.role_permission_profiles link
        USING identity.roles role, identity.permission_profiles profile
        WHERE link.role_id = role.id
          AND link.profile_id = profile.id
          AND role.role_code IN ('EMPLOYEE', 'CLIENT')
          AND profile.profile_code IN ('FINANCIAL_ADVISOR_STANDARD', 'CLIENT_PORTAL_STANDARD')
          AND profile.organization_id IS NULL
    """)
