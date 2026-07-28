from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional


class OTPRequest(BaseModel):
    destination: str = Field(..., description="Email or mobile for OTP")
    purpose: str = Field(default="registration", pattern="^(registration|password_reset|login)$")


class OTPVerifyRequest(BaseModel):
    destination: str
    otp_code: str = Field(..., min_length=6, max_length=6)
    purpose: str = Field(default="registration")


class OTPResponse(BaseModel):
    message: str
    expires_in_minutes: int = 10
    otp_code: Optional[str] = Field(default=None, description="Development only")


class OTPVerifyResponse(BaseModel):
    message: str
    verified: bool


class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str
    expires_in: int


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    party_id: Optional[int] = None
    session_uuid: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None


class UserRegister(BaseModel):
    # Party fields
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    mobile_number: Optional[str] = Field(default=None, max_length=20)
    pan_number: Optional[str] = Field(default=None, max_length=20)
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

    # Auth fields
    password: str = Field(..., min_length=8)
    role: str = Field(default="user", pattern="^(user|advisor|employee|org_admin)$")

    # Optional org/branch assignment
    organization_id: Optional[int] = None
    branch_id: Optional[int] = None
    organization_name: Optional[str] = None
    branch_name: Optional[str] = None

    # Advisor-specific
    firm_name: Optional[str] = None
    registration_number: Optional[str] = None
    experience_years: Optional[int] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    party_id: int
    username: str
    email: str
    display_name: Optional[str] = None
    role: Optional[str] = None
    is_active: bool
    account_status: str
    created_at: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8)


class MessageResponse(BaseModel):
    message: str