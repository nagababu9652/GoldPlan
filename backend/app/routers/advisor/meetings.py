from datetime import date, datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ...database.session import get_db
from ...models.crm.customer import Customer, CustomerGroup
from ...models.crm.meeting import Meeting
from ...models.organization.employee import Employee
from ...models.organization.assignment import EmployeeAssignment
from ...services.access import AccessContext, require_employee as get_current_user, require_permission
from ...services.idempotency import finish_create, reserve_create
from ...schemas.meeting import (
    MeetingCreate,
    MeetingListResponse,
    MeetingResponse,
    MeetingUpdate,
)

router = APIRouter(
    prefix="/meetings",
    tags=["Advisor Meetings"],
)


def get_advisor_employee(
    db: Session,
    current_user: AccessContext,
) -> Employee:
    employee = (
        db.query(Employee)
        .filter(
            Employee.id == current_user.employee_id,
            Employee.organization_id == current_user.organization_id,
            Employee.is_active.is_(True),
            Employee.employment_status == "ACTIVE",
            Employee.deleted_at.is_(None),
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=403,
            detail="Advisor employee record not found",
        )

    return employee


def build_meeting_response(meeting: Meeting) -> MeetingResponse:
    return MeetingResponse(
        id=meeting.id,
        organization_id=meeting.organization_id,
        advisor_employee_id=meeting.advisor_employee_id,
        customer_id=meeting.customer_id,
        customer_group_id=meeting.customer_group_id,
        title=meeting.title,
        meeting_type=meeting.meeting_type,
        description=meeting.description,
        scheduled_start=meeting.scheduled_start,
        scheduled_end=meeting.scheduled_end,
        location=meeting.location,
        meeting_link=meeting.meeting_link,
        status=meeting.status,
        outcome=meeting.outcome,
        notes=meeting.notes,
        customer_name=(
            meeting.customer.party.display_name
            if meeting.customer and meeting.customer.party
            else None
        ),
        group_name=(
            meeting.customer_group.group_name
            if meeting.customer_group
            else None
        ),
        created_at=meeting.created_at,
        updated_at=meeting.updated_at,
    )


def validate_meeting_owner(
    db: Session,
    employee: Employee,
    customer_id: int | None,
    customer_group_id: int | None,
) -> None:
    if customer_id is None and customer_group_id is None:
        raise HTTPException(422, "A meeting owner is required")

    if customer_id is not None:
        today = date.today()
        assigned = db.query(EmployeeAssignment).filter(
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
            EmployeeAssignment.deleted_at.is_(None),
        ).first()
        customer = db.query(Customer).filter(
            Customer.id == customer_id,
            Customer.organization_id == employee.organization_id,
            Customer.is_active.is_(True),
            Customer.deleted_at.is_(None),
        ).first()
        if not assigned or not customer:
            raise HTTPException(404, "Assigned customer not found")
    if customer_group_id is not None:
        group = db.query(CustomerGroup).filter(
            CustomerGroup.id == customer_group_id,
            CustomerGroup.organization_id == employee.organization_id,
            CustomerGroup.is_active.is_(True),
            CustomerGroup.deleted_at.is_(None),
        ).first()
        if not group:
            raise HTTPException(404, "Customer group not found")
        assigned = db.query(EmployeeAssignment).filter(
            EmployeeAssignment.employee_id == employee.id,
            EmployeeAssignment.assignment_type == "ADVISOR",
            or_(
                (EmployeeAssignment.entity_type == "CUSTOMER_GROUP") &
                (EmployeeAssignment.entity_id == group.id),
                (EmployeeAssignment.entity_type == "BRANCH") &
                (EmployeeAssignment.entity_id == group.primary_branch_id),
            ),
            EmployeeAssignment.effective_from <= date.today(),
            or_(EmployeeAssignment.effective_to.is_(None),
                EmployeeAssignment.effective_to >= date.today()),
            EmployeeAssignment.is_active.is_(True),
            EmployeeAssignment.deleted_at.is_(None),
        ).first()
        if not assigned:
            raise HTTPException(404, "Assigned customer group not found")


@router.get("/", response_model=MeetingListResponse,
            dependencies=[Depends(require_permission("MEETING.READ"))])
def list_meetings(
    search: str | None = Query(default=None),
    status: str | None = Query(default=None),
    meeting_type: str | None = Query(default=None),
    from_date: datetime | None = Query(default=None),
    to_date: datetime | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(db, current_user)

    query = db.query(Meeting).filter(
        Meeting.organization_id == employee.organization_id,
        Meeting.advisor_employee_id == employee.id,
    )

    if search:
        search_term = f"%{search.strip()}%"

        query = (
            query
            .outerjoin(Customer, Meeting.customer_id == Customer.id)
            .outerjoin(CustomerGroup, Meeting.customer_group_id == CustomerGroup.id)
            .filter(
                or_(
                    Meeting.title.ilike(search_term),
                    Meeting.description.ilike(search_term),
                    CustomerGroup.group_name.ilike(search_term),
                )
            ))
    if status:
        query = query.filter(Meeting.status == status)

    if meeting_type:
        query = query.filter(Meeting.meeting_type == meeting_type)

    if from_date:
        query = query.filter(
            Meeting.scheduled_start >= from_date
        )

    if to_date:
        query = query.filter(
            Meeting.scheduled_start <= to_date
        )

    meetings = (
        query
        .order_by(Meeting.scheduled_start.asc())
        .all()
    )

    accessible = []
    for meeting in meetings:
        try:
            validate_meeting_owner(db, employee, meeting.customer_id, meeting.customer_group_id)
            accessible.append(meeting)
        except HTTPException:
            continue

    return MeetingListResponse(
        meetings=[
            build_meeting_response(meeting)
            for meeting in accessible
        ],
        total=len(accessible),
    )


@router.get(
    "/{meeting_id}",
    response_model=MeetingResponse,
    dependencies=[Depends(require_permission("MEETING.READ"))],
)
def get_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(db, current_user)

    meeting = (
        db.query(Meeting)
        .filter(
            Meeting.id == meeting_id,
            Meeting.organization_id == employee.organization_id,
            Meeting.advisor_employee_id == employee.id,
        )
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    validate_meeting_owner(db, employee, meeting.customer_id, meeting.customer_group_id)

    return build_meeting_response(meeting)


@router.post(
    "/",
    response_model=MeetingResponse,
    status_code=201,
    dependencies=[Depends(require_permission("MEETING.CREATE"))],
)
def create_meeting(
    payload: MeetingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    idempotency_key: str | None = Header(default=None),
):
    employee = get_advisor_employee(db, current_user)

    validate_meeting_owner(
        db, employee, payload.customer_id, payload.customer_group_id,
    )
    reservation = reserve_create(db, key=idempotency_key, operation="meeting.create", actor_scope=f"user:{current_user.user_id}", payload=payload.model_dump())
    if reservation and reservation.replay:
        meeting = db.query(Meeting).filter(Meeting.id == reservation.resource_id, Meeting.organization_id == employee.organization_id, Meeting.advisor_employee_id == employee.id).first()
        if meeting is None:
            raise HTTPException(status_code=404, detail="Meeting not found")
        return build_meeting_response(meeting)

    meeting = Meeting(
        organization_id=employee.organization_id,
        advisor_employee_id=employee.id,
        customer_id=payload.customer_id,
        customer_group_id=payload.customer_group_id,
        title=payload.title,
        meeting_type=payload.meeting_type,
        description=payload.description,
        scheduled_start=payload.scheduled_start,
        scheduled_end=payload.scheduled_end,
        location=payload.location,
        meeting_link=payload.meeting_link,
        status=payload.status,
        outcome=payload.outcome,
        notes=payload.notes,
    )

    db.add(meeting)
    db.flush()
    finish_create(db, reservation, meeting.id)
    db.commit()
    db.refresh(meeting)

    return build_meeting_response(meeting)


@router.put(
    "/{meeting_id}",
    response_model=MeetingResponse,
    dependencies=[Depends(require_permission("MEETING.UPDATE"))],
)
def update_meeting(
    meeting_id: int,
    payload: MeetingUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(db, current_user)

    meeting = (
        db.query(Meeting)
        .filter(
            Meeting.id == meeting_id,
            Meeting.organization_id == employee.organization_id,
            Meeting.advisor_employee_id == employee.id,
        )
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    validate_meeting_owner(db, employee, meeting.customer_id, meeting.customer_group_id)

    updates = payload.model_dump(exclude_unset=True)

    start = updates.get(
        "scheduled_start",
        meeting.scheduled_start,
    )

    end = updates.get(
        "scheduled_end",
        meeting.scheduled_end,
    )

    if end <= start:
        raise HTTPException(
            status_code=400,
            detail="Meeting end time must be after start time",
        )

    customer_id = updates.get("customer_id", meeting.customer_id)
    customer_group_id = updates.get("customer_group_id", meeting.customer_group_id)
    validate_meeting_owner(db, employee, customer_id, customer_group_id)

    if "customer_id" in updates and updates["customer_id"]:
        customer = (
            db.query(Customer)
            .filter(
                Customer.id == updates["customer_id"],
                Customer.organization_id == employee.organization_id,
            )
            .first()
        )

        if not customer:
            raise HTTPException(
                status_code=404,
                detail="Customer not found",
            )

    if "customer_group_id" in updates and updates["customer_group_id"]:
        group = (
            db.query(CustomerGroup)
            .filter(
                CustomerGroup.id == updates["customer_group_id"],
                CustomerGroup.organization_id == employee.organization_id,
            )
            .first()
        )

        if not group:
            raise HTTPException(
                status_code=404,
                detail="Customer group not found",
            )

    for field, value in updates.items():
        setattr(meeting, field, value)

    db.commit()
    db.refresh(meeting)

    return build_meeting_response(meeting)


@router.post(
    "/{meeting_id}/cancel",
    response_model=MeetingResponse,
    dependencies=[Depends(require_permission("MEETING.UPDATE"))],
)
def cancel_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(db, current_user)

    meeting = (
        db.query(Meeting)
        .filter(
            Meeting.id == meeting_id,
            Meeting.organization_id == employee.organization_id,
            Meeting.advisor_employee_id == employee.id,
        )
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found",
        )

    validate_meeting_owner(db, employee, meeting.customer_id, meeting.customer_group_id)

    if meeting.status not in {"SCHEDULED", "RESCHEDULED"}:
        raise HTTPException(409, "Only scheduled or rescheduled meetings can be cancelled")

    meeting.status = "CANCELLED"

    db.commit()
    db.refresh(meeting)

    return build_meeting_response(meeting)


@router.post(
    "/{meeting_id}/complete",
    response_model=MeetingResponse,
    dependencies=[Depends(require_permission("MEETING.UPDATE"))],
)
def complete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(db, current_user)
    meeting = db.query(Meeting).filter(
        Meeting.id == meeting_id,
        Meeting.organization_id == employee.organization_id,
        Meeting.advisor_employee_id == employee.id,
    ).first()
    if not meeting:
        raise HTTPException(404, "Meeting not found")
    validate_meeting_owner(db, employee, meeting.customer_id, meeting.customer_group_id)
    if meeting.status not in {"SCHEDULED", "RESCHEDULED"}:
        raise HTTPException(409, "Only scheduled or rescheduled meetings can be completed")
    meeting.status = "COMPLETED"
    db.commit()
    db.refresh(meeting)
    return build_meeting_response(meeting)
