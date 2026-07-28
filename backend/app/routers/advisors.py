"""
Advisors Router - handles advisor-specific endpoints.
Uses the new identity schema and auth service.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..services import auth_service as auth
from ..models.identity.auth import User
from ..schemas.auth import (
    UserRegister, MessageResponse, PasswordResetConfirm
)
from ..schemas.otp import OTPVerifyRequest
from ..services.otp_service import verify_otp

router = APIRouter(prefix="/advisors", tags=["advisors"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_advisor(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Verify the token belongs to an advisor user."""
    payload = auth.decode_token(token)
    if payload is None or payload.sub is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    user = auth.get_user_by_id(db, int(payload.sub))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    # TODO: Check user roles via identity.user_roles for "ADVISOR" role
    return user


@router.get("/dashboard")
def get_advisor_dashboard(advisor: User = Depends(get_current_advisor)):
    """Get advisor dashboard overview data."""
    return {
        "advisor_name": advisor.display_name or "",
        "email": advisor.email,
        "portfolio_value": 12500000,
        "portfolio_change": 2.4,
        "total_reports": 12,
        "pending_reports": 3,
        "unread_messages": 2,
        "last_login": str(advisor.last_login_at) if advisor.last_login_at else None,
        "total_clients": 8,
        "active_clients": 6,
        "new_clients_this_month": 2,
        "total_aum": 12500000,
        "avg_portfolio_size": 1562500,
        "client_satisfaction": 4.8,
        "reviews_completed": 45,
        "upcoming_reviews": 3,
    }


@router.get("/portfolio")
def get_advisor_portfolio(advisor: User = Depends(get_current_advisor)):
    """Get advisor portfolio holdings."""
    return {
        "holdings": [
            {"name": "Large Cap Equity", "value": 4500000, "allocation": 36, "returns": 12.5},
            {"name": "Mid Cap Equity", "value": 2500000, "allocation": 20, "returns": 15.2},
            {"name": "Debt Funds", "value": 3000000, "allocation": 24, "returns": 8.1},
            {"name": "Gold ETF", "value": 1500000, "allocation": 12, "returns": 6.8},
            {"name": "Cash & Equivalents", "value": 1000000, "allocation": 8, "returns": 3.5},
        ],
        "total_value": 12500000,
        "total_cost": 11000000,
        "total_returns": 1500000,
        "returns_percentage": 13.6,
    }


@router.get("/reports")
def get_advisor_reports(advisor: User = Depends(get_current_advisor)):
    """Get advisor investor reports."""
    return {
        "reports": [
            {"id": 1, "title": "Q4 2025 Performance Report", "date": "2025-04-15", "type": "quarterly", "status": "ready"},
            {"id": 2, "title": "Annual Portfolio Review 2025", "date": "2025-03-01", "type": "annual", "status": "ready"},
            {"id": 3, "title": "Tax Harvesting Report", "date": "2025-02-20", "type": "special", "status": "pending"},
            {"id": 4, "title": "Q3 2025 Performance Report", "date": "2025-01-15", "type": "quarterly", "status": "ready"},
        ]
    }


@router.get("/documents")
def get_advisor_documents(advisor: User = Depends(get_current_advisor)):
    """Get advisor documents."""
    return {
        "documents": [
            {"id": 1, "name": "KYC Documents", "date": "2025-01-10", "category": "kyc", "size": "2.4 MB"},
            {"id": 2, "name": "Investment Agreement", "date": "2025-01-10", "category": "agreement", "size": "1.1 MB"},
            {"id": 3, "name": "Risk Profile Assessment", "date": "2025-01-15", "category": "assessment", "size": "0.5 MB"},
            {"id": 4, "name": "Tax Statement FY 2024-25", "date": "2025-04-01", "category": "tax", "size": "3.2 MB"},
        ]
    }


@router.get("/messages")
def get_advisor_messages(advisor: User = Depends(get_current_advisor)):
    """Get advisor messages with clients."""
    return {
        "messages": [
            {"id": 1, "from": "Client", "subject": "Quarterly Review Scheduled", "date": "2025-04-10", "unread": True},
            {"id": 2, "from": "Client", "subject": "Portfolio Rebalancing Request", "date": "2025-03-28", "unread": False},
            {"id": 3, "from": "Support", "subject": "Tax Documents Available", "date": "2025-03-15", "unread": False},
        ]
    }


@router.get("/profile")
def get_advisor_profile(advisor: User = Depends(get_current_advisor)):
    """Get advisor profile information."""
    return {
        "display_name": advisor.display_name,
        "email": advisor.email,
        "mobile_number": advisor.mobile_number or "",
        "member_since": str(advisor.created_at),
        "plan_type": "Premium",
    }


@router.get("/clients")
def get_clients(advisor: User = Depends(get_current_advisor), db: Session = Depends(get_db)):
    """List clients for the current advisor using the new identity-backed model path."""
    return {
        "advisor_id": advisor.id,
        "message": "Client management is now handled by the new CRM and organization layers.",
        "clients": [],
    }


@router.post("/clients", status_code=status.HTTP_201_CREATED)
def create_client(payload: UserRegister, advisor: User = Depends(get_current_advisor), db: Session = Depends(get_db)):
    """Create a user account for a client via the new identity flow."""
    email = payload.email
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Client email is required")

    existing = auth.get_user_by_email(db, email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A user with this email already exists")

    user = auth.create_user(db, payload.model_dump())

    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "party_id": user.party_id,
        "created_by": advisor.id,
    }


@router.post("/clients/{client_id}/reset-password", response_model=MessageResponse)
def reset_client_password(
    client_id: int,
    request: PasswordResetConfirm,
    advisor: User = Depends(get_current_advisor),
    db: Session = Depends(get_db)
):
    """Allow advisor to reset a client password using the new auth service."""
    is_valid = verify_otp(db, request.email, request.otp_code, "password_reset")
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")

    user = auth.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    auth.reset_password(db, user, request.new_password)
    return MessageResponse(message="Client password reset successfully")


@router.post("/verify-email", response_model=MessageResponse)
def verify_advisor_email(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    """Verify advisor email using OTP and activate the account."""
    is_valid = verify_otp(db, request.email, request.otp_code, "email_verification")
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")

    user = auth.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Update user verification
    user.email_verified = True
    db.commit()
    return MessageResponse(message="Email verified successfully. You can now login.")