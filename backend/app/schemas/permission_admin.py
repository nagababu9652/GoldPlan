from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict


class PermissionItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    permission_code: str
    permission_name: str
    module_name: str


class PermissionProfileItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    profile_code: str
    profile_name: str
    description: str | None = None
    organization_id: int | None = None


class EmployeeProfileSet(BaseModel):
    profile_ids: list[int]


class PermissionOverrideInput(BaseModel):
    permission_code: str
    allow_access: bool


class EmployeeOverrideSet(BaseModel):
    overrides: list[PermissionOverrideInput]


class EmployeePermissionState(BaseModel):
    employee_id: int
    profiles: list[PermissionProfileItem]
    overrides: list[PermissionOverrideInput]


class EmployeeAssignmentInput(BaseModel):
    entity_type: Literal["CUSTOMER", "CUSTOMER_GROUP", "BRANCH"]
    entity_id: int
    effective_from: date
    is_primary: bool = False
    remarks: str | None = None


class EmployeeAssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    employee_id: int
    assignment_type: str
    entity_type: str
    entity_id: int
    entity_name: str
    effective_from: date
    effective_to: date | None
    is_primary: bool
    remarks: str | None
    is_active: bool


class AssignmentEndInput(BaseModel):
    effective_to: date
