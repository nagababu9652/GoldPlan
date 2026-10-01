from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

MEETING_TYPES = {"REVIEW", "PLANNING", "ONBOARDING", "KYC", "INVESTMENT", "SERVICE", "FOLLOW_UP", "OTHER"}
MEETING_STATUSES = {"SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"}


class MeetingBase(BaseModel):
    model_config = ConfigDict(extra="forbid")
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

    @field_validator("meeting_type")
    @classmethod
    def validate_meeting_type(cls, value: str) -> str:
        normalized = value.strip().upper()
        if normalized not in MEETING_TYPES:
            raise ValueError(f"Unsupported meeting type: {value}")
        return normalized

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        normalized = value.strip().upper()
        if normalized not in MEETING_STATUSES:
            raise ValueError(f"Unsupported meeting status: {value}")
        return normalized

    @model_validator(mode="after")
    def validate_schedule_and_owner(self):
        if self.scheduled_end <= self.scheduled_start:
            raise ValueError("Meeting end time must be after start time")
        if self.customer_id is None and self.customer_group_id is None:
            raise ValueError("A customer or customer group is required")
        return self


class MeetingCreate(MeetingBase):
    pass


class MeetingUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
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

    @field_validator("meeting_type")
    @classmethod
    def validate_meeting_type(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        normalized = value.strip().upper()
        if normalized not in MEETING_TYPES:
            raise ValueError(f"Unsupported meeting type: {value}")
        return normalized

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        normalized = value.strip().upper()
        if normalized not in MEETING_STATUSES:
            raise ValueError(f"Unsupported meeting status: {value}")
        return normalized


class MeetingResponse(MeetingBase):
    id: int

    organization_id: int

    advisor_employee_id: int

    customer_name: Optional[str] = None

    group_name: Optional[str] = None

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MeetingListResponse(BaseModel):
    meetings: list[MeetingResponse]

    total: int
