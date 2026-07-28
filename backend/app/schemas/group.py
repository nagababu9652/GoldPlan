from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class GroupBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    group_type: str = Field(default="family")
    description: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    head_client_id: Optional[int] = None


class GroupCreate(GroupBase):
    pass


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    group_type: Optional[str] = None
    description: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    head_client_id: Optional[int] = None
    is_active: Optional[bool] = None


class GroupResponse(GroupBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    advisor_id: int
    is_active: bool
    total_investment: float
    client_count: int
    head_client_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class GroupListResponse(BaseModel):
    groups: list[GroupResponse]
    total: int


class GroupMemberAction(BaseModel):
    client_id: int