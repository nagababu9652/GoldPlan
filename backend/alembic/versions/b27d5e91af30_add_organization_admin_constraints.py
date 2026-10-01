"""add organization admin permissions and local uniqueness

Revision ID: b27d5e91af30
Revises: a13f4c8d92e1
"""
from alembic import op
import sqlalchemy as sa

revision = "b27d5e91af30"
down_revision = "a13f4c8d92e1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    connection = op.get_bind()
    for code in ("ORG.PROFILE.READ", "ORG.PROFILE.UPDATE"):
        connection.execute(sa.text("""
            INSERT INTO identity.permissions
                (permission_code, permission_name, module_name, description, is_system, is_active, version_no)
            VALUES (:code, :name, 'ORG', :description, true, true, 1)
            ON CONFLICT (permission_code) DO UPDATE SET is_active = true
        """), {"code": code, "name": code.replace(".", " ").title(), "description": f"Canonical {code} permission"})
    connection.execute(sa.text("""
        INSERT INTO identity.profile_permissions (profile_id, permission_id, allow_access)
        SELECT pp.id, p.id, true
        FROM identity.permission_profiles pp
        CROSS JOIN identity.permissions p
        WHERE pp.organization_id IS NULL AND pp.profile_code = 'HEAD_FULL'
          AND p.permission_code IN ('ORG.PROFILE.READ', 'ORG.PROFILE.UPDATE')
        ON CONFLICT (profile_id, permission_id) DO NOTHING
    """))
    op.create_unique_constraint("uq_branch_org_code", "branches", ["organization_id", "branch_code"], schema="organization")
    op.create_unique_constraint("uq_department_org_code", "departments", ["organization_id", "department_code"], schema="organization")
    op.create_unique_constraint("uq_designation_org_code", "designations", ["organization_id", "designation_code"], schema="organization")


def downgrade() -> None:
    op.drop_constraint("uq_designation_org_code", "designations", schema="organization", type_="unique")
    op.drop_constraint("uq_department_org_code", "departments", schema="organization", type_="unique")
    op.drop_constraint("uq_branch_org_code", "branches", schema="organization", type_="unique")
    connection = op.get_bind()
    connection.execute(sa.text("""
        DELETE FROM identity.profile_permissions pp USING identity.permissions p
        WHERE pp.permission_id = p.id AND p.permission_code IN ('ORG.PROFILE.READ', 'ORG.PROFILE.UPDATE')
    """))
    connection.execute(sa.text("""
        DELETE FROM identity.permissions WHERE permission_code IN ('ORG.PROFILE.READ', 'ORG.PROFILE.UPDATE')
    """))
