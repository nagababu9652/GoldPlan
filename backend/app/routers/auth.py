"""
Authentication Router - handles registration, login, logout, OTP, password management.
Uses the new identity schema with session management.
"""
from datetime import datetime, timedelta, timezone
import hashlib
from fastapi import APIRouter, Depends, Header, HTTPException, status, Response, Request
from sqlalchemy.exc import IntegrityError
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
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
from ..services.access import AccessContext, AuthenticatedIdentity, get_access_context, get_authenticated_identity
from ..services.otp_service import create_otp, verify_otp
from ..services.idempotency import reserve_create, finish_create
from ..models.identity.auth import OTPRequest as OTPRequestModel
from ..core.config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.get("/access-context", response_model=AccessContext)
def current_access_context(context: AccessContext = Depends(get_access_context)):
    return context


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/swagger-login")


@router.post("/send-otp", response_model=OTPResponse)
def send_otp(
    request: OTPRequestSchema,
    db: Session = Depends(get_db)
):
    """Send OTP to email for verification."""
    create_otp(
        db=db,
        destination=request.destination,
        purpose=request.purpose,
    )
    return OTPResponse(
        message=f"OTP sent to {request.destination}",
        expires_in_minutes=10,
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


def user_response(user) -> UserResponse:
    return UserResponse(
        id=user.id, party_id=user.party_id, username=user.username,
        email=user.email, display_name=user.display_name,
        is_active=user.is_active, account_status=user.account_status,
        created_at=user.created_at.isoformat() if user.created_at else "",
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db),
    idempotency_key: str | None = Header(default=None),
):
    """Register a new user with party creation."""
    reservation = reserve_create(
        db, key=idempotency_key, operation="auth.register",
        actor_scope=hashlib.sha256(str(user_data.email).lower().encode()).hexdigest(),
        payload=user_data.model_dump(mode="json"),
    )
    if reservation and reservation.replay:
        user = auth.get_user_by_id(db, reservation.resource_id)
        if user is None or str(user.email).lower() != str(user_data.email).lower():
            raise HTTPException(409, "Registered user is unavailable")
        return user_response(user)
    # Check if user already exists
    existing_user = auth.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    verified_registration = db.query(OTPRequestModel).filter(
        OTPRequestModel.destination == str(user_data.email),
        OTPRequestModel.purpose == "registration",
        OTPRequestModel.verified_at.is_not(None),
        OTPRequestModel.verified_at >= now - timedelta(minutes=30),
    ).order_by(OTPRequestModel.verified_at.desc()).first()
    if verified_registration is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verify the registration email before creating the account",
        )

    # Create a verified base identity. Organization roles are granted elsewhere.
    try:
        payload = user_data.model_dump()
        payload["email_verified"] = True
        user = auth.create_user(db, payload, commit=False)
        finish_create(db, reservation, user.id)
        db.commit()
        return user_response(user)
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(409, "Account already exists") from exc
    except Exception:
        db.rollback()
        raise


@router.post("/swagger-login", response_model=Token)
def swagger_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    response: Response = None,
    request: Request = None,
    db: Session = Depends(get_db),
):
    """OAuth2-compatible login endpoint for Swagger UI."""

    user = auth.authenticate_user(
        db,
        form_data.username,
        form_data.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    session, access_token, refresh_token = auth.create_session(
        db=db,
        user=user,
        ip_address=request.client.host if request and request.client else None,
        user_agent=request.headers.get("user-agent") if request else None,
    )

    if response is not None:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=settings.refresh_cookie_secure,
            samesite="lax",
            max_age=7 * 24 * 60 * 60,
        )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
    )

@router.post("/login", response_model=Token)
def login(
    credentials: UserLogin,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
    idempotency_key: str | None = Header(default=None),
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

    reservation = reserve_create(
        db, key=idempotency_key, operation="auth.login",
        actor_scope=f"user:{user.id}",
        payload=credentials.model_dump(mode="json"),
    )
    if reservation and reservation.replay:
        raise HTTPException(409, "Login request already completed")
    finish_create(db, reservation, user.id)

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
        secure=settings.refresh_cookie_secure,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,  # 7 days
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
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
    token_value = refresh_token_str
    if not token_value:
        authorization = request.headers.get("authorization", "")
        if authorization.lower().startswith("bearer "):
            token_value = authorization[7:].strip()
    if token_value:
        # Decode to get session UUID
        payload = auth.decode_token(token_value)
        if payload and payload.session_uuid:
            auth.logout_session(db, payload.session_uuid, user_id=int(payload.sub))
    
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
        secure=settings.refresh_cookie_secure,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
    )
    
    return Token(
        access_token=new_access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    identity: AuthenticatedIdentity = Depends(get_authenticated_identity),
):
    """Get current authenticated user info."""
    user = identity.user
    
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
    create_otp(
        db=db,
        destination=request.email,
        purpose="password_reset",
        user_id=user.id,
    )
    
    return OTPResponse(
        message="If an account exists with this email, a password reset OTP has been sent",
        expires_in_minutes=10,
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
    if not auth.reset_password(db, user, request.new_password):
        raise HTTPException(status_code=400, detail="Password login is not configured for this account")
    
    return MessageResponse(message="Password reset successfully. You can now login with your new password.")


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    request: dict,
    identity: AuthenticatedIdentity = Depends(get_authenticated_identity),
    db: Session = Depends(get_db)
):
    """Change password for authenticated user."""
    user = identity.user
    
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
    identity: AuthenticatedIdentity = Depends(get_authenticated_identity),
    db: Session = Depends(get_db)
):
    """Get all active sessions for current user."""
    sessions = auth.get_active_sessions(db, identity.user.id)
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
    identity: AuthenticatedIdentity = Depends(get_authenticated_identity),
    db: Session = Depends(get_db)
):
    """Logout a specific session."""
    success = auth.logout_session(db, session_uuid, user_id=identity.user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    return MessageResponse(message="Session logged out successfully")
