from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

GOAL_TYPES = {"RETIREMENT", "EDUCATION", "HOME_PURCHASE", "WEALTH_CREATION", "OTHER"}
GOAL_STATUSES = {"ACTIVE", "ON_TRACK", "NEEDS_ATTENTION", "ACHIEVED", "PAUSED", "CANCELLED"}


class GoalBase(BaseModel):
    model_config = ConfigDict(extra="forbid")
    customer_id: Optional[int] = None
    customer_group_id: Optional[int] = None
    goal_type: str
    title: str = Field(min_length=1, max_length=250)
    description: Optional[str] = None
    target_amount: Decimal = Field(gt=0, max_digits=18, decimal_places=2)
    current_amount: Decimal = Field(default=Decimal("0"), ge=0, max_digits=18, decimal_places=2)
    target_date: date
    priority: int = Field(default=3, ge=1, le=5)
    expected_inflation_rate: Optional[Decimal] = Field(default=None, ge=0, le=100)
    expected_return_rate: Optional[Decimal] = Field(default=None, ge=-100, le=100)
    status: str = "ACTIVE"
    remarks: Optional[str] = None

    @model_validator(mode="after")
    def validate_values(self):
        if (self.customer_id is None) == (self.customer_group_id is None):
            raise ValueError("Exactly one of customer_id or customer_group_id is required")
        self.goal_type = self.goal_type.strip().upper()
        self.status = self.status.strip().upper()
        if self.goal_type not in GOAL_TYPES:
            raise ValueError(f"Unsupported goal type: {self.goal_type}")
        if self.status not in GOAL_STATUSES:
            raise ValueError(f"Unsupported goal status: {self.status}")
        return self


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    goal_type: Optional[str] = None
    title: Optional[str] = Field(default=None, min_length=1, max_length=250)
    description: Optional[str] = None
    target_amount: Optional[Decimal] = Field(default=None, gt=0, max_digits=18, decimal_places=2)
    current_amount: Optional[Decimal] = Field(default=None, ge=0, max_digits=18, decimal_places=2)
    target_date: Optional[date] = None
    priority: Optional[int] = Field(default=None, ge=1, le=5)
    expected_inflation_rate: Optional[Decimal] = Field(default=None, ge=0, le=100)
    expected_return_rate: Optional[Decimal] = Field(default=None, ge=-100, le=100)
    status: Optional[str] = None
    remarks: Optional[str] = None

    @model_validator(mode="after")
    def validate_nonnullable_updates(self):
        required = (
            "goal_type", "title", "target_amount", "current_amount",
            "target_date", "priority", "status",
        )
        for field in required:
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")
        return self


class GoalResponse(GoalBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    organization_id: int
    progress_percentage: Decimal
    created_at: datetime
    updated_at: Optional[datetime] = None


class GoalListResponse(BaseModel):
    goals: list[GoalResponse]
    total: int
