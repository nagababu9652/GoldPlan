from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class ClientBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: Optional[str] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    occupation: Optional[str] = None
    pan_number: Optional[str] = None
    aadhar_number: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: Optional[str] = "India"
    annual_income: Optional[float] = None
    net_worth: Optional[float] = None
    risk_profile: Optional[str] = None
    investment_experience: Optional[str] = None
    financial_goals: Optional[str] = None
    nominee_name: Optional[str] = None
    nominee_relation: Optional[str] = None
    nominee_contact: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    account_type: Optional[str] = None
    kyc_status: Optional[str] = "pending"
    kyc_document_url: Optional[str] = None
    notes: Optional[str] = None
    group_id: Optional[int] = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    occupation: Optional[str] = None
    pan_number: Optional[str] = None
    aadhar_number: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: Optional[str] = None
    annual_income: Optional[float] = None
    net_worth: Optional[float] = None
    risk_profile: Optional[str] = None
    investment_experience: Optional[str] = None
    financial_goals: Optional[str] = None
    nominee_name: Optional[str] = None
    nominee_relation: Optional[str] = None
    nominee_contact: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    account_type: Optional[str] = None
    kyc_status: Optional[str] = None
    kyc_document_url: Optional[str] = None
    notes: Optional[str] = None
    group_id: Optional[int] = None
    is_active: Optional[bool] = None


class ClientResponse(ClientBase):
    id: int
    advisor_id: int
    is_active: bool
    assigned_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    group_name: Optional[str] = None

    class Config:
        from_attributes = True


class ClientListResponse(BaseModel):
    clients: list[ClientResponse]
    total: int
    page: int
    page_size: int