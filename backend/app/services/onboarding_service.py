from datetime import datetime, timezone
from sqlalchemy.orm import Session

from ..models.foundation.party import Party
from ..models.identity.authorization import Role, UserRole
from ..models.identity.security import AuditLog
from ..models.organization.core import Branch, Department, Designation, Organization
from ..models.organization.employee import Employee, EmployeeRole
from .permission_catalog import attach_default_profile, ensure_permission_catalog
from .subscription_service import create_trial_subscription


def build_organization_code(name: str) -> str:
    cleaned = "".join(ch for ch in name.upper() if ch.isalnum() or ch in {"-", "_", " "})
    parts = [part for part in cleaned.replace("_", " ").split() if part]
    return "-".join(parts).upper() or "ORG"


def build_branch_code(name: str) -> str:
    cleaned = "".join(ch for ch in name.upper() if ch.isalnum() or ch in {"-", "_", " "})
    parts = [part for part in cleaned.replace("_", " ").split() if part]
    return "-".join(parts).upper() or "BRANCH"


def _available_organization_code(db: Session, name: str) -> str:
    base = build_organization_code(name)[:24]
    code = base
    suffix = 2
    while db.query(Organization.id).filter(Organization.organization_code == code).first():
        code = f"{base[:24 - len(str(suffix))]}-{suffix}"
        suffix += 1
    return code


def bootstrap_head_organization(
    db: Session,
    *,
    organization_name: str,
    branch_name: str,
    party: Party,
    user_id: int,
    session_id: int,
) -> tuple[Organization, Branch, Employee, Role]:
    """Create one organization and its first Head for an unscoped verified user."""
    if party.organization_id is not None:
        raise ValueError("User already belongs to an organization")
    if db.query(Employee.id).filter(Employee.party_id == party.id).first():
        raise ValueError("User already has an employee identity")

    organization = Organization(
        organization_code=_available_organization_code(db, organization_name),
        legal_name=organization_name.strip(),
        trade_name=organization_name.strip(),
        email=party.email,
        phone=party.mobile_number,
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(organization)
    db.flush()

    branch = Branch(
        organization_id=organization.id,
        branch_code=build_branch_code(branch_name)[:30],
        branch_name=branch_name.strip(),
        branch_type="HEAD_OFFICE",
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(branch)
    db.flush()

    department = Department(
        organization_id=organization.id,
        branch_id=branch.id,
        department_code="LEADERSHIP",
        department_name="Leadership",
        created_by=user_id,
        updated_by=user_id,
    )
    designation = Designation(
        organization_id=organization.id,
        designation_code="HEAD",
        designation_name="Head",
        hierarchy_level=1,
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(department)
    db.add(designation)
    db.flush()

    employee = Employee(
        organization_id=organization.id,
        party_id=party.id,
        employee_code=f"HEAD-{organization.id:04d}",
        branch_id=branch.id,
        department_id=department.id,
        designation_id=designation.id,
        joining_date=datetime.now(timezone.utc).date(),
        employment_status="ACTIVE",
        official_email=party.email,
        official_mobile=party.mobile_number,
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(employee)
    db.flush()

    roles = []
    for code, name, description in (
        ("ORG_ADMIN", "Organization Head", "First Head created during verified organization bootstrap"),
        ("ADVISOR", "Advisor", "Compatibility role for advisor APIs during authorization migration"),
    ):
        role = Role(
            organization_id=organization.id,
            role_code=code,
            role_name=name,
            description=description,
            is_system=True,
            is_default=False,
            created_by=user_id,
            updated_by=user_id,
        )
        db.add(role)
        db.flush()
        roles.append(role)
        db.add(UserRole(
            user_id=user_id,
            role_id=role.id,
            assigned_by=user_id,
            is_primary=code == "ORG_ADMIN",
        ))
        db.add(EmployeeRole(
            employee_id=employee.id,
            role_id=role.id,
            effective_from=datetime.now(timezone.utc).date(),
            is_primary=code == "ORG_ADMIN",
            assigned_by=user_id,
        ))
    head_role = roles[0]
    profiles = ensure_permission_catalog(db, assigned_by=user_id)
    attach_default_profile(db, roles[0], profiles["HEAD_FULL"], assigned_by=user_id)
    attach_default_profile(
        db, roles[1], profiles["FINANCIAL_ADVISOR_STANDARD"], assigned_by=user_id,
    )
    subscription = create_trial_subscription(
        db, organization_id=organization.id, actor_user_id=user_id,
    )

    party.organization_id = organization.id
    party.updated_by = user_id
    db.add(AuditLog(
        organization_id=organization.id,
        user_id=user_id,
        module_name="ORGANIZATION",
        table_name="organizations",
        record_id=organization.id,
        action="BOOTSTRAP",
        new_values={
            "organization_id": organization.id,
            "employee_id": employee.id,
            "role_code": "ORG_ADMIN",
            "subscription_id": subscription.id,
            "subscription_status": subscription.status,
            "authorized_by_user_id": user_id,
        },
        session_id=session_id,
    ))
    return organization, branch, employee, head_role
