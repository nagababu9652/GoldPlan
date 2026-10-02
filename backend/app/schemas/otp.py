from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class OTPSendRequest(BaseModel):
    email: EmailStr
    purpose: str = Field(default="registration", pattern="^(registration|password_reset|email_verification)$")


class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
    purpose: str = Field(default="registration", pattern="^(registration|password_reset|email_verification)$")


class OTPResponse(BaseModel):
    message: str
    expires_in_minutes: int = 10


class OTPVerifyResponse(BaseModel):
    message: str
    verified: bool
