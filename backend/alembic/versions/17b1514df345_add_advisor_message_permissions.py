"""add advisor message permissions

Revision ID: 17b1514df345
Revises: 7eac361b92d0
Create Date: 2026-10-01 19:20:17.319371

"""
from alembic import op
import sqlalchemy as sa

revision = "17b1514df345"
down_revision = "7eac361b92d0"
branch_labels = None
depends_on = None

MESSAGE_PERMISSIONS = ("MESSAGE.READ", "MESSAGE.CREATE", "MESSAGE.UPDATE")
DEFAULT_PROFILES = ("HEAD_FULL", "FINANCIAL_ADVISOR_STANDARD")


def upgrade() -> None:
    connection = op.get_bind()
    for code in MESSAGE_PERMISSIONS:
        connection.execute(sa.text("""
            INSERT INTO identity.permissions
                (permission_code, permission_name, module_name, description,
                 is_system, is_active, version_no)
            VALUES (:code, :name, 'MESSAGE', :description, true, true, 1)
            ON CONFLICT (permission_code) DO NOTHING
        """), {"code": code, "name": code.replace(".", " ").title(),
               "description": f"Canonical {code} permission"})
    connection.execute(sa.text("""
        INSERT INTO identity.profile_permissions (profile_id, permission_id, allow_access)
        SELECT profile.id, permission.id, true
        FROM identity.permission_profiles AS profile
        CROSS JOIN identity.permissions AS permission
        WHERE profile.organization_id IS NULL
          AND profile.profile_code IN :profiles
          AND permission.permission_code IN :codes
        ON CONFLICT (profile_id, permission_id) DO NOTHING
    """).bindparams(sa.bindparam("profiles", expanding=True),
                     sa.bindparam("codes", expanding=True)),
        {"profiles": DEFAULT_PROFILES, "codes": MESSAGE_PERMISSIONS})


def downgrade() -> None:
    connection = op.get_bind()
    connection.execute(sa.text("""
        DELETE FROM identity.profile_permissions AS profile_grant
        USING identity.permission_profiles AS profile,
              identity.permissions AS permission
        WHERE profile_grant.profile_id = profile.id
          AND profile_grant.permission_id = permission.id
          AND profile.organization_id IS NULL
          AND profile.profile_code IN :profiles
          AND permission.permission_code IN :codes
    """).bindparams(sa.bindparam("profiles", expanding=True),
                     sa.bindparam("codes", expanding=True)),
        {"profiles": DEFAULT_PROFILES, "codes": MESSAGE_PERMISSIONS})
    connection.execute(sa.text("""
        DELETE FROM identity.permissions AS permission
        WHERE permission.permission_code IN :codes
          AND NOT EXISTS (
              SELECT 1 FROM identity.profile_permissions AS profile_grant
              WHERE profile_grant.permission_id = permission.id
          )
    """).bindparams(sa.bindparam("codes", expanding=True)),
        {"codes": MESSAGE_PERMISSIONS})
