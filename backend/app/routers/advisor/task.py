from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ...database.session import get_db
from ...models.crm.customer import Customer, CustomerGroup
from ...models.crm.task import Task
from ...models.organization.employee import Employee
from ...models.organization.assignment import EmployeeAssignment
from ...routers.advisors import get_current_advisor as get_current_user
from ...schemas.task import (
    TaskCreate,
    TaskListResponse,
    TaskResponse,
    TaskUpdate,
)


router = APIRouter(
    prefix="/tasks",
    tags=["Advisor Tasks"],
)


def get_advisor_employee(
    db: Session,
    current_user,
) -> Employee:
    employee = (
        db.query(Employee)
        .filter(
            Employee.party_id == current_user.party_id,
            Employee.is_active.is_(True),
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=403,
            detail="Advisor employee record not found",
        )

    return employee


def build_task_response(task: Task) -> TaskResponse:
    return TaskResponse(
        id=task.id,
        organization_id=task.organization_id,
        assigned_employee_id=task.assigned_employee_id,
        customer_id=task.customer_id,
        customer_group_id=task.customer_group_id,
        title=task.title,
        task_type=task.task_type,
        description=task.description,
        due_at=task.due_at,
        priority=task.priority,
        status=task.status,
        notes=task.notes,
        customer_name=(
            task.customer.party.display_name
            if task.customer and task.customer.party
            else None
        ),
        group_name=(
            task.customer_group.group_name
            if task.customer_group
            else None
        ),
        completed_at=task.completed_at,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


def validate_customer_and_group(
    db: Session,
    employee: Employee,
    customer_id: int | None,
    customer_group_id: int | None,
):
    if not customer_id and not customer_group_id:
        raise HTTPException(
            status_code=400,
            detail="Task must be linked to a customer or customer group",
        )

    if customer_id:
        today = date.today()
        assignment = db.query(EmployeeAssignment).filter(
            EmployeeAssignment.employee_id == employee.id,
            EmployeeAssignment.assignment_type == "ADVISOR",
            EmployeeAssignment.entity_type == "CUSTOMER",
            EmployeeAssignment.entity_id == customer_id,
            EmployeeAssignment.effective_from <= today,
            (
                EmployeeAssignment.effective_to.is_(None)
                | (EmployeeAssignment.effective_to >= today)
            ),
            EmployeeAssignment.is_active.is_(True),
        ).first()
        customer = (
            db.query(Customer)
            .filter(
                Customer.id == customer_id,
                Customer.organization_id == employee.organization_id,
            )
            .first()
        )

        if not customer or not assignment:
            raise HTTPException(
                status_code=404,
                detail="Customer not found",
            )

    if customer_group_id:
        group = (
            db.query(CustomerGroup)
            .filter(
                CustomerGroup.id == customer_group_id,
                CustomerGroup.organization_id == employee.organization_id,
            )
            .first()
        )

        if not group:
            raise HTTPException(
                status_code=404,
                detail="Customer group not found",
            )
        if group.primary_advisor_employee_id not in {None, employee.id}:
            raise HTTPException(status_code=403, detail="You are not assigned to this customer group")


@router.get(
    "/",
    response_model=TaskListResponse,
)
def list_tasks(
    search: str | None = Query(default=None),
    status: str | None = Query(default=None),
    priority: str | None = Query(default=None),
    task_type: str | None = Query(default=None),
    customer_id: int | None = Query(default=None),
    customer_group_id: int | None = Query(default=None),
    from_date: datetime | None = Query(default=None),
    to_date: datetime | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(
        db,
        current_user,
    )

    query = (
        db.query(Task)
        .filter(
            Task.organization_id == employee.organization_id,
            Task.assigned_employee_id == employee.id,
        )
    )

    if search:
        search_term = f"%{search.strip()}%"

        query = (
            query
            .outerjoin(
                Customer,
                Task.customer_id == Customer.id,
            )
            .outerjoin(
                CustomerGroup,
                Task.customer_group_id == CustomerGroup.id,
            )
            .filter(
                or_(
                    Task.title.ilike(search_term),
                    Task.description.ilike(search_term),
                    Task.notes.ilike(search_term),
                    CustomerGroup.group_name.ilike(search_term),
                )
            )
        )

    if status:
        query = query.filter(
            Task.status == status
        )

    if priority:
        query = query.filter(
            Task.priority == priority
        )

    if task_type:
        query = query.filter(
            Task.task_type == task_type
        )

    if customer_id:
        query = query.filter(
            Task.customer_id == customer_id
        )

    if customer_group_id:
        query = query.filter(
            Task.customer_group_id == customer_group_id
        )

    if from_date:
        query = query.filter(
            Task.due_at >= from_date
        )

    if to_date:
        query = query.filter(
            Task.due_at <= to_date
        )

    tasks = (
        query
        .order_by(
            Task.due_at.asc()
        )
        .all()
    )

    return TaskListResponse(
        tasks=[
            build_task_response(task)
            for task in tasks
        ],
        total=len(tasks),
    )


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(
        db,
        current_user,
    )

    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.organization_id == employee.organization_id,
            Task.assigned_employee_id == employee.id,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return build_task_response(task)


@router.post(
    "/",
    response_model=TaskResponse,
    status_code=201,
)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(
        db,
        current_user,
    )

    validate_customer_and_group(
        db,
        employee,
        payload.customer_id,
        payload.customer_group_id,
    )

    completed_at = None

    if payload.status == "COMPLETED":
        completed_at = datetime.utcnow()

    task = Task(
        organization_id=employee.organization_id,
        assigned_employee_id=employee.id,
        customer_id=payload.customer_id,
        customer_group_id=payload.customer_group_id,
        title=payload.title,
        task_type=payload.task_type,
        description=payload.description,
        due_at=payload.due_at,
        priority=payload.priority,
        status=payload.status,
        notes=payload.notes,
        completed_at=completed_at,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return build_task_response(task)


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(
        db,
        current_user,
    )

    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.organization_id == employee.organization_id,
            Task.assigned_employee_id == employee.id,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    updates = payload.model_dump(
        exclude_unset=True
    )

    customer_id = updates.get(
        "customer_id",
        task.customer_id,
    )

    customer_group_id = updates.get(
        "customer_group_id",
        task.customer_group_id,
    )

    validate_customer_and_group(
        db,
        employee,
        customer_id,
        customer_group_id,
    )

    for field, value in updates.items():
        setattr(
            task,
            field,
            value,
        )

    if "status" in updates:
        if updates["status"] == "COMPLETED":
            task.completed_at = (
                task.completed_at
                or datetime.utcnow()
            )
        else:
            task.completed_at = None

    db.commit()
    db.refresh(task)

    return build_task_response(task)


@router.post(
    "/{task_id}/complete",
    response_model=TaskResponse,
)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(
        db,
        current_user,
    )

    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.organization_id == employee.organization_id,
            Task.assigned_employee_id == employee.id,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    if task.status not in {"PENDING", "IN_PROGRESS"}:
        raise HTTPException(409, "Only pending or in-progress tasks can be completed")
    task.status = "COMPLETED"
    task.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(task)

    return build_task_response(task)


@router.post(
    "/{task_id}/reopen",
    response_model=TaskResponse,
)
def reopen_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(
        db,
        current_user,
    )

    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.organization_id == employee.organization_id,
            Task.assigned_employee_id == employee.id,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    if task.status != "COMPLETED":
        raise HTTPException(409, "Only completed tasks can be reopened")
    task.status = "PENDING"
    task.completed_at = None

    db.commit()
    db.refresh(task)

    return build_task_response(task)
