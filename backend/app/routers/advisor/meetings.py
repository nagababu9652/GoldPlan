from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ...database.session import get_db
from ...models.crm.customer import Customer, CustomerGroup
from ...models.crm.meeting import Meeting
from ...models.organization.employee import Employee
from ...routers.advisors import get_current_advisor as get_current_user
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


@router.get("/", response_model=MeetingListResponse)
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

    return MeetingListResponse(
        meetings=[
            build_meeting_response(meeting)
            for meeting in meetings
        ],
        total=len(meetings),
    )


@router.get(
    "/{meeting_id}",
    response_model=MeetingResponse,
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

    return build_meeting_response(meeting)


@router.post(
    "/",
    response_model=MeetingResponse,
    status_code=201,
)
def create_meeting(
    payload: MeetingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(db, current_user)

    if payload.scheduled_end <= payload.scheduled_start:
        raise HTTPException(
            status_code=400,
            detail="Meeting end time must be after start time",
        )

    if not payload.customer_id and not payload.customer_group_id:
        raise HTTPException(
            status_code=400,
            detail="Meeting must be linked to a customer or customer group",
        )

    if payload.customer_id:
        customer = (
            db.query(Customer)
            .filter(
                Customer.id == payload.customer_id,
                Customer.organization_id == employee.organization_id,
            )
            .first()
        )

        if not customer:
            raise HTTPException(
                status_code=404,
                detail="Customer not found",
            )

    if payload.customer_group_id:
        group = (
            db.query(CustomerGroup)
            .filter(
                CustomerGroup.id == payload.customer_group_id,
                CustomerGroup.organization_id == employee.organization_id,
            )
            .first()
        )

        if not group:
            raise HTTPException(
                status_code=404,
                detail="Customer group not found",
            )

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
    db.commit()
    db.refresh(meeting)

    return build_meeting_response(meeting)


@router.put(
    "/{meeting_id}",
    response_model=MeetingResponse,
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

    meeting.status = "CANCELLED"

    db.commit()
    db.refresh(meeting)

    return build_meeting_response(meeting)