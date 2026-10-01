"""Canonical permission catalog and idempotent default profile seeding."""
from sqlalchemy.orm import Session

from ..models.identity.authorization import (
    Permission,
    PermissionProfile,
    ProfilePermission,
    Role,
    RolePermissionProfile,
)


PERMISSION_CODES = (
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

ADVISOR_PERMISSIONS = frozenset({
    "PROFILE.READ",
    "CLIENT.READ", "CLIENT.CREATE", "CLIENT.UPDATE",
    "GROUP.READ", "GROUP.CREATE", "GROUP.UPDATE",
    "TRANSACTION.READ", "TRANSACTION.CREATE", "TRANSACTION.UPDATE",
    "DOCUMENT.READ", "DOCUMENT.UPLOAD",
    "MEETING.READ", "MEETING.CREATE", "MEETING.UPDATE",
    "TASK.READ", "TASK.CREATE", "TASK.UPDATE",
    "GOAL.READ", "GOAL.CREATE", "GOAL.UPDATE",
    "ACCOUNT.READ", "ACCOUNT.CREATE", "ACCOUNT.UPDATE",
    "HOLDING.READ", "HOLDING.CREATE", "HOLDING.UPDATE",
    "REPORT.READ", "REPORT.GENERATE",
})

PROFILE_DEFINITIONS = {
    "HEAD_FULL": ("Head Full Access", frozenset(PERMISSION_CODES)),
    "FINANCIAL_ADVISOR_STANDARD": ("Financial Advisor Standard", ADVISOR_PERMISSIONS),
    "CLIENT_PORTAL_STANDARD": (
        "Client Portal Standard",
        frozenset(code for code in PERMISSION_CODES if code.startswith("PORTAL.")),
    ),
}


def _label(code: str) -> str:
    return code.replace(".", " ").replace("_", " ").title()


def ensure_permission_catalog(db: Session, *, assigned_by: int | None = None) -> dict[str, PermissionProfile]:
    """Create missing canonical permissions/profiles and repair their grants."""
    permissions = {}
    for code in PERMISSION_CODES:
        permission = db.query(Permission).filter(Permission.permission_code == code).first()
        if permission is None:
            permission = Permission(
                permission_code=code,
                permission_name=_label(code),
                module_name=code.split(".", 1)[0],
                description=f"Canonical {code} permission",
                created_by=assigned_by,
                updated_by=assigned_by,
                is_system=True,
                is_active=True,
            )
            db.add(permission)
            db.flush()
        permissions[code] = permission

    profiles = {}
    for profile_code, (profile_name, grants) in PROFILE_DEFINITIONS.items():
        profile = db.query(PermissionProfile).filter(
            PermissionProfile.profile_code == profile_code,
            PermissionProfile.organization_id.is_(None),
        ).first()
        if profile is None:
            profile = PermissionProfile(
                organization_id=None,
                profile_code=profile_code,
                profile_name=profile_name,
                description="Canonical system permission profile",
                created_by=assigned_by,
                updated_by=assigned_by,
                is_active=True,
            )
            db.add(profile)
            db.flush()
        profiles[profile_code] = profile
        for code in grants:
            link = db.query(ProfilePermission).filter(
                ProfilePermission.profile_id == profile.id,
                ProfilePermission.permission_id == permissions[code].id,
            ).first()
            if link is None:
                db.add(ProfilePermission(
                    profile_id=profile.id,
                    permission_id=permissions[code].id,
                    allow_access=True,
                ))
            elif not link.allow_access:
                # Explicit denials remain authoritative and are never overwritten.
                continue
    # System persona roles always carry their safe baseline profile. Individual
    # employee overrides and explicit denials remain authoritative.
    default_role_profiles = {
        "EMPLOYEE": "FINANCIAL_ADVISOR_STANDARD",
        "CLIENT": "CLIENT_PORTAL_STANDARD",
    }
    for role_code, profile_code in default_role_profiles.items():
        roles = db.query(Role).filter(
            Role.role_code == role_code, Role.is_active.is_(True),
        ).all()
        for role in roles:
            attach_default_profile(
                db, role, profiles[profile_code], assigned_by=assigned_by,
            )
    return profiles


def attach_default_profile(
    db: Session, role: Role, profile: PermissionProfile, *, assigned_by: int,
) -> None:
    link = db.query(RolePermissionProfile).filter(
        RolePermissionProfile.role_id == role.id,
        RolePermissionProfile.profile_id == profile.id,
    ).first()
    if link is None:
        db.add(RolePermissionProfile(
            role_id=role.id,
            profile_id=profile.id,
            assigned_by=assigned_by,
        ))
