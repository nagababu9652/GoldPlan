from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class MeetingBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=250)

    meeting_type: str = "REVIEW"

    description: Optional[str] = None

    scheduled_start: datetime

    scheduled_end: datetime

    location: Optional[str] = None

    meeting_link: Optional[str] = None

    status: str = "SCHEDULED"

    outcome: Optional[str] = None

    notes: Optional[str] = None

    customer_id: Optional[int] = None

    customer_group_id: Optional[int] = None


class MeetingCreate(MeetingBase):
    pass


class MeetingUpdate(BaseModel):
    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=250,
    )

    meeting_type: Optional[str] = None

    description: Optional[str] = None

    scheduled_start: Optional[datetime] = None

    scheduled_end: Optional[datetime] = None

    location: Optional[str] = None

    meeting_link: Optional[str] = None

    status: Optional[str] = None

    outcome: Optional[str] = None

    notes: Optional[str] = None

    customer_id: Optional[int] = None

    customer_group_id: Optional[int] = None


class MeetingResponse(MeetingBase):
    id: int

    organization_id: int

    advisor_employee_id: int

    customer_name: Optional[str] = None

    group_name: Optional[str] = None

    created_at: datetime

    updated_at: datetime

    class Config:
        from_attributes = True


class MeetingListResponse(BaseModel):
    meetings: list[MeetingResponse]

    total: int