"""
Authentication Router - handles registration, login, logout, OTP, password management.
Uses the new identity schema with session management.
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..schemas.auth import (
    UserRegister, UserLogin, UserResponse, Token,
    PasswordResetRequest, PasswordResetConfirm,
    OTPRequest as OTPRequestSchema,
    OTPVerifyRequest, OTPResponse, OTPVerifyResponse,
    MessageResponse
)
from ..services import auth_service as auth
from ..services.otp_service import create_otp, verify_otp
from ..core.config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.post("/send-otp", response_model=OTPResponse)
def send_otp(
    request: OTPRequestSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Send OTP to email for verification."""
    otp = create_otp(
        db=db,
        destination=request.destination,
        purpose=request.purpose,
        background_tasks=background_tasks
    )
    return OTPResponse(
        message=f"OTP sent to {request.destination}",
        expires_in_minutes=10,
        otp_code=getattr(otp, '_plain_otp', None)  # Return OTP for development/testing
    )


@router.post("/verify-otp", response_model=OTPVerifyResponse)
def verify_otp_endpoint(
    request: OTPVerifyRequest,
    db: Session = Depends(get_db)
):
    """Verify OTP code."""
    is_valid = verify_otp(db, request.destination, request.otp_code, request.purpose)
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
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user with party creation."""
    # Check if user already exists
    existing_user = auth.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    try:
        user = auth.create_user(db, user_data.model_dump())
        return UserResponse(
            id=user.id,
            party_id=user.party_id,
            username=user.username,
            email=user.email,
            display_name=user.display_name,
            is_active=user.is_active,
            account_status=user.account_status,
            created_at=user.created_at.isoformat() if user.created_at else ""
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}")


@router.post("/login", response_model=Token)
def login(
    credentials: UserLogin,
    response: Response,
    request: Request,
    db: Session = Depends(get_db)
):
    """Authenticate user and create session with tokens."""
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
    
    # Create session with tokens
    session, access_token, refresh_token = auth.create_session(
        db=db,
        user=user,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    
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
def logout(
    response: Response,
    request: Request,
    db: Session = Depends(get_db)
):
    """Logout by invalidating session from refresh token cookie."""
    refresh_token_str = request.cookies.get("refresh_token")
    if refresh_token_str:
        # Decode to get session UUID
        payload = auth.decode_token(refresh_token_str)
        if payload and payload.session_uuid:
            auth.logout_session(db, payload.session_uuid)
    
    response.delete_cookie(key="refresh_token")
    return MessageResponse(message="Successfully logged out")


@router.post("/refresh", response_model=Token)
def refresh_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token."""
    refresh_token_str = request.cookies.get("refresh_token")
    if not refresh_token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found"
        )
    
    result = auth.refresh_session(db, refresh_token_str)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    new_access_token, new_refresh_token = result
    
    # Set new refresh token as HTTP-only cookie
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
    )
    
    return Token(
        access_token=new_access_token,
        token_type="bearer",
        refresh_token=new_refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Get current authenticated user info."""
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
    
    return UserResponse(
        id=user.id,
        party_id=user.party_id,
        username=user.username,
        email=user.email,
        display_name=user.display_name,
        is_active=user.is_active,
        account_status=user.account_status,
        created_at=user.created_at.isoformat() if user.created_at else ""
    )


@router.post("/forgot-password", response_model=OTPResponse)
def forgot_password(
    request: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Send OTP to email for password reset."""
    # Check if user exists
    user = auth.get_user_by_email(db, request.email)
    if not user:
        # Don't reveal if email exists or not (security best practice)
        return OTPResponse(
            message="If an account exists with this email, a password reset OTP has been sent",
            expires_in_minutes=10
        )
    
    # Send OTP for password reset
    otp = create_otp(
        db=db,
        destination=request.email,
        purpose="password_reset",
        user_id=user.id,
        background_tasks=background_tasks
    )
    
    return OTPResponse(
        message=f"Password reset OTP sent to {request.email}",
        expires_in_minutes=10,
        otp_code=getattr(otp, '_plain_otp', None)  # Return OTP for development/testing
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(
    request: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
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
    
    # Reset password
    auth.reset_password(db, user, request.new_password)
    
    return MessageResponse(message="Password reset successfully. You can now login with your new password.")


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    request: dict,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Change password for authenticated user."""
    payload = auth.decode_token(token)
    if payload is None or payload.sub is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    user = auth.get_user_by_id(db, int(payload.sub))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    old_password = request.get("old_password")
    new_password = request.get("new_password")
    
    if not old_password or not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both old_password and new_password are required"
        )
    
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters"
        )
    
    success = auth.change_password(db, user, old_password, new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid old password or password was recently used"
        )
    
    return MessageResponse(message="Password changed successfully")


@router.get("/sessions")
def get_sessions(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Get all active sessions for current user."""
    payload = auth.decode_token(token)
    if payload is None or payload.sub is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    sessions = auth.get_active_sessions(db, int(payload.sub))
    return [
        {
            "session_uuid": str(s.session_uuid),
            "login_time": s.login_time.isoformat() if s.login_time else None,
            "last_activity_at": s.last_activity_at.isoformat() if s.last_activity_at else None,
            "ip_address": str(s.ip_address) if s.ip_address else None,
            "device_name": s.device_name,
            "browser": s.browser,
            "operating_system": s.operating_system,
        }
        for s in sessions
    ]


@router.delete("/sessions/{session_uuid}", response_model=MessageResponse)
def logout_session(
    session_uuid: str,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Logout a specific session."""
    success = auth.logout_session(db, session_uuid)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    return MessageResponse(message="Session logged out successfully")