from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional


class OTPRequest(BaseModel):
    destination: str = Field(..., description="Email or mobile for OTP")
    purpose: str = Field(default="registration", pattern="^(registration|password_reset|login|email_verification)$")


class OTPVerifyRequest(BaseModel):
    destination: str
    otp_code: str = Field(..., min_length=6, max_length=6)
    purpose: str = Field(default="registration")


class OTPResponse(BaseModel):
    message: str
    expires_in_minutes: int = 10


class OTPVerifyResponse(BaseModel):
    message: str
    verified: bool


class Token(BaseModel):
    access_token: str
    token_type: str
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
    model_config = ConfigDict(extra="forbid")

    # Party fields
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    mobile_number: Optional[str] = Field(default=None, max_length=20)
    pan_number: Optional[str] = Field(default=None, max_length=20)
    aadhaar_number: Optional[str] = Field(default=None, max_length=20)
    legal_name: Optional[str] = Field(default=None, max_length=250)
    remarks: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: str = "India"

    # Auth fields
    password: str = Field(..., min_length=8)
    # Public registration creates an identity only. Roles and organization
    # membership are granted through authenticated onboarding/invitation flows.


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
