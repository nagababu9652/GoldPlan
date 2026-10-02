"""seed the CLIENT role and its portal permissions

Revision ID: f19a7c52b604
Revises: e62b51d94c07
Create Date: 2026-10-01
"""
from alembic import op
import sqlalchemy as sa

revision = "f19a7c52b604"
down_revision = "e62b51d94c07"
branch_labels = None
depends_on = None


def upgrade() -> None:
    connection = op.get_bind()
    connection.execute(sa.text("""
        INSERT INTO identity.roles
            (organization_id, role_code, role_name, description,
             is_system, is_default, is_active, version_no)
        SELECT NULL, 'CLIENT', 'Client Portal',
               'Read-only access to approved client portal content',
               true, false, true, 1
        WHERE NOT EXISTS (
            SELECT 1 FROM identity.roles
            WHERE role_code = 'CLIENT' AND organization_id IS NULL
        )
    """))
    connection.execute(sa.text("""
        INSERT INTO identity.permission_profiles
            (organization_id, profile_code, profile_name, description,
             is_active, version_no)
        SELECT NULL, 'CLIENT_PORTAL_STANDARD', 'Client Portal Standard',
               'Canonical system permission profile', true, 1
        WHERE NOT EXISTS (
            SELECT 1 FROM identity.permission_profiles
            WHERE profile_code = 'CLIENT_PORTAL_STANDARD'
              AND organization_id IS NULL
        )
    """))
    connection.execute(sa.text("""
        INSERT INTO identity.profile_permissions
            (profile_id, permission_id, allow_access)
        SELECT profile.id, permission.id, true
        FROM identity.permission_profiles AS profile
        JOIN identity.permissions AS permission
          ON permission.permission_code LIKE 'PORTAL.%'
        WHERE profile.profile_code = 'CLIENT_PORTAL_STANDARD'
          AND profile.organization_id IS NULL
          AND NOT EXISTS (
              SELECT 1 FROM identity.profile_permissions AS existing
              WHERE existing.profile_id = profile.id
                AND existing.permission_id = permission.id
          )
    """))
    connection.execute(sa.text("""
        INSERT INTO identity.role_permission_profiles
            (role_id, profile_id)
        SELECT role.id, profile.id
        FROM identity.roles AS role
        CROSS JOIN identity.permission_profiles AS profile
        WHERE role.role_code = 'CLIENT'
          AND role.is_active IS TRUE
          AND profile.profile_code = 'CLIENT_PORTAL_STANDARD'
          AND profile.organization_id IS NULL
          AND NOT EXISTS (
              SELECT 1 FROM identity.role_permission_profiles AS existing
              WHERE existing.role_id = role.id
                AND existing.profile_id = profile.id
          )
    """))


def downgrade() -> None:
    # Keep role and permission records: accepted invitations may depend on them.
    pass
