from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


EmploymentType = Literal["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "CONSULTANT"]
EmploymentStatus = Literal["ACTIVE", "ON_LEAVE", "RELIEVED", "INACTIVE"]


class EmployeeCreate(BaseModel):
    employee_code: str = Field(min_length=1, max_length=30)
    first_name: str = Field(min_length=1, max_length=100)
    middle_name: str | None = Field(None, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    display_name: str | None = Field(None, max_length=250)
    personal_email: EmailStr | None = None
    mobile_number: str | None = Field(None, max_length=20)
    date_of_birth: date | None = None
    branch_id: int
    department_id: int
    designation_id: int
    employment_type: EmploymentType = "FULL_TIME"
    joining_date: date
    confirmation_date: date | None = None
    official_email: EmailStr
    official_mobile: str | None = Field(None, max_length=30)
    reporting_manager_employee_id: int | None = None
    remarks: str | None = None


class EmployeeUpdate(BaseModel):
    first_name: str | None = Field(None, min_length=1, max_length=100)
    middle_name: str | None = Field(None, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    display_name: str | None = Field(None, min_length=1, max_length=250)
    personal_email: EmailStr | None = None
    mobile_number: str | None = Field(None, max_length=20)
    date_of_birth: date | None = None
    branch_id: int | None = None
    department_id: int | None = None
    designation_id: int | None = None
    employment_type: EmploymentType | None = None
    employment_status: EmploymentStatus | None = None
    joining_date: date | None = None
    confirmation_date: date | None = None
    official_email: EmailStr | None = None
    official_mobile: str | None = Field(None, max_length=30)
    reporting_manager_employee_id: int | None = None
    remarks: str | None = None


class EmployeeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    organization_id: int
    party_id: int
    employee_code: str
    first_name: str | None
    middle_name: str | None
    last_name: str | None
    display_name: str
    personal_email: str | None
    mobile_number: str | None
    date_of_birth: date | None
    branch_id: int
    department_id: int
    designation_id: int
    employment_type: str
    joining_date: date
    confirmation_date: date | None
    relieving_date: date | None
    employment_status: str
    official_email: str | None
    official_mobile: str | None
    reporting_manager_employee_id: int | None
    remarks: str | None
    is_active: bool
    created_at: datetime


class EmploymentHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    effective_from: date | None
    effective_to: date | None
    remarks: str | None = None
    branch_id: int | None = None
    department_id: int | None = None
    designation_id: int | None = None
    manager_employee_id: int | None = None
