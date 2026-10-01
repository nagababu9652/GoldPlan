from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class OrganizationUpdate(BaseModel):
    legal_name: str | None = Field(None, min_length=2, max_length=250)
    trade_name: str | None = Field(None, max_length=250)
    organization_type: str | None = Field(None, max_length=50)
    registration_number: str | None = Field(None, max_length=100)
    pan_number: str | None = Field(None, max_length=20)
    gst_number: str | None = Field(None, max_length=20)
    email: EmailStr | None = None
    phone: str | None = Field(None, max_length=30)
    website: str | None = Field(None, max_length=250)
    logo_url: str | None = None
    financial_year_start: str | None = Field(None, pattern=r"^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$")
    default_currency_code: str | None = Field(None, min_length=3, max_length=3)
    timezone: str | None = Field(None, max_length=100)


class OrganizationResponse(OrganizationUpdate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    organization_code: str
    is_active: bool
    created_at: datetime
    updated_at: datetime | None = None


class BranchInput(BaseModel):
    branch_code: str = Field(min_length=1, max_length=30)
    branch_name: str = Field(min_length=2, max_length=200)
    branch_type: Literal["HEAD_OFFICE", "BRANCH", "OTHER"] = "BRANCH"
    parent_branch_id: int | None = None
    email: EmailStr | None = None
    phone: str | None = Field(None, max_length=30)
    address: str | None = None
    city: str | None = Field(None, max_length=100)
    district: str | None = Field(None, max_length=100)
    state: str | None = Field(None, max_length=100)
    country: str = Field("India", max_length=100)
    postal_code: str | None = Field(None, max_length=15)
    opening_date: date | None = None
    closing_date: date | None = None
    remarks: str | None = None


class BranchUpdate(BaseModel):
    branch_name: str | None = Field(None, min_length=2, max_length=200)
    branch_type: Literal["HEAD_OFFICE", "BRANCH", "OTHER"] | None = None
    parent_branch_id: int | None = None
    email: EmailStr | None = None
    phone: str | None = Field(None, max_length=30)
    address: str | None = None
    city: str | None = Field(None, max_length=100)
    district: str | None = Field(None, max_length=100)
    state: str | None = Field(None, max_length=100)
    country: str | None = Field(None, max_length=100)
    postal_code: str | None = Field(None, max_length=15)
    opening_date: date | None = None
    closing_date: date | None = None
    remarks: str | None = None


class BranchResponse(BranchInput):
    model_config = ConfigDict(from_attributes=True)
    id: int
    organization_id: int
    is_active: bool


class DepartmentInput(BaseModel):
    branch_id: int
    department_code: str = Field(min_length=1, max_length=30)
    department_name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    head_employee_id: int | None = None


class DepartmentUpdate(BaseModel):
    branch_id: int | None = None
    department_name: str | None = Field(None, min_length=2, max_length=150)
    description: str | None = None
    head_employee_id: int | None = None


class DepartmentResponse(DepartmentInput):
    model_config = ConfigDict(from_attributes=True)
    id: int
    organization_id: int
    is_active: bool


class DesignationInput(BaseModel):
    designation_code: str = Field(min_length=1, max_length=30)
    designation_name: str = Field(min_length=2, max_length=150)
    hierarchy_level: int | None = Field(None, ge=1)
    description: str | None = None


class DesignationUpdate(BaseModel):
    designation_name: str | None = Field(None, min_length=2, max_length=150)
    hierarchy_level: int | None = Field(None, ge=1)
    description: str | None = None


class DesignationResponse(DesignationInput):
    model_config = ConfigDict(from_attributes=True)
    id: int
    organization_id: int
    is_active: bool
