from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

TASK_TYPES = {"FOLLOW_UP", "CALL", "EMAIL", "DOCUMENT", "REVIEW", "REMINDER", "OTHER"}
TASK_PRIORITIES = {"LOW", "MEDIUM", "HIGH"}
TASK_STATUSES = {"PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"}


class TaskBase(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str = Field(
        ...,
        min_length=1,
        max_length=250,
    )

    task_type: str = "FOLLOW_UP"

    description: Optional[str] = None

    due_at: datetime

    priority: str = "MEDIUM"

    status: str = "PENDING"

    notes: Optional[str] = None

    customer_id: Optional[int] = None

    customer_group_id: Optional[int] = None

    @field_validator("task_type")
    @classmethod
    def validate_type(cls, value: str) -> str:
        value = value.strip().upper()
        if value not in TASK_TYPES:
            raise ValueError(f"Unsupported task type: {value}")
        return value

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value: str) -> str:
        value = value.strip().upper()
        if value not in TASK_PRIORITIES:
            raise ValueError(f"Unsupported task priority: {value}")
        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        value = value.strip().upper()
        if value not in TASK_STATUSES:
            raise ValueError(f"Unsupported task status: {value}")
        return value

    @model_validator(mode="after")
    def validate_owner(self):
        if self.customer_id is None and self.customer_group_id is None:
            raise ValueError("A customer or customer group is required")
        return self


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=250,
    )

    task_type: Optional[str] = None

    description: Optional[str] = None

    due_at: Optional[datetime] = None

    priority: Optional[str] = None

    status: Optional[str] = None

    notes: Optional[str] = None

    customer_id: Optional[int] = None

    customer_group_id: Optional[int] = None

    @field_validator("task_type")
    @classmethod
    def validate_type(cls, value):
        if value is None: return value
        value = value.strip().upper()
        if value not in TASK_TYPES: raise ValueError(f"Unsupported task type: {value}")
        return value

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value):
        if value is None: return value
        value = value.strip().upper()
        if value not in TASK_PRIORITIES: raise ValueError(f"Unsupported task priority: {value}")
        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        if value is None: return value
        value = value.strip().upper()
        if value not in TASK_STATUSES: raise ValueError(f"Unsupported task status: {value}")
        return value


class TaskResponse(TaskBase):
    id: int

    organization_id: int

    assigned_employee_id: int

    customer_name: Optional[str] = None

    group_name: Optional[str] = None

    completed_at: Optional[datetime] = None

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]

    total: int
