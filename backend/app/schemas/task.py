from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TaskBase(BaseModel):
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


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
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


class TaskResponse(TaskBase):
    id: int

    organization_id: int

    assigned_employee_id: int

    customer_name: Optional[str] = None

    group_name: Optional[str] = None

    completed_at: Optional[datetime] = None

    created_at: datetime

    updated_at: datetime

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]

    total: int