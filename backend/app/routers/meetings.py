from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.meeting import Meeting
from ..models.crm.customer import Customer
from ..models.identity.auth import User
from ..routers.advisors import get_current_advisor
from ..schemas.meeting import (
    MeetingCreate,
    MeetingListResponse,
    MeetingResponse,
    MeetingUpdate,
)

from datetime import date
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/advisors/meetings",
    tags=["advisor-meetings"],
)


def build_meeting_response(meeting: Meeting) -> MeetingResponse:
    """Convert a Meeting ORM object into the API response."""

    return MeetingResponse(
        id=meeting.id,
        advisor_id=meeting.advisor_id,
        client_id=meeting.client_id,
        client_name=meeting.client.party.display_name,
        title=meeting.title,
        meeting_date=meeting.meeting_date,
        meeting_time=meeting.meeting_time,
        meeting_type=meeting.meeting_type,
        status=meeting.status,
        notes=meeting.notes,
        created_at=meeting.created_at,
        updated_at=meeting.updated_at,
    )


@router.get("", response_model=MeetingListResponse)
def get_meetings(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(
        default=None,
        alias="status",
        pattern="^(scheduled|completed|cancelled)$",
    ),
    meeting_type: str | None = Query(
        default=None,
        pattern="^(virtual|in_person|phone)$",
    ),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    advisor: User = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    query = db.query(Meeting).filter(
        Meeting.advisor_id == advisor.id,
    )

    if status_filter:
        query = query.filter(Meeting.status == status_filter)
    else:
        # Preserve the previous API behavior:
        # cancelled meetings are excluded by default.
        query = query.filter(Meeting.status != "cancelled")

    if meeting_type:
        query = query.filter(Meeting.meeting_type == meeting_type)

    if date_from:
        query = query.filter(Meeting.meeting_date >= date_from)

    if date_to:
        query = query.filter(Meeting.meeting_date <= date_to)

    if date_from and date_to and date_from > date_to:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="date_from cannot be after date_to",
        )

    total = query.count()

    meetings = (
        query
        .order_by(
            Meeting.meeting_date.asc(),
            Meeting.meeting_time.asc(),
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    total_pages = ceil(total / page_size) if total else 0

    return MeetingListResponse(
        meetings=[build_meeting_response(meeting) for meeting in meetings],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/today", response_model=MeetingListResponse)
def get_today_meetings(
    advisor: User = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    from datetime import date

    today = date.today()

    meetings = (
        db.query(Meeting)
        .filter(
            Meeting.advisor_id == advisor.id,
            Meeting.meeting_date == today,
            Meeting.status == "scheduled",
        )
        .order_by(Meeting.meeting_time.asc())
        .all()
    )

    return MeetingListResponse(
    meetings=[build_meeting_response(meeting) for meeting in meetings],
    total=len(meetings),
    page=1,
    page_size=len(meetings) if meetings else 20,
    total_pages=1 if meetings else 0,
    )


@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(
    meeting_id: int,
    advisor: User = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    meeting = (
        db.query(Meeting)
        .filter(
            Meeting.id == meeting_id,
            Meeting.advisor_id == advisor.id,
        )
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found",
        )

    return build_meeting_response(meeting)


@router.post(
    "",
    response_model=MeetingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_meeting(
    payload: MeetingCreate,
    advisor: User = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    client = (
        db.query(Customer)
        .filter(
            Customer.id == payload.client_id,
            Customer.customer_status == "ACTIVE",
        )
        .first()
    )

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    meeting = Meeting(
        advisor_id=advisor.id,
        client_id=payload.client_id,
        title=payload.title,
        meeting_date=payload.meeting_date,
        meeting_time=payload.meeting_time,
        meeting_type=payload.meeting_type,
        status=payload.status,
        notes=payload.notes,
        created_by=advisor.id,
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
    advisor: User = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    meeting = (
        db.query(Meeting)
        .filter(
            Meeting.id == meeting_id,
            Meeting.advisor_id == advisor.id,
        )
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found",
        )

    values = payload.model_dump(exclude_unset=True)

    if "client_id" in values:
        client = (
            db.query(Customer)
            .filter(
                Customer.id == values["client_id"],
                Customer.customer_status == "ACTIVE",
            )
            .first()
        )

        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found",
            )

    for field, value in values.items():
        setattr(meeting, field, value)

    meeting.updated_by = advisor.id

    db.commit()
    db.refresh(meeting)

    return build_meeting_response(meeting)


@router.delete(
    "/{meeting_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_meeting(
    meeting_id: int,
    advisor: User = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    meeting = (
        db.query(Meeting)
        .filter(
            Meeting.id == meeting_id,
            Meeting.advisor_id == advisor.id,
        )
        .first()
    )

    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found",
        )

    meeting.status = "cancelled"
    meeting.updated_by = advisor.id

    db.commit()