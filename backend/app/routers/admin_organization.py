from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.identity.security import AuditLog
from ..models.organization.core import Branch, Department, Designation, Organization
from ..models.organization.employee import Employee
from ..schemas.organization_admin import (
    BranchInput, BranchResponse, BranchUpdate, DepartmentInput, DepartmentResponse,
    DepartmentUpdate, DesignationInput, DesignationResponse, DesignationUpdate,
    OrganizationResponse, OrganizationUpdate,
)
from ..schemas.bulk_status import BulkStatusChange
from ..services.access import AccessContext, require_head, require_permission
from ..services.idempotency import reserve_create, finish_create

router = APIRouter(prefix="/admin/organization", tags=["admin-organization"])


def head_permission(code: str):
    return [Depends(require_head), Depends(require_permission(code))]


def audit(db, context, table, record_id, action, old, new):
    db.add(AuditLog(
        organization_id=context.organization_id, user_id=context.user_id,
        module_name="ORGANIZATION", table_name=table, record_id=record_id,
        action=action, old_values=old, new_values=new, session_id=context.session_id,
    ))


def scoped(db, model, record_id, org_id):
    item = db.query(model).filter(model.id == record_id, model.organization_id == org_id).first()
    if item is None: raise HTTPException(404, "Record not found")
    return item


def validate_department_head(db, employee_id, org_id):
    if employee_id is None: return
    employee = db.query(Employee).filter(
        Employee.id == employee_id, Employee.organization_id == org_id,
        Employee.is_active.is_(True), Employee.deleted_at.is_(None),
        Employee.employment_status == "ACTIVE",
    ).first()
    if employee is None: raise HTTPException(400, "Department head must be an active employee in this organization")


def commit(db):
    try: db.commit()
    except Exception:
        db.rollback(); raise


@router.get("", response_model=OrganizationResponse, dependencies=head_permission("ORG.PROFILE.READ"))
def get_organization(context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return db.query(Organization).filter(Organization.id == context.organization_id).first()


@router.put("", response_model=OrganizationResponse, dependencies=head_permission("ORG.PROFILE.UPDATE"))
def update_organization(payload: OrganizationUpdate, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    item = db.query(Organization).filter(Organization.id == context.organization_id).with_for_update().first()
    old = {key: getattr(item, key) for key in payload.model_fields_set}
    for key, value in payload.model_dump(exclude_unset=True).items(): setattr(item, key, value)
    item.updated_by = context.user_id
    audit(db, context, "organizations", item.id, "UPDATE", old, payload.model_dump(exclude_unset=True, mode="json"))
    commit(db); db.refresh(item); return item


@router.get("/branches", response_model=list[BranchResponse], dependencies=head_permission("ORG.BRANCH.READ"))
def list_branches(include_inactive: bool = False, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    query = db.query(Branch).filter(Branch.organization_id == context.organization_id, Branch.deleted_at.is_(None))
    if not include_inactive: query = query.filter(Branch.is_active.is_(True))
    return query.order_by(Branch.branch_name).all()


@router.post("/branches", response_model=BranchResponse, status_code=201, dependencies=head_permission("ORG.BRANCH.CREATE"))
def create_branch(payload: BranchInput, context: AccessContext = Depends(require_head), db: Session = Depends(get_db),
                  idempotency_key: str | None = Header(default=None)):
    reservation = reserve_create(db, key=idempotency_key, operation="branch.create",
        actor_scope=f"org:{context.organization_id}:user:{context.user_id}", payload=payload.model_dump(mode="json"))
    if reservation and reservation.replay:
        return scoped(db, Branch, reservation.resource_id, context.organization_id)
    code = payload.branch_code.strip().upper()
    if db.query(Branch.id).filter(Branch.organization_id == context.organization_id, Branch.branch_code == code).first(): raise HTTPException(409, "Branch code already exists")
    context.check_limit("LIMIT.BRANCHES", db.query(Branch).filter(Branch.organization_id == context.organization_id, Branch.is_active.is_(True), Branch.deleted_at.is_(None)).count())
    if payload.parent_branch_id: scoped(db, Branch, payload.parent_branch_id, context.organization_id)
    item = Branch(organization_id=context.organization_id, **(payload.model_dump() | {"branch_code": code}), created_by=context.user_id, updated_by=context.user_id)
    db.add(item); db.flush(); audit(db, context, "branches", item.id, "CREATE", None, {"branch_code": code})
    finish_create(db, reservation, item.id); commit(db); db.refresh(item); return item


@router.put("/branches/{record_id}", response_model=BranchResponse, dependencies=head_permission("ORG.BRANCH.UPDATE"))
def update_branch(record_id: int, payload: BranchUpdate, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    item = scoped(db, Branch, record_id, context.organization_id)
    if payload.parent_branch_id == record_id: raise HTTPException(400, "Branch cannot be its own parent")
    if payload.parent_branch_id: scoped(db, Branch, payload.parent_branch_id, context.organization_id)
    old = {key: getattr(item, key) for key in payload.model_fields_set}
    for key, value in payload.model_dump(exclude_unset=True).items(): setattr(item, key, value)
    item.updated_by = context.user_id; audit(db, context, "branches", item.id, "UPDATE", old, payload.model_dump(exclude_unset=True, mode="json")); commit(db); db.refresh(item); return item


def set_branch_active(record_id, active, context, db):
    item = scoped(db, Branch, record_id, context.organization_id)
    if not active:
        refs = db.query(Employee.id).filter(Employee.branch_id == item.id, Employee.is_active.is_(True), Employee.deleted_at.is_(None)).first() or db.query(Department.id).filter(Department.branch_id == item.id, Department.is_active.is_(True), Department.deleted_at.is_(None)).first() or db.query(Branch.id).filter(Branch.parent_branch_id == item.id, Branch.is_active.is_(True), Branch.deleted_at.is_(None)).first()
        if refs: raise HTTPException(409, "Branch is referenced by active employees or departments")
    item.is_active = active; item.updated_by = context.user_id; audit(db, context, "branches", item.id, "REACTIVATE" if active else "DEACTIVATE", {"is_active": not active}, {"is_active": active}); commit(db); db.refresh(item); return item


@router.post("/branches/{record_id}/deactivate", response_model=BranchResponse, dependencies=head_permission("ORG.BRANCH.DEACTIVATE"))
def deactivate_branch(record_id: int, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)): return set_branch_active(record_id, False, context, db)
@router.post("/branches/{record_id}/reactivate", response_model=BranchResponse, dependencies=head_permission("ORG.BRANCH.UPDATE"))
def reactivate_branch(record_id: int, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)): return set_branch_active(record_id, True, context, db)


@router.get("/departments", response_model=list[DepartmentResponse], dependencies=head_permission("ORG.DEPARTMENT.READ"))
def list_departments(include_inactive: bool = False, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    q=db.query(Department).filter(Department.organization_id==context.organization_id, Department.deleted_at.is_(None)); q=q if include_inactive else q.filter(Department.is_active.is_(True)); return q.order_by(Department.department_name).all()
@router.post("/departments", response_model=DepartmentResponse, status_code=201, dependencies=head_permission("ORG.DEPARTMENT.MANAGE"))
def create_department(payload: DepartmentInput, context: AccessContext=Depends(require_head), db: Session=Depends(get_db),
                      idempotency_key: str | None = Header(default=None)):
    reservation = reserve_create(db, key=idempotency_key, operation="department.create",
        actor_scope=f"org:{context.organization_id}:user:{context.user_id}", payload=payload.model_dump(mode="json"))
    if reservation and reservation.replay:
        return scoped(db, Department, reservation.resource_id, context.organization_id)
    scoped(db, Branch, payload.branch_id, context.organization_id); code=payload.department_code.strip().upper()
    validate_department_head(db, payload.head_employee_id, context.organization_id)
    if db.query(Department.id).filter(Department.organization_id==context.organization_id, Department.department_code==code).first(): raise HTTPException(409,"Department code already exists")
    item=Department(organization_id=context.organization_id, **(payload.model_dump()|{"department_code":code}), created_by=context.user_id, updated_by=context.user_id); db.add(item); db.flush(); audit(db,context,"departments",item.id,"CREATE",None,{"department_code":code}); finish_create(db,reservation,item.id); commit(db); db.refresh(item); return item
@router.put("/departments/{record_id}", response_model=DepartmentResponse, dependencies=head_permission("ORG.DEPARTMENT.MANAGE"))
def update_department(record_id:int,payload:DepartmentUpdate,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):
    item=scoped(db,Department,record_id,context.organization_id)
    if payload.branch_id: scoped(db,Branch,payload.branch_id,context.organization_id)
    if "head_employee_id" in payload.model_fields_set: validate_department_head(db,payload.head_employee_id,context.organization_id)
    old={k:getattr(item,k) for k in payload.model_fields_set}
    for k,v in payload.model_dump(exclude_unset=True).items(): setattr(item,k,v)
    item.updated_by=context.user_id; audit(db,context,"departments",item.id,"UPDATE",old,payload.model_dump(exclude_unset=True)); commit(db); db.refresh(item); return item
def set_department_active(record_id,active,context,db):
    item=scoped(db,Department,record_id,context.organization_id)
    if not active and db.query(Employee.id).filter(Employee.department_id==item.id,Employee.is_active.is_(True),Employee.deleted_at.is_(None)).first(): raise HTTPException(409,"Department is referenced by active employees")
    item.is_active=active; item.updated_by=context.user_id; audit(db,context,"departments",item.id,"REACTIVATE" if active else "DEACTIVATE",{"is_active":not active},{"is_active":active}); commit(db); db.refresh(item); return item
@router.post("/departments/{record_id}/deactivate",response_model=DepartmentResponse,dependencies=head_permission("ORG.DEPARTMENT.MANAGE"))
def deactivate_department(record_id:int,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)): return set_department_active(record_id,False,context,db)
@router.post("/departments/{record_id}/reactivate",response_model=DepartmentResponse,dependencies=head_permission("ORG.DEPARTMENT.MANAGE"))
def reactivate_department(record_id:int,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)): return set_department_active(record_id,True,context,db)


@router.get("/designations",response_model=list[DesignationResponse],dependencies=head_permission("ORG.DESIGNATION.READ"))
def list_designations(include_inactive:bool=False,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):
    q=db.query(Designation).filter(Designation.organization_id==context.organization_id,Designation.deleted_at.is_(None)); q=q if include_inactive else q.filter(Designation.is_active.is_(True)); return q.order_by(Designation.hierarchy_level,Designation.designation_name).all()
@router.post("/designations",response_model=DesignationResponse,status_code=201,dependencies=head_permission("ORG.DESIGNATION.MANAGE"))
def create_designation(payload:DesignationInput,context:AccessContext=Depends(require_head),db:Session=Depends(get_db),
                       idempotency_key: str | None = Header(default=None)):
    reservation = reserve_create(db, key=idempotency_key, operation="designation.create",
        actor_scope=f"org:{context.organization_id}:user:{context.user_id}", payload=payload.model_dump(mode="json"))
    if reservation and reservation.replay:
        return scoped(db, Designation, reservation.resource_id, context.organization_id)
    code=payload.designation_code.strip().upper()
    if db.query(Designation.id).filter(Designation.organization_id==context.organization_id,Designation.designation_code==code).first(): raise HTTPException(409,"Designation code already exists")
    item=Designation(organization_id=context.organization_id,**(payload.model_dump()|{"designation_code":code}),created_by=context.user_id,updated_by=context.user_id); db.add(item); db.flush(); audit(db,context,"designations",item.id,"CREATE",None,{"designation_code":code}); finish_create(db,reservation,item.id); commit(db); db.refresh(item); return item
@router.put("/designations/{record_id}",response_model=DesignationResponse,dependencies=head_permission("ORG.DESIGNATION.MANAGE"))
def update_designation(record_id:int,payload:DesignationUpdate,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):
    item=scoped(db,Designation,record_id,context.organization_id); old={k:getattr(item,k) for k in payload.model_fields_set}
    for k,v in payload.model_dump(exclude_unset=True).items(): setattr(item,k,v)
    item.updated_by=context.user_id; audit(db,context,"designations",item.id,"UPDATE",old,payload.model_dump(exclude_unset=True)); commit(db); db.refresh(item); return item
def set_designation_active(record_id,active,context,db):
    item=scoped(db,Designation,record_id,context.organization_id)
    if not active and db.query(Employee.id).filter(Employee.designation_id==item.id,Employee.is_active.is_(True),Employee.deleted_at.is_(None)).first(): raise HTTPException(409,"Designation is referenced by active employees")
    item.is_active=active; item.updated_by=context.user_id; audit(db,context,"designations",item.id,"REACTIVATE" if active else "DEACTIVATE",{"is_active":not active},{"is_active":active}); commit(db); db.refresh(item); return item
@router.post("/designations/{record_id}/deactivate",response_model=DesignationResponse,dependencies=head_permission("ORG.DESIGNATION.MANAGE"))
def deactivate_designation(record_id:int,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)): return set_designation_active(record_id,False,context,db)
@router.post("/designations/{record_id}/reactivate",response_model=DesignationResponse,dependencies=head_permission("ORG.DESIGNATION.MANAGE"))
def reactivate_designation(record_id:int,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)): return set_designation_active(record_id,True,context,db)


def bulk_resource_status(db: Session, context: AccessContext, model, ids: list[int], active: bool):
    rows = (db.query(model).filter(
        model.id.in_(ids), model.organization_id == context.organization_id,
        model.deleted_at.is_(None),
    ).with_for_update().all())
    if len(rows) != len(ids):
        raise HTTPException(404, "One or more records were not found in this organization")
    changed = [row for row in rows if row.is_active != active]
    if model is Branch and active:
        current = db.query(Branch).filter(
            Branch.organization_id == context.organization_id,
            Branch.is_active.is_(True), Branch.deleted_at.is_(None),
        ).count()
        context.check_limit("LIMIT.BRANCHES", current, len(changed))
    for row in changed:
        if model is Branch and not active:
            refs = (db.query(Employee.id).filter(Employee.branch_id == row.id, Employee.is_active.is_(True), Employee.deleted_at.is_(None)).first()
                    or db.query(Department.id).filter(Department.branch_id == row.id, Department.is_active.is_(True), Department.deleted_at.is_(None)).first()
                    or db.query(Branch.id).filter(Branch.parent_branch_id == row.id, Branch.is_active.is_(True), Branch.deleted_at.is_(None)).first())
            if refs:
                raise HTTPException(409, "Branch is referenced by active employees, departments, or branches")
        if model is Department and not active and db.query(Employee.id).filter(
            Employee.department_id == row.id, Employee.is_active.is_(True), Employee.deleted_at.is_(None),
        ).first():
            raise HTTPException(409, "Department is referenced by active employees")
        if model is Designation and not active and db.query(Employee.id).filter(
            Employee.designation_id == row.id, Employee.is_active.is_(True), Employee.deleted_at.is_(None),
        ).first():
            raise HTTPException(409, "Designation is referenced by active employees")
        if model is Department and active and not scoped(db, Branch, row.branch_id, context.organization_id).is_active:
            raise HTTPException(409, "Department branch is inactive")
    for row in changed:
        row.is_active = active
        row.updated_by = context.user_id
        audit(db, context, model.__tablename__, row.id,
              "REACTIVATE" if active else "DEACTIVATE",
              {"is_active": not active}, {"is_active": active, "bulk": True})
    commit(db)
    return {"updated_ids": [row.id for row in changed]}


@router.post("/branches/bulk-deactivate", dependencies=head_permission("ORG.BRANCH.DEACTIVATE"))
def bulk_deactivate_branches(payload: BulkStatusChange, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return bulk_resource_status(db, context, Branch, payload.ids, False)


@router.post("/branches/bulk-reactivate", dependencies=head_permission("ORG.BRANCH.UPDATE"))
def bulk_reactivate_branches(payload: BulkStatusChange, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return bulk_resource_status(db, context, Branch, payload.ids, True)


@router.post("/departments/bulk-deactivate", dependencies=head_permission("ORG.DEPARTMENT.MANAGE"))
def bulk_deactivate_departments(payload: BulkStatusChange, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return bulk_resource_status(db, context, Department, payload.ids, False)


@router.post("/departments/bulk-reactivate", dependencies=head_permission("ORG.DEPARTMENT.MANAGE"))
def bulk_reactivate_departments(payload: BulkStatusChange, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return bulk_resource_status(db, context, Department, payload.ids, True)


@router.post("/designations/bulk-deactivate", dependencies=head_permission("ORG.DESIGNATION.MANAGE"))
def bulk_deactivate_designations(payload: BulkStatusChange, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return bulk_resource_status(db, context, Designation, payload.ids, False)


@router.post("/designations/bulk-reactivate", dependencies=head_permission("ORG.DESIGNATION.MANAGE"))
def bulk_reactivate_designations(payload: BulkStatusChange, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return bulk_resource_status(db, context, Designation, payload.ids, True)
