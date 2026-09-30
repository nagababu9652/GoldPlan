from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .group_options import GROUP_RELATIONSHIPS


# ============================================================
# HOUSEHOLD / GROUP
# ============================================================

class GroupCreate(BaseModel):
    group_name: str = Field(..., min_length=1, max_length=250)
    group_type: str = Field(default="HOUSEHOLD", max_length=30)
    risk_profile: Optional[str] = Field(default=None, max_length=30)
    investment_objective: Optional[str] = Field(default=None, max_length=100)
    remarks: Optional[str] = None

    # Optional initial member/head.
    # If supplied, the client becomes head; only household membership is primary.
    head_customer_id: Optional[int] = None

    @field_validator("group_type")
    @classmethod
    def validate_group_type(cls, value: str) -> str:
        normalized = value.strip().upper()
        if normalized not in GROUP_RELATIONSHIPS:
            raise ValueError("Group type must be one of: " + ", ".join(GROUP_RELATIONSHIPS))
        return normalized


class GroupUpdate(BaseModel):
    group_name: Optional[str] = Field(default=None, min_length=1, max_length=250)
    group_type: Optional[str] = Field(default=None, max_length=30)
    risk_profile: Optional[str] = Field(default=None, max_length=30)
    investment_objective: Optional[str] = Field(default=None, max_length=100)
    remarks: Optional[str] = None


class GroupMemberAdd(BaseModel):
    customer_id: int
    relationship_type: Optional[str] = Field(default="OTHER", max_length=50)
    is_group_head: bool = False
    remarks: Optional[str] = None


class GroupHeadUpdate(BaseModel):
    customer_id: int


class MoveHouseholdRequest(BaseModel):
    customer_id: int
    relationship_type: Optional[str] = Field(
        default="SELF",
        max_length=50,
    )
    new_head_customer_id: Optional[int] = None


class GroupMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    customer_code: str

    display_name: str
    email: Optional[str] = None
    phone: Optional[str] = None

    relationship_type: Optional[str] = None

    is_group_head: bool
    is_primary: bool

    joined_on: Optional[date] = None
    left_on: Optional[date] = None

    remarks: Optional[str] = None


class GroupResponse(BaseModel):
    id: int
    organization_id: int

    group_code: str
    group_name: str
    group_type: str

    head_customer_id: Optional[int] = None
    primary_branch_id: Optional[int] = None
    primary_advisor_employee_id: Optional[int] = None

    risk_profile: Optional[str] = None
    investment_objective: Optional[str] = None
    remarks: Optional[str] = None

    is_active: bool

    member_count: int = 0
    active_member_count: int = 0

    head_customer_name: Optional[str] = None

    created_at: datetime
    updated_at: Optional[datetime] = None


class GroupListResponse(BaseModel):
    groups: list[GroupResponse]
    total: int


class GroupMemberListResponse(BaseModel):
    group_id: int
    members: list[GroupMemberResponse]
    total: int


class GroupActionResponse(BaseModel):
    message: str
    group: GroupResponse
