from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

KYC_STATUSES = {"PENDING", "IN_PROGRESS", "VERIFIED", "REJECTED", "EXPIRED"}
SERVICE_ROLES = {"PARAPLANNER", "OPERATIONS", "COMPLIANCE"}


class KYCUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    kyc_status: str
    kyc_verified_date: date | None = None
    kyc_expiry_date: date | None = None
    verification_method: str | None = Field(default=None, max_length=50)
    verification_reference: str | None = Field(default=None, max_length=100)
    politically_exposed_person: bool = False
    remarks: str | None = None
    review_reason: str | None = None

    @field_validator("kyc_status")
    @classmethod
    def validate_status(cls, value):
        value = value.strip().upper()
        if value not in KYC_STATUSES: raise ValueError(f"Unsupported KYC status: {value}")
        return value

    @model_validator(mode="after")
    def validate_dates(self):
        if self.kyc_status == "VERIFIED" and self.kyc_verified_date is None:
            self.kyc_verified_date = date.today()
        if self.kyc_expiry_date and self.kyc_verified_date and self.kyc_expiry_date < self.kyc_verified_date:
            raise ValueError("KYC expiry date cannot be before verification date")
        return self


class KYCResponse(BaseModel):
    customer_id: int
    kyc_status: str
    kyc_verified_date: date | None = None
    kyc_expiry_date: date | None = None
    verification_method: str | None = None
    verification_reference: str | None = None
    politically_exposed_person: bool
    remarks: str | None = None


class KYCHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    previous_status: str | None
    new_status: str | None
    reviewed_on: datetime
    reviewed_by: int | None
    review_reason: str | None


class ServiceTeamCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    employee_id: int
    role: str
    remarks: str | None = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, value):
        value = value.strip().upper()
        if value not in SERVICE_ROLES: raise ValueError(f"Unsupported service role: {value}")
        return value


class ServiceTeamMemberResponse(BaseModel):
    assignment_id: int
    employee_id: int
    employee_name: str
    role: str
    effective_from: date
    remarks: str | None = None


class EmployeeOptionResponse(BaseModel):
    id: int
    display_name: str
    employee_code: str
