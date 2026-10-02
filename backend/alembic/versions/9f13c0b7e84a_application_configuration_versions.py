"""Add versioned application configuration and Head permissions.

Revision ID: 9f13c0b7e84a
Revises: c728f59fd8b1
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


revision = "9f13c0b7e84a"
down_revision = "c728f59fd8b1"
branch_labels = None
depends_on = None

CONFIG_PERMISSIONS = ("ORG.CONFIG.READ", "ORG.CONFIG.UPDATE")


def upgrade() -> None:
    op.create_table(
        "application_configuration_versions",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("organization_id", sa.BigInteger(), sa.ForeignKey("organization.organizations.id"), nullable=False),
        sa.Column("section", sa.String(30), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("values", JSONB(), nullable=False),
        sa.Column("created_by", sa.BigInteger(), sa.ForeignKey("identity.users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("organization_id", "section", "version", name="uq_application_config_version"),
        schema="organization",
    )
    op.create_index(
        "ix_application_config_org_section_latest", "application_configuration_versions",
        ["organization_id", "section", "version"], schema="organization",
    )

    connection = op.get_bind()
    for code in CONFIG_PERMISSIONS:
        connection.execute(sa.text("""
            INSERT INTO identity.permissions
                (permission_code, permission_name, module_name, description,
                 is_system, is_active, version_no)
            VALUES (:code, :name, 'ORG', :description, true, true, 1)
            ON CONFLICT (permission_code) DO NOTHING
        """), {"code": code, "name": code.replace(".", " ").title(),
               "description": f"Canonical {code} permission"})
    connection.execute(sa.text("""
        INSERT INTO identity.profile_permissions (profile_id, permission_id, allow_access)
        SELECT profile.id, permission.id, true
        FROM identity.permission_profiles AS profile
        CROSS JOIN identity.permissions AS permission
        WHERE profile.organization_id IS NULL
          AND profile.profile_code = 'HEAD_FULL'
          AND permission.permission_code IN :codes
        ON CONFLICT (profile_id, permission_id) DO NOTHING
    """).bindparams(sa.bindparam("codes", expanding=True)), {"codes": CONFIG_PERMISSIONS})


def downgrade() -> None:
    connection = op.get_bind()
    connection.execute(sa.text("""
        DELETE FROM identity.profile_permissions AS profile_grant
        USING identity.permission_profiles AS profile,
              identity.permissions AS permission
        WHERE profile_grant.profile_id = profile.id
          AND profile_grant.permission_id = permission.id
          AND profile.organization_id IS NULL
          AND profile.profile_code = 'HEAD_FULL'
          AND permission.permission_code IN :codes
    """).bindparams(sa.bindparam("codes", expanding=True)), {"codes": CONFIG_PERMISSIONS})
    connection.execute(sa.text("""
        DELETE FROM identity.permissions AS permission
        WHERE permission.permission_code IN :codes
          AND NOT EXISTS (
              SELECT 1 FROM identity.profile_permissions AS profile_grant
              WHERE profile_grant.permission_id = permission.id
          )
    """).bindparams(sa.bindparam("codes", expanding=True)), {"codes": CONFIG_PERMISSIONS})
    op.drop_index("ix_application_config_org_section_latest",
                  table_name="application_configuration_versions", schema="organization")
    op.drop_table("application_configuration_versions", schema="organization")
