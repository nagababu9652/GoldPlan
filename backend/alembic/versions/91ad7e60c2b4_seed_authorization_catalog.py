"""seed canonical authorization catalog

Revision ID: 91ad7e60c2b4
Revises: 7b91f3e1a2c4
"""
from alembic import op
import sqlalchemy as sa

revision = "91ad7e60c2b4"
down_revision = "7b91f3e1a2c4"
branch_labels = None
depends_on = None


PERMISSIONS = (
    "PROFILE.READ",
    "CLIENT.READ", "CLIENT.CREATE", "CLIENT.UPDATE", "CLIENT.DEACTIVATE",
    "GROUP.READ", "GROUP.CREATE", "GROUP.UPDATE", "GROUP.DEACTIVATE",
    "TRANSACTION.READ", "TRANSACTION.CREATE", "TRANSACTION.UPDATE",
    "DOCUMENT.READ", "DOCUMENT.UPLOAD", "DOCUMENT.DELETE",
    "MEETING.READ", "MEETING.CREATE", "MEETING.UPDATE",
    "TASK.READ", "TASK.CREATE", "TASK.UPDATE",
    "GOAL.READ", "GOAL.CREATE", "GOAL.UPDATE",
    "ACCOUNT.READ", "ACCOUNT.CREATE", "ACCOUNT.UPDATE",
    "HOLDING.READ", "HOLDING.CREATE", "HOLDING.UPDATE",
    "REPORT.READ", "REPORT.GENERATE",
    "ORG.PROFILE.READ", "ORG.PROFILE.UPDATE",
    "ORG.BRANCH.READ", "ORG.BRANCH.CREATE", "ORG.BRANCH.UPDATE", "ORG.BRANCH.DEACTIVATE",
    "ORG.DEPARTMENT.READ", "ORG.DEPARTMENT.MANAGE",
    "ORG.DESIGNATION.READ", "ORG.DESIGNATION.MANAGE",
    "ORG.EMPLOYEE.READ", "ORG.EMPLOYEE.CREATE", "ORG.EMPLOYEE.UPDATE",
    "ORG.EMPLOYEE.DEACTIVATE", "ORG.EMPLOYEE.ACCESS_MANAGE",
    "ORG.PERMISSION.READ", "ORG.PERMISSION.MANAGE",
    "ORG.INVITATION.READ", "ORG.INVITATION.MANAGE", "ORG.AUDIT.READ",
    "ORG.ASSOCIATE.READ", "ORG.ASSOCIATE.CREATE", "ORG.ASSOCIATE.UPDATE", "ORG.ASSOCIATE.DEACTIVATE",
    "ORG.AGENCY.READ", "ORG.AGENCY.CREATE", "ORG.AGENCY.UPDATE", "ORG.AGENCY.DEACTIVATE",
    "ORG.ARN.READ", "ORG.ARN.CREATE", "ORG.ARN.UPDATE", "ORG.ARN.DEACTIVATE",
    "PORTAL.PROFILE.READ", "PORTAL.HOUSEHOLD.READ", "PORTAL.TRANSACTION.READ",
    "PORTAL.GOAL.READ", "PORTAL.INVESTMENT.READ", "PORTAL.REPORT.READ",
    "PORTAL.DOCUMENT.READ", "PORTAL.MESSAGE.READ",
)

ADVISOR_PERMISSIONS = (
    "PROFILE.READ", "CLIENT.READ", "CLIENT.CREATE", "CLIENT.UPDATE",
    "GROUP.READ", "GROUP.CREATE", "GROUP.UPDATE",
    "TRANSACTION.READ", "TRANSACTION.CREATE", "TRANSACTION.UPDATE",
    "DOCUMENT.READ", "DOCUMENT.UPLOAD",
    "MEETING.READ", "MEETING.CREATE", "MEETING.UPDATE",
    "TASK.READ", "TASK.CREATE", "TASK.UPDATE",
    "GOAL.READ", "GOAL.CREATE", "GOAL.UPDATE",
    "ACCOUNT.READ", "ACCOUNT.CREATE", "ACCOUNT.UPDATE",
    "HOLDING.READ", "HOLDING.CREATE", "HOLDING.UPDATE",
    "REPORT.READ", "REPORT.GENERATE",
)


def upgrade() -> None:
    connection = op.get_bind()
    for code in PERMISSIONS:
        connection.execute(sa.text("""
            INSERT INTO identity.permissions
                (permission_code, permission_name, module_name, description,
                 is_system, is_active, version_no)
            VALUES
                (:code, :name, :module, :description, true, true, 1)
            ON CONFLICT (permission_code) DO UPDATE SET
                permission_name = EXCLUDED.permission_name,
                module_name = EXCLUDED.module_name,
                description = EXCLUDED.description,
                is_active = true
        """), {
            "code": code,
            "name": code.replace(".", " ").replace("_", " ").title(),
            "module": code.split(".", 1)[0],
            "description": f"Canonical {code} permission",
        })

    for profile_code, profile_name in (
        ("HEAD_FULL", "Head Full Access"),
        ("FINANCIAL_ADVISOR_STANDARD", "Financial Advisor Standard"),
    ):
        connection.execute(sa.text("""
            INSERT INTO identity.permission_profiles
                (organization_id, profile_code, profile_name, description,
                 is_active, version_no)
            SELECT NULL, CAST(:code AS varchar), CAST(:name AS varchar),
                   'Canonical system permission profile', true, 1
            WHERE NOT EXISTS (
                SELECT 1 FROM identity.permission_profiles
                WHERE organization_id IS NULL AND profile_code = CAST(:code AS varchar)
            )
        """), {"code": profile_code, "name": profile_name})

    for profile_code, grants in (
        ("HEAD_FULL", PERMISSIONS),
        ("FINANCIAL_ADVISOR_STANDARD", ADVISOR_PERMISSIONS),
    ):
        connection.execute(sa.text("""
            INSERT INTO identity.profile_permissions (profile_id, permission_id, allow_access)
            SELECT pp.id, p.id, true
            FROM identity.permission_profiles pp
            JOIN identity.permissions p ON p.permission_code IN :grants
            WHERE pp.organization_id IS NULL AND pp.profile_code = :profile_code
            ON CONFLICT (profile_id, permission_id) DO NOTHING
        """).bindparams(sa.bindparam("grants", expanding=True)), {
            "profile_code": profile_code,
            "grants": tuple(grants),
        })

    connection.execute(sa.text("""
        INSERT INTO identity.role_permission_profiles (role_id, profile_id, assigned_by)
        SELECT r.id, pp.id, r.created_by
        FROM identity.roles r
        JOIN identity.permission_profiles pp
          ON pp.organization_id IS NULL
         AND pp.profile_code = CASE
             WHEN r.role_code = 'ORG_ADMIN' THEN 'HEAD_FULL'
             WHEN r.role_code = 'ADVISOR' THEN 'FINANCIAL_ADVISOR_STANDARD'
         END
        WHERE r.role_code IN ('ORG_ADMIN', 'ADVISOR')
        ON CONFLICT (role_id, profile_id) DO NOTHING
    """))


def downgrade() -> None:
    connection = op.get_bind()
    connection.execute(sa.text("""
        DELETE FROM identity.role_permission_profiles rpp
        USING identity.permission_profiles pp
        WHERE rpp.profile_id = pp.id
          AND pp.organization_id IS NULL
          AND pp.profile_code IN ('HEAD_FULL', 'FINANCIAL_ADVISOR_STANDARD')
    """))
    connection.execute(sa.text("""
        DELETE FROM identity.profile_permissions ppg
        USING identity.permission_profiles pp
        WHERE ppg.profile_id = pp.id
          AND pp.organization_id IS NULL
          AND pp.profile_code IN ('HEAD_FULL', 'FINANCIAL_ADVISOR_STANDARD')
    """))
    connection.execute(sa.text("""
        DELETE FROM identity.permission_profiles
        WHERE organization_id IS NULL
          AND profile_code IN ('HEAD_FULL', 'FINANCIAL_ADVISOR_STANDARD')
    """))
    connection.execute(sa.text("""
        DELETE FROM identity.permissions p
        WHERE p.permission_code IN :codes
          AND NOT EXISTS (
              SELECT 1 FROM identity.profile_permissions pp WHERE pp.permission_id = p.id
          )
    """).bindparams(sa.bindparam("codes", expanding=True)), {"codes": PERMISSIONS})
