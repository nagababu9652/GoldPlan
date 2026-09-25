from datetime import date, time, datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MeetingCreate(BaseModel):
    client_id: int

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )

    meeting_date: date
    meeting_time: time

    meeting_type: str = Field(
        default="virtual",
        pattern="^(virtual|in_person|phone)$",
    )

    status: str = Field(
        default="scheduled",
        pattern="^(scheduled|completed|cancelled)$",
    )

    notes: Optional[str] = None


class MeetingUpdate(BaseModel):
    client_id: Optional[int] = None
    title: Optional[str] = None
    meeting_date: Optional[date] = None
    meeting_time: Optional[time] = None

    meeting_type: Optional[str] = Field(
        default=None,
        pattern="^(virtual|in_person|phone)$",
    )

    status: Optional[str] = Field(
        default=None,
        pattern="^(scheduled|completed|cancelled)$",
    )

    notes: Optional[str] = None


class MeetingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    advisor_id: int
    client_id: int

    client_name: str

    title: str
    meeting_date: date
    meeting_time: time

    meeting_type: str
    status: str

    notes: Optional[str] = None

    created_at: datetime
    updated_at: Optional[datetime] = None


class MeetingListResponse(BaseModel):
    meetings: list[MeetingResponse]
    total: int
    page: int
    page_size: int
    total_pages: int