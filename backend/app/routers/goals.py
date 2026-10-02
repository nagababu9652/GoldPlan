"""Advisor-scoped financial goal operations."""
from datetime import date, datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.crm.goal import FinancialGoal
from ..models.crm.customer import CustomerGroup
from ..models.organization.assignment import EmployeeAssignment
from ..schemas.goal import GOAL_STATUSES, GOAL_TYPES, GoalCreate, GoalListResponse, GoalResponse, GoalUpdate
from ..services.access import AccessContext, require_employee, require_permission
from ..services.idempotency import finish_create, reserve_create
from .advisors import get_report_customer_ids, get_report_employee

router = APIRouter(prefix="/advisors/goals", tags=["advisor-goals"])


def normalize_choice(value: str, allowed: set[str], label: str) -> str:
    normalized = value.strip().upper()
    if normalized not in allowed:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"Unsupported {label}: {value}")
    return normalized


def authorize_owner(db: Session, advisor: AccessContext, customer_id: int | None, group_id: int | None):
    employee = get_report_employee(advisor, db)
    if customer_id is not None and customer_id not in get_report_customer_ids(advisor, db):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Client not found")
    if group_id is not None:
        group = db.query(CustomerGroup).filter(
            CustomerGroup.id == group_id,
            CustomerGroup.organization_id == employee.organization_id,
            CustomerGroup.is_active.is_(True),
            CustomerGroup.deleted_at.is_(None),
        ).first()
        if group is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Group not found")
        today = date.today()
        assigned = db.query(EmployeeAssignment).filter(
            EmployeeAssignment.employee_id == employee.id,
            EmployeeAssignment.assignment_type == "ADVISOR",
            or_(
                (EmployeeAssignment.entity_type == "CUSTOMER_GROUP") &
                (EmployeeAssignment.entity_id == group.id),
                (EmployeeAssignment.entity_type == "BRANCH") &
                (EmployeeAssignment.entity_id == group.primary_branch_id),
            ),
            EmployeeAssignment.effective_from <= today,
            or_(EmployeeAssignment.effective_to.is_(None),
                EmployeeAssignment.effective_to >= today),
            EmployeeAssignment.is_active.is_(True),
            EmployeeAssignment.deleted_at.is_(None),
        ).first()
        if assigned is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Group not found")
    return employee


def get_goal_for_advisor(db: Session, advisor: AccessContext, goal_id: int) -> FinancialGoal:
    employee = get_report_employee(advisor, db)
    goal = db.query(FinancialGoal).filter(
        FinancialGoal.id == goal_id,
        FinancialGoal.organization_id == employee.organization_id,
        FinancialGoal.is_active.is_(True),
        FinancialGoal.deleted_at.is_(None),
    ).first()
    if not goal:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Goal not found")
    authorize_owner(db, advisor, goal.customer_id, goal.customer_group_id)
    return goal


def goal_response(goal: FinancialGoal) -> GoalResponse:
    progress = min(Decimal("100"), (goal.current_amount / goal.target_amount * 100))
    fields = GoalResponse.model_fields.keys() - {"progress_percentage"}
    return GoalResponse.model_validate({
        **{field: getattr(goal, field) for field in fields},
        "progress_percentage": progress.quantize(Decimal("0.01")),
    })


@router.get("", response_model=GoalListResponse,
            dependencies=[Depends(require_permission("GOAL.READ"))])
def list_goals(
    customer_id: int | None = Query(None), customer_group_id: int | None = Query(None),
    goal_status: str | None = Query(None, alias="status"),
    advisor: AccessContext = Depends(require_employee), db: Session = Depends(get_db),
):
    if (customer_id is None) == (customer_group_id is None):
        raise HTTPException(422, "Exactly one owner filter is required")
    authorize_owner(db, advisor, customer_id, customer_group_id)
    query = db.query(FinancialGoal).filter(
        FinancialGoal.organization_id == advisor.organization_id,
        FinancialGoal.customer_id == customer_id,
        FinancialGoal.customer_group_id == customer_group_id,
        FinancialGoal.is_active.is_(True), FinancialGoal.deleted_at.is_(None),
    )
    if goal_status:
        query = query.filter(FinancialGoal.status == normalize_choice(goal_status, GOAL_STATUSES, "goal status"))
    goals = query.order_by(FinancialGoal.priority.asc(), FinancialGoal.target_date.asc()).all()
    return GoalListResponse(goals=[goal_response(goal) for goal in goals], total=len(goals))


@router.get("/{goal_id}", response_model=GoalResponse,
            dependencies=[Depends(require_permission("GOAL.READ"))])
def get_goal(goal_id: int, advisor: AccessContext = Depends(require_employee), db: Session = Depends(get_db)):
    return goal_response(get_goal_for_advisor(db, advisor, goal_id))


@router.post("", response_model=GoalResponse, status_code=201,
             dependencies=[Depends(require_permission("GOAL.CREATE"))])
def create_goal(payload: GoalCreate, advisor: AccessContext = Depends(require_employee), db: Session = Depends(get_db), idempotency_key: str | None = Header(default=None)):
    employee = authorize_owner(db, advisor, payload.customer_id, payload.customer_group_id)
    reservation = reserve_create(db, key=idempotency_key, operation="goal.create", actor_scope=f"user:{advisor.user_id}", payload=payload.model_dump())
    if reservation and reservation.replay:
        return goal_response(get_goal_for_advisor(db, advisor, reservation.resource_id))
    goal = FinancialGoal(
        organization_id=employee.organization_id,
        **payload.model_dump(exclude={"goal_type", "status"}),
        goal_type=normalize_choice(payload.goal_type, GOAL_TYPES, "goal type"),
        status=normalize_choice(payload.status, GOAL_STATUSES, "goal status"),
        created_by=advisor.user_id,
    )
    db.add(goal)
    db.flush()
    finish_create(db, reservation, goal.id)
    db.commit()
    db.refresh(goal)
    return goal_response(goal)


@router.put("/{goal_id}", response_model=GoalResponse,
            dependencies=[Depends(require_permission("GOAL.UPDATE"))])
def update_goal(goal_id: int, payload: GoalUpdate, advisor: AccessContext = Depends(require_employee), db: Session = Depends(get_db)):
    goal = get_goal_for_advisor(db, advisor, goal_id)
    updates = payload.model_dump(exclude_unset=True)
    if "goal_type" in updates:
        updates["goal_type"] = normalize_choice(updates["goal_type"], GOAL_TYPES, "goal type")
    if "status" in updates:
        updates["status"] = normalize_choice(updates["status"], GOAL_STATUSES, "goal status")
    for field, value in updates.items():
        setattr(goal, field, value)
    goal.updated_by = advisor.user_id
    db.commit()
    db.refresh(goal)
    return goal_response(goal)


@router.delete("/{goal_id}", dependencies=[Depends(require_permission("GOAL.UPDATE"))])
def archive_goal(goal_id: int, advisor: AccessContext = Depends(require_employee), db: Session = Depends(get_db)):
    goal = get_goal_for_advisor(db, advisor, goal_id)
    goal.is_active = False
    goal.deleted_at = datetime.utcnow()
    goal.deleted_by = advisor.user_id
    db.commit()
    return {"message": "Goal archived successfully"}
