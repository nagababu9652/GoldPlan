from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: str = Field(default="user", pattern="^(user|advisor)$")
    firm_name: Optional[str] = None
    registration_number: Optional[str] = None
    experience_years: Optional[int] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    role: str
    created_at: str
    last_login: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str
    expires_in: int


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None


class PasswordReset(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8)


class MessageResponse(BaseModel):
    message: str


class ClientBase(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    occupation: Optional[str] = None
    pan_number: Optional[str] = None
    aadhar_number: Optional[str] = None
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
    kyc_document_url: Optional[str] = None


class ClientCreate(ClientBase):
    password: str = Field(..., min_length=8)


class ClientLogin(BaseModel):
    email: EmailStr
    password: str


class ClientResponse(ClientBase):
    id: int
    advisor_id: int
    group_id: Optional[int] = None
    is_active: bool
    kyc_status: str
    assigned_date: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
