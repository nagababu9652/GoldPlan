from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

MESSAGE_TYPES = {"CLIENT_MESSAGE", "FOLLOW_UP", "GENERAL", "INTERNAL"}
MESSAGE_STATUSES = {"SENT", "READ", "ARCHIVED"}


class MessageBase(BaseModel):
    model_config = ConfigDict(extra="forbid")
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

    @field_validator("message_type")
    @classmethod
    def validate_type(cls, value):
        value = value.strip().upper()
        if value not in MESSAGE_TYPES: raise ValueError(f"Unsupported message type: {value}")
        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        value = value.strip().upper()
        if value not in MESSAGE_STATUSES: raise ValueError(f"Unsupported message status: {value}")
        return value

    @model_validator(mode="after")
    def validate_owner(self):
        if self.customer_id is None and self.customer_group_id is None:
            raise ValueError("A message recipient is required")
        return self


class MessageCreate(MessageBase):
    pass


class MessageUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    subject: Optional[str] = Field(
        default=None,
        max_length=250,
    )

    body: Optional[str] = Field(
        default=None,
        min_length=1,
    )

    status: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        if value is None: return value
        value = value.strip().upper()
        if value not in MESSAGE_STATUSES: raise ValueError(f"Unsupported message status: {value}")
        return value


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

    model_config = ConfigDict(from_attributes=True)


class MessageListResponse(BaseModel):
    messages: list[MessageResponse]
    total: int
