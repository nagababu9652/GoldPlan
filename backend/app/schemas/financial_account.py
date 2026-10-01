from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

ACCOUNT_TYPES = {
    "BANK", "CASH", "MUTUAL_FUND_FOLIO", "BROKERAGE_DEMAT", "FIXED_DEPOSIT",
    "PPF", "EPF", "NPS", "INSURANCE_CASH_VALUE", "LOAN", "OTHER",
}
ACCOUNT_STATUSES = {"ACTIVE", "CLOSED", "MATURED", "FROZEN"}
LIABILITY_TYPES = {"LOAN"}


class FinancialAccountBase(BaseModel):
    model_config = ConfigDict(extra="forbid")
    customer_id: Optional[int] = None
    customer_group_id: Optional[int] = None
    account_type: str
    account_name: str = Field(min_length=1, max_length=250)
    institution_name: Optional[str] = None
    account_number_masked: Optional[str] = Field(default=None, max_length=100)
    currency_code: str = Field(default="INR", min_length=3, max_length=3)
    current_balance: Decimal = Field(default=Decimal("0"), ge=0, max_digits=18, decimal_places=2)
    valuation_as_of: Optional[date] = None
    opened_on: Optional[date] = None
    maturity_date: Optional[date] = None
    interest_rate: Optional[Decimal] = Field(default=None, ge=0, le=100)
    status: str = "ACTIVE"
    remarks: Optional[str] = None

    @model_validator(mode="after")
    def normalize_and_validate(self):
        if (self.customer_id is None) == (self.customer_group_id is None):
            raise ValueError("Exactly one of customer_id or customer_group_id is required")
        self.account_type = self.account_type.strip().upper()
        self.status = self.status.strip().upper()
        self.currency_code = self.currency_code.strip().upper()
        if self.account_type not in ACCOUNT_TYPES:
            raise ValueError(f"Unsupported account type: {self.account_type}")
        if self.status not in ACCOUNT_STATUSES:
            raise ValueError(f"Unsupported account status: {self.status}")
        return self


class FinancialAccountCreate(FinancialAccountBase):
    pass


class FinancialAccountUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    account_type: Optional[str] = None
    account_name: Optional[str] = Field(default=None, min_length=1, max_length=250)
    institution_name: Optional[str] = None
    account_number_masked: Optional[str] = Field(default=None, max_length=100)
    currency_code: Optional[str] = Field(default=None, min_length=3, max_length=3)
    current_balance: Optional[Decimal] = Field(default=None, ge=0, max_digits=18, decimal_places=2)
    valuation_as_of: Optional[date] = None
    opened_on: Optional[date] = None
    maturity_date: Optional[date] = None
    interest_rate: Optional[Decimal] = Field(default=None, ge=0, le=100)
    status: Optional[str] = None
    remarks: Optional[str] = None

    @model_validator(mode="after")
    def reject_null_required_fields(self):
        for field in ("account_type", "account_name", "currency_code", "current_balance", "status"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")
        return self


class FinancialAccountResponse(FinancialAccountBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    organization_id: int
    account_nature: str
    created_at: datetime
    updated_at: Optional[datetime] = None


class FinancialAccountListResponse(BaseModel):
    accounts: list[FinancialAccountResponse]
    total: int
