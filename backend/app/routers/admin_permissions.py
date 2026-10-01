from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.identity.authorization import (
    EmployeePermissionOverride, EmployeePermissionProfile, Permission, PermissionProfile,
)
from ..models.identity.security import AuditLog
from ..models.crm.customer import Customer, CustomerGroup
from ..models.foundation.party import Party
from ..models.organization.assignment import EmployeeAssignment
from ..models.organization.core import Branch
from ..models.organization.employee import Employee
from ..schemas.permission_admin import (
    AssignmentEndInput, EmployeeActivityResponse, EmployeeAssignmentInput, EmployeeAssignmentResponse,
    EmployeeOverrideSet, EmployeePermissionState, EmployeeProfileSet,
    PermissionItem, PermissionOverrideInput, PermissionProfileItem,
)
from ..services.access import AccessContext, require_head, require_permission

router = APIRouter(prefix="/admin/access", tags=["admin-permissions"])


def manage_dependencies():
    return [Depends(require_head), Depends(require_permission("ORG.PERMISSION.MANAGE"))]


def read_dependencies():
    return [Depends(require_head), Depends(require_permission("ORG.PERMISSION.READ"))]


def employee_in_organization(db, employee_id, organization_id):
    employee = db.query(Employee).filter(
        Employee.id == employee_id, Employee.organization_id == organization_id,
        Employee.deleted_at.is_(None),
    ).first()
    if employee is None:
        raise HTTPException(404, "Employee not found")
    return employee


def reject_self_change(context, employee_id):
    if context.employee_id == employee_id:
        raise HTTPException(409, "You cannot change your own permission grants")


def audit(db, context, employee_id, action, values):
    db.add(AuditLog(
        organization_id=context.organization_id, user_id=context.user_id,
        module_name="AUTHORIZATION", table_name="employees", record_id=employee_id,
        action=action, new_values=values, session_id=context.session_id,
    ))


@router.get("/permissions", response_model=list[PermissionItem], dependencies=read_dependencies())
def list_permissions(context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return db.query(Permission).filter(Permission.is_active.is_(True)).order_by(Permission.module_name, Permission.permission_code).all()


@router.get("/profiles", response_model=list[PermissionProfileItem], dependencies=read_dependencies())
def list_profiles(context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return db.query(PermissionProfile).filter(
        PermissionProfile.is_active.is_(True),
        or_(PermissionProfile.organization_id.is_(None), PermissionProfile.organization_id == context.organization_id),
    ).order_by(PermissionProfile.profile_name).all()


@router.get("/employees/{employee_id}", response_model=EmployeePermissionState, dependencies=read_dependencies())
def get_employee_permissions(employee_id: int, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    employee_in_organization(db, employee_id, context.organization_id)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    profiles = db.query(PermissionProfile).join(
        EmployeePermissionProfile, EmployeePermissionProfile.profile_id == PermissionProfile.id,
    ).filter(
        EmployeePermissionProfile.employee_id == employee_id,
        EmployeePermissionProfile.organization_id == context.organization_id,
        EmployeePermissionProfile.effective_from <= now,
        or_(EmployeePermissionProfile.effective_to.is_(None), EmployeePermissionProfile.effective_to > now),
    ).all()
    override_rows = db.query(Permission.permission_code, EmployeePermissionOverride.allow_access).join(
        EmployeePermissionOverride, EmployeePermissionOverride.permission_id == Permission.id,
    ).filter(
        EmployeePermissionOverride.employee_id == employee_id,
        EmployeePermissionOverride.organization_id == context.organization_id,
        EmployeePermissionOverride.effective_from <= now,
        or_(EmployeePermissionOverride.effective_to.is_(None), EmployeePermissionOverride.effective_to > now),
    ).all()
    return EmployeePermissionState(
        employee_id=employee_id, profiles=profiles,
        overrides=[PermissionOverrideInput(permission_code=code, allow_access=allow) for code, allow in override_rows],
    )


@router.put("/employees/{employee_id}/profiles", response_model=EmployeePermissionState, dependencies=manage_dependencies())
def set_employee_profiles(employee_id: int, payload: EmployeeProfileSet, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    employee_in_organization(db, employee_id, context.organization_id); reject_self_change(context, employee_id)
    profile_ids = set(payload.profile_ids)
    profiles = db.query(PermissionProfile).filter(
        PermissionProfile.id.in_(profile_ids), PermissionProfile.is_active.is_(True),
        or_(PermissionProfile.organization_id.is_(None), PermissionProfile.organization_id == context.organization_id),
    ).all() if profile_ids else []
    if len(profiles) != len(profile_ids):
        raise HTTPException(422, "One or more permission profiles are unavailable")
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    current = db.query(EmployeePermissionProfile).filter(
        EmployeePermissionProfile.employee_id == employee_id,
        EmployeePermissionProfile.organization_id == context.organization_id,
        EmployeePermissionProfile.effective_to.is_(None),
    ).all()
    current_ids = {row.profile_id for row in current}
    for row in current:
        if row.profile_id not in profile_ids: row.effective_to = now
    for profile_id in profile_ids - current_ids:
        db.add(EmployeePermissionProfile(organization_id=context.organization_id, employee_id=employee_id,
                                         profile_id=profile_id, effective_from=now, assigned_by=context.user_id))
    audit(db, context, employee_id, "SET_PERMISSION_PROFILES", {"profile_ids": sorted(profile_ids)})
    db.commit()
    return get_employee_permissions(employee_id, context, db)


@router.put("/employees/{employee_id}/overrides", response_model=EmployeePermissionState, dependencies=manage_dependencies())
def set_employee_overrides(employee_id: int, payload: EmployeeOverrideSet, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    employee_in_organization(db, employee_id, context.organization_id); reject_self_change(context, employee_id)
    requested = {item.permission_code: item.allow_access for item in payload.overrides}
    if len(requested) != len(payload.overrides): raise HTTPException(422, "Duplicate permission override")
    permissions = db.query(Permission).filter(Permission.permission_code.in_(requested), Permission.is_active.is_(True)).all() if requested else []
    if len(permissions) != len(requested): raise HTTPException(422, "One or more permissions are unavailable")
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    for row in db.query(EmployeePermissionOverride).filter(
        EmployeePermissionOverride.employee_id == employee_id,
        EmployeePermissionOverride.organization_id == context.organization_id,
        EmployeePermissionOverride.effective_to.is_(None),
    ).all(): row.effective_to = now
    for permission in permissions:
        db.add(EmployeePermissionOverride(organization_id=context.organization_id, employee_id=employee_id,
                                          permission_id=permission.id, allow_access=requested[permission.permission_code],
                                          effective_from=now, assigned_by=context.user_id))
    audit(db, context, employee_id, "SET_PERMISSION_OVERRIDES", {"overrides": payload.model_dump(mode="json")["overrides"]})
    db.commit()
    return get_employee_permissions(employee_id, context, db)


def assignment_target(db, organization_id, entity_type, entity_id):
    if entity_type == "CUSTOMER":
        row = db.query(Customer).filter(Customer.id == entity_id, Customer.organization_id == organization_id,
                                        Customer.deleted_at.is_(None)).first()
        if row:
            party = db.query(Party).filter(Party.id == row.party_id).first()
            return party.display_name if party else row.customer_code
    elif entity_type == "CUSTOMER_GROUP":
        row = db.query(CustomerGroup).filter(CustomerGroup.id == entity_id,
                                             CustomerGroup.organization_id == organization_id,
                                             CustomerGroup.deleted_at.is_(None)).first()
        if row: return row.group_name
    elif entity_type == "BRANCH":
        row = db.query(Branch).filter(Branch.id == entity_id, Branch.organization_id == organization_id,
                                      Branch.deleted_at.is_(None)).first()
        if row: return row.branch_name
    raise HTTPException(404, "Assignment target not found")


def assignment_response(db, row):
    values = {column.name: getattr(row, column.name) for column in EmployeeAssignment.__table__.columns}
    values["entity_name"] = assignment_target(db, row.employee.organization_id, row.entity_type, row.entity_id)
    return EmployeeAssignmentResponse.model_validate(values)


@router.get("/employees/{employee_id}/assignments", response_model=list[EmployeeAssignmentResponse], dependencies=read_dependencies())
def list_employee_assignments(employee_id: int, include_history: bool = True, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    employee_in_organization(db, employee_id, context.organization_id)
    query = db.query(EmployeeAssignment).filter(EmployeeAssignment.employee_id == employee_id,
                                                EmployeeAssignment.deleted_at.is_(None))
    if not include_history:
        query = query.filter(EmployeeAssignment.is_active.is_(True), EmployeeAssignment.effective_to.is_(None))
    return [assignment_response(db, row) for row in query.order_by(EmployeeAssignment.effective_from.desc()).all()]


@router.post("/employees/{employee_id}/assignments", response_model=EmployeeAssignmentResponse, status_code=201, dependencies=manage_dependencies())
def create_employee_assignment(employee_id: int, payload: EmployeeAssignmentInput, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    employee_in_organization(db, employee_id, context.organization_id)
    entity_name = assignment_target(db, context.organization_id, payload.entity_type, payload.entity_id)
    existing = db.query(EmployeeAssignment).filter(
        EmployeeAssignment.employee_id == employee_id, EmployeeAssignment.assignment_type == "ADVISOR",
        EmployeeAssignment.entity_type == payload.entity_type, EmployeeAssignment.entity_id == payload.entity_id,
        EmployeeAssignment.is_active.is_(True), EmployeeAssignment.effective_to.is_(None),
        EmployeeAssignment.deleted_at.is_(None),
    ).first()
    if existing: raise HTTPException(409, "This assignment is already active")
    row = EmployeeAssignment(employee_id=employee_id, assignment_type="ADVISOR",
                             **payload.model_dump(), created_by=context.user_id, updated_by=context.user_id)
    db.add(row); db.flush(); audit(db, context, employee_id, "CREATE_ASSIGNMENT", {"assignment_id": row.id, "entity_type": row.entity_type, "entity_id": row.entity_id})
    db.commit(); db.refresh(row)
    values = {column.name: getattr(row, column.name) for column in EmployeeAssignment.__table__.columns}; values["entity_name"] = entity_name
    return EmployeeAssignmentResponse.model_validate(values)


@router.post("/employees/{employee_id}/assignments/{assignment_id}/end", response_model=EmployeeAssignmentResponse, dependencies=manage_dependencies())
def end_employee_assignment(employee_id: int, assignment_id: int, payload: AssignmentEndInput, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    employee_in_organization(db, employee_id, context.organization_id)
    row = db.query(EmployeeAssignment).filter(EmployeeAssignment.id == assignment_id,
                                              EmployeeAssignment.employee_id == employee_id,
                                              EmployeeAssignment.is_active.is_(True),
                                              EmployeeAssignment.effective_to.is_(None),
                                              EmployeeAssignment.deleted_at.is_(None)).first()
    if row is None: raise HTTPException(404, "Active assignment not found")
    if payload.effective_to < row.effective_from: raise HTTPException(422, "Assignment end cannot precede its start")
    row.effective_to = payload.effective_to; row.is_active = False; row.updated_by = context.user_id
    audit(db, context, employee_id, "END_ASSIGNMENT", {"assignment_id": row.id, "effective_to": payload.effective_to.isoformat()})
    db.commit(); db.refresh(row); return assignment_response(db, row)


@router.get("/employees/{employee_id}/activity", response_model=list[EmployeeActivityResponse], dependencies=[Depends(require_head), Depends(require_permission("ORG.AUDIT.READ"))])
def employee_activity(employee_id: int, limit: int = 100, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    employee_in_organization(db, employee_id, context.organization_id)
    rows = db.query(AuditLog).filter(
        AuditLog.organization_id == context.organization_id,
        AuditLog.table_name == "employees", AuditLog.record_id == employee_id,
    ).order_by(AuditLog.created_at.desc()).limit(min(max(limit, 1), 250)).all()
    return [EmployeeActivityResponse(
        id=row.id, actor_user_id=row.user_id,
        actor_name=(row.user.display_name or row.user.email) if row.user else None,
        module_name=row.module_name, action=row.action,
        old_values=row.old_values, new_values=row.new_values, created_at=row.created_at,
    ) for row in rows]
