from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..schemas.user import (
    UserCreate, UserLogin, UserResponse, Token, PasswordReset, PasswordResetConfirm, MessageResponse
)
from ..schemas.otp import (
    OTPSendRequest, OTPVerifyRequest, OTPResponse, OTPVerifyResponse
)
from ..services import auth
from ..services.otp_service import create_otp, verify_otp

router = APIRouter(prefix="/auth", tags=["authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.post("/send-otp", response_model=OTPResponse)
def send_otp(request: OTPSendRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Send OTP to email for verification."""
    otp = create_otp(db, request.email, request.purpose, background_tasks)
    # In development, return the OTP in the response for testing
    return OTPResponse(
        message=f"OTP sent to {request.email}",
        expires_in_minutes=10,
        otp_code=otp.otp_code  # Return OTP for development/testing
    )


@router.post("/verify-otp", response_model=OTPVerifyResponse)
def verify_otp_endpoint(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    """Verify OTP code."""
    is_valid = verify_otp(db, request.email, request.otp_code, request.purpose)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    return OTPVerifyResponse(
        message="OTP verified successfully",
        verified=True
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = auth.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = auth.create_user(db, user_data.model_dump())
    return user


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, response: Response, db: Session = Depends(get_db)):
    # Authenticate user
    user = auth.authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    # Create tokens
    access_token = auth.create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role}
    )
    refresh_token = auth.create_refresh_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    # Update last login
    auth.update_last_login(db, user)
    
    # Set refresh token as HTTP-only cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=7 * 24 * 60 * 60,  # 7 days
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response):
    response.delete_cookie(key="refresh_token")
    return MessageResponse(message="Successfully logged out")


@router.post("/refresh", response_model=Token)
def refresh(request: Request, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found"
        )
    
    payload = auth.decode_token(refresh_token)
    if not payload or payload.sub is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user = auth.get_user_by_id(db, int(payload.sub))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new access token
    access_token = auth.create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role}
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = auth.decode_token(token)
    if payload is None or payload.sub is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = auth.get_user_by_id(db, int(payload.sub))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.post("/forgot-password", response_model=OTPResponse)
def forgot_password(request: PasswordReset, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Send OTP to email for password reset."""
    # Check if user exists
    user = auth.get_user_by_email(db, request.email)
    if not user:
        # Don't reveal if email exists or not (security best practice)
        # But still return success to prevent email enumeration
        return OTPResponse(
            message="If an account exists with this email, a password reset OTP has been sent",
            expires_in_minutes=10
        )
    
    # Send OTP for password reset
    otp = create_otp(db, request.email, "password_reset", background_tasks)
    
    # In development, return the OTP in the response for testing
    return OTPResponse(
        message=f"Password reset OTP sent to {request.email}",
        expires_in_minutes=10,
        otp_code=otp.otp_code  # Return OTP for development/testing
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(request: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Reset password using OTP verification."""
    # Verify OTP first
    is_valid = verify_otp(db, request.email, request.otp_code, "password_reset")
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    # Get user
    user = auth.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.password_hash = auth.get_password_hash(request.new_password)
    db.commit()
    
    return MessageResponse(message="Password reset successfully. You can now login with your new password.")


# Import at the end to avoid circular imports
from fastapi import Request
from ..core.config import settings