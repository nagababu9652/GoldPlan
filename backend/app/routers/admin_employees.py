from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.foundation.party import Party
from ..models.identity.security import AuditLog
from ..models.organization.core import Branch, Department, Designation
from ..models.organization.employee import Employee, EmployeeBranchHistory, EmployeeDepartmentHistory, EmployeeDesignationHistory, EmployeeReporting
from ..schemas.admin_employee import EmployeeCreate, EmployeeResponse, EmployeeUpdate, EmploymentHistoryResponse
from ..services.access import AccessContext, require_head, require_permission
from ..services.party_profile import lookup_id

router = APIRouter(prefix="/admin/organization/employees", tags=["admin-employees"])


def permissions(code):
    return [Depends(require_head), Depends(require_permission(code))]


def scoped(db, model, record_id, organization_id, *, active=False):
    query = db.query(model).filter(model.id == record_id, model.organization_id == organization_id, model.deleted_at.is_(None))
    if active:
        query = query.filter(model.is_active.is_(True))
    item = query.first()
    if item is None:
        raise HTTPException(404, "Record not found")
    return item


def employee_response(db, employee):
    party = db.query(Party).filter(Party.id == employee.party_id).first()
    if party is None:
        raise HTTPException(409, "Employee Party record is missing")
    manager = db.query(EmployeeReporting).filter(EmployeeReporting.employee_id == employee.id, EmployeeReporting.effective_to.is_(None)).first()
    values = {column.name: getattr(employee, column.name) for column in Employee.__table__.columns}
    values.update(first_name=party.first_name, middle_name=party.middle_name, last_name=party.last_name,
                  display_name=party.display_name, personal_email=party.email, mobile_number=party.mobile_number,
                  date_of_birth=party.date_of_birth,
                  reporting_manager_employee_id=manager.manager_employee_id if manager else None)
    return EmployeeResponse.model_validate(values)


def validate_structure(db, organization_id, branch_id, department_id, designation_id):
    branch = scoped(db, Branch, branch_id, organization_id, active=True)
    department = scoped(db, Department, department_id, organization_id, active=True)
    scoped(db, Designation, designation_id, organization_id, active=True)
    if department.branch_id != branch.id:
        raise HTTPException(422, "Department does not belong to the selected branch")


def validate_manager(db, organization_id, employee_id, manager_id):
    if manager_id is None:
        return
    if employee_id == manager_id:
        raise HTTPException(422, "Employee cannot report to themselves")
    manager = scoped(db, Employee, manager_id, organization_id, active=True)
    if manager.employment_status != "ACTIVE":
        raise HTTPException(422, "Reporting manager must be active")


def audit(db, context, employee_id, action, old=None, new=None):
    db.add(AuditLog(organization_id=context.organization_id, user_id=context.user_id, module_name="EMPLOYEE",
                    table_name="employees", record_id=employee_id, action=action, old_values=old,
                    new_values=new, session_id=context.session_id))


@router.get("", response_model=list[EmployeeResponse], dependencies=permissions("ORG.EMPLOYEE.READ"))
def list_employees(include_inactive: bool = False, search: str | None = Query(None),
                   employment_status: str | None = Query(None), branch_id: int | None = Query(None),
                   context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    query = db.query(Employee).join(Party, Party.id == Employee.party_id).filter(Employee.organization_id == context.organization_id, Employee.deleted_at.is_(None))
    if not include_inactive:
        query = query.filter(Employee.is_active.is_(True))
    if search:
        value = f"%{search.strip()}%"
        query = query.filter(or_(Employee.employee_code.ilike(value), Employee.official_email.ilike(value),
            Employee.official_mobile.ilike(value), Party.display_name.ilike(value),
            Party.email.ilike(value), Party.mobile_number.ilike(value)))
    if employment_status:
        query = query.filter(Employee.employment_status == employment_status.strip().upper())
    if branch_id is not None:
        query = query.filter(Employee.branch_id == branch_id)
    return [employee_response(db, item) for item in query.order_by(Employee.employee_code).all()]


@router.get("/{employee_id}", response_model=EmployeeResponse, dependencies=permissions("ORG.EMPLOYEE.READ"))
def get_employee(employee_id: int, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return employee_response(db, scoped(db, Employee, employee_id, context.organization_id))


@router.post("", response_model=EmployeeResponse, status_code=201, dependencies=permissions("ORG.EMPLOYEE.CREATE"))
def create_employee(payload: EmployeeCreate, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    code = payload.employee_code.strip().upper()
    if db.query(Employee.id).filter(Employee.organization_id == context.organization_id, Employee.employee_code == code).first():
        raise HTTPException(409, "Employee code already exists")
    context.check_limit("LIMIT.EMPLOYEES", db.query(Employee).filter(Employee.organization_id == context.organization_id, Employee.is_active.is_(True), Employee.deleted_at.is_(None)).count())
    validate_structure(db, context.organization_id, payload.branch_id, payload.department_id, payload.designation_id)
    validate_manager(db, context.organization_id, None, payload.reporting_manager_employee_id)
    display_name = payload.display_name or " ".join(filter(None, [payload.first_name, payload.middle_name, payload.last_name]))
    party = Party(organization_id=context.organization_id, party_code=f"EMP-{context.organization_id}-{code}",
                  party_type_id=lookup_id(db, "PARTY_TYPE", "INDIVIDUAL"), first_name=payload.first_name,
                  middle_name=payload.middle_name, last_name=payload.last_name, display_name=display_name,
                  email=payload.personal_email, mobile_number=payload.mobile_number, date_of_birth=payload.date_of_birth,
                  created_by=context.user_id, updated_by=context.user_id)
    db.add(party); db.flush()
    employee = Employee(organization_id=context.organization_id, party_id=party.id, employee_code=code,
                        branch_id=payload.branch_id, department_id=payload.department_id, designation_id=payload.designation_id,
                        employment_type=payload.employment_type, joining_date=payload.joining_date,
                        confirmation_date=payload.confirmation_date, employment_status="ACTIVE",
                        official_email=str(payload.official_email), official_mobile=payload.official_mobile,
                        remarks=payload.remarks, created_by=context.user_id, updated_by=context.user_id)
    db.add(employee); db.flush()
    db.add_all([EmployeeBranchHistory(employee_id=employee.id, branch_id=employee.branch_id, effective_from=employee.joining_date),
                EmployeeDepartmentHistory(employee_id=employee.id, department_id=employee.department_id, effective_from=employee.joining_date),
                EmployeeDesignationHistory(employee_id=employee.id, designation_id=employee.designation_id, effective_from=employee.joining_date)])
    if payload.reporting_manager_employee_id:
        db.add(EmployeeReporting(employee_id=employee.id, manager_employee_id=payload.reporting_manager_employee_id, effective_from=payload.joining_date))
    audit(db, context, employee.id, "CREATE", new={"employee_code": code}); db.commit(); db.refresh(employee)
    return employee_response(db, employee)


@router.put("/{employee_id}", response_model=EmployeeResponse, dependencies=permissions("ORG.EMPLOYEE.UPDATE"))
def update_employee(employee_id: int, payload: EmployeeUpdate, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    employee = scoped(db, Employee, employee_id, context.organization_id)
    # The Employee has already established the organization boundary. Some Party
    # rows created before Party organization ownership was enforced have a NULL
    # organization_id, so filtering the linked row by organization loses it.
    party = db.query(Party).filter(
        Party.id == employee.party_id,
        Party.deleted_at.is_(None),
    ).first()
    if party is None:
        raise HTTPException(409, "Employee Party record is missing")
    if party.organization_id not in {None, context.organization_id}:
        raise HTTPException(409, "Employee Party belongs to another organization")
    if party.organization_id is None:
        party.organization_id = context.organization_id
    changes = payload.model_dump(exclude_unset=True)
    branch_id = changes.get("branch_id", employee.branch_id); department_id = changes.get("department_id", employee.department_id)
    designation_id = changes.get("designation_id", employee.designation_id)
    validate_structure(db, context.organization_id, branch_id, department_id, designation_id)
    if "reporting_manager_employee_id" in payload.model_fields_set:
        validate_manager(db, context.organization_id, employee.id, payload.reporting_manager_employee_id)
    effective = date.today()
    if branch_id != employee.branch_id:
        current = db.query(EmployeeBranchHistory).filter(EmployeeBranchHistory.employee_id == employee.id, EmployeeBranchHistory.effective_to.is_(None)).first()
        if current: current.effective_to = effective
        db.add(EmployeeBranchHistory(employee_id=employee.id, branch_id=branch_id, effective_from=effective))
    if department_id != employee.department_id:
        current = db.query(EmployeeDepartmentHistory).filter(EmployeeDepartmentHistory.employee_id == employee.id, EmployeeDepartmentHistory.effective_to.is_(None)).first()
        if current: current.effective_to = effective
        db.add(EmployeeDepartmentHistory(employee_id=employee.id, department_id=department_id, effective_from=effective))
    if designation_id != employee.designation_id:
        current = db.query(EmployeeDesignationHistory).filter(EmployeeDesignationHistory.employee_id == employee.id, EmployeeDesignationHistory.effective_to.is_(None)).first()
        if current: current.effective_to = effective
        db.add(EmployeeDesignationHistory(employee_id=employee.id, designation_id=designation_id, effective_from=effective))
    party_fields = {"first_name", "middle_name", "last_name", "display_name", "personal_email", "mobile_number", "date_of_birth"}
    for key in party_fields & changes.keys():
        setattr(party, {"personal_email": "email"}.get(key, key), changes[key])
    for key in set(changes) - party_fields - {"reporting_manager_employee_id"}:
        setattr(employee, key, changes[key])
    if "reporting_manager_employee_id" in payload.model_fields_set:
        current = db.query(EmployeeReporting).filter(EmployeeReporting.employee_id == employee.id, EmployeeReporting.effective_to.is_(None)).first()
        if current and current.manager_employee_id != payload.reporting_manager_employee_id: current.effective_to = effective
        if payload.reporting_manager_employee_id and (not current or current.manager_employee_id != payload.reporting_manager_employee_id):
            db.add(EmployeeReporting(employee_id=employee.id, manager_employee_id=payload.reporting_manager_employee_id, effective_from=effective))
    employee.updated_by = context.user_id; party.updated_by = context.user_id
    audit(db, context, employee.id, "UPDATE", new=payload.model_dump(exclude_unset=True, mode="json")); db.commit(); db.refresh(employee)
    return employee_response(db, employee)


def change_active(employee_id, active, context, db):
    employee = scoped(db, Employee, employee_id, context.organization_id)
    employee.is_active = active; employee.employment_status = "ACTIVE" if active else "INACTIVE"
    employee.relieving_date = None if active else date.today(); employee.updated_by = context.user_id
    audit(db, context, employee.id, "REACTIVATE" if active else "DEACTIVATE", new={"is_active": active})
    db.commit(); db.refresh(employee); return employee_response(db, employee)


@router.post("/{employee_id}/deactivate", response_model=EmployeeResponse, dependencies=permissions("ORG.EMPLOYEE.DEACTIVATE"))
def deactivate_employee(employee_id: int, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    if context.employee_id == employee_id: raise HTTPException(409, "You cannot deactivate your own employee record")
    return change_active(employee_id, False, context, db)


@router.post("/{employee_id}/reactivate", response_model=EmployeeResponse, dependencies=permissions("ORG.EMPLOYEE.UPDATE"))
def reactivate_employee(employee_id: int, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return change_active(employee_id, True, context, db)


@router.get("/{employee_id}/history", response_model=dict[str, list[EmploymentHistoryResponse]], dependencies=permissions("ORG.EMPLOYEE.READ"))
def employee_history(employee_id: int, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    employee = scoped(db, Employee, employee_id, context.organization_id)
    return {"branches": db.query(EmployeeBranchHistory).filter(EmployeeBranchHistory.employee_id == employee.id).all(),
            "departments": db.query(EmployeeDepartmentHistory).filter(EmployeeDepartmentHistory.employee_id == employee.id).all(),
            "designations": db.query(EmployeeDesignationHistory).filter(EmployeeDesignationHistory.employee_id == employee.id).all(),
            "reporting": db.query(EmployeeReporting).filter(EmployeeReporting.employee_id == employee.id).all()}
