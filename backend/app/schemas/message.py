from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class MessageBase(BaseModel):
    message_type: str = "CLIENT_MESSAGE"

    subject: Optional[str] = Field(
        default=None,
        max_length=250,
    )

    body: str = Field(
        ...,
        min_length=1,
    )

    status: str = "SENT"

    customer_id: Optional[int] = None
    customer_group_id: Optional[int] = None


class MessageCreate(MessageBase):
    pass


class MessageUpdate(BaseModel):
    subject: Optional[str] = Field(
        default=None,
        max_length=250,
    )

    body: Optional[str] = Field(
        default=None,
        min_length=1,
    )

    status: Optional[str] = None


class MessageResponse(MessageBase):
    id: int

    organization_id: int
    sender_employee_id: int

    customer_name: Optional[str] = None
    group_name: Optional[str] = None

    sent_at: datetime
    read_at: Optional[datetime] = None

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    messages: list[MessageResponse]
    total: int