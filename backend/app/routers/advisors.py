from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..services import auth
from ..models.user import User
from ..models.client import Client
from ..schemas.user import ClientCreate, ClientResponse, MessageResponse, PasswordResetConfirm
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
    if user.role != "advisor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to advisors only",
        )
    return user


@router.get("/dashboard")
def get_advisor_dashboard(advisor: User = Depends(get_current_advisor)):
    """Get advisor dashboard overview data."""
    return {
        "advisor_name": f"{advisor.first_name} {advisor.last_name}",
        "email": advisor.email,
        "portfolio_value": 12500000,
        "portfolio_change": 2.4,
        "total_reports": 12,
        "pending_reports": 3,
        "unread_messages": 2,
        "last_login": str(advisor.last_login) if advisor.last_login else None,
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
        "first_name": advisor.first_name,
        "last_name": advisor.last_name,
        "email": advisor.email,
        "phone": advisor.phone or "",
        "role": advisor.role,
        "member_since": str(advisor.created_at),
        "plan_type": "Premium",
        "client_name": "Sample Client",
        "risk_profile": "Moderate-Aggressive",
    }


@router.get("/clients", response_model=list[ClientResponse])
def get_clients(advisor: User = Depends(get_current_advisor), db: Session = Depends(get_db)):
    """List clients for the current advisor."""
    return db.query(Client).filter(Client.advisor_id == advisor.id).order_by(Client.created_at.desc()).all()


@router.post("/clients", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(payload: ClientCreate, advisor: User = Depends(get_current_advisor), db: Session = Depends(get_db)):
    """Create a linked client and also create a user login for the client."""
    email = payload.email
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Client email is required")

    existing = auth.get_user_by_email(db, email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A user with this email already exists")

    user = auth.create_user(db, {
        "email": email,
        "password": auth.get_password_hash(payload.password),
        "first_name": payload.first_name or "",
        "last_name": payload.last_name or "",
        "phone": payload.phone,
        "role": "client",
        "is_active": True,
        "is_verified": False,
    })

    client = Client(
        advisor_id=advisor.id,
        user_id=user.id,
        email=user.email,
        first_name=payload.first_name or user.first_name,
        last_name=payload.last_name or user.last_name,
        phone=payload.phone,
        address_line1=payload.address_line1,
        address_line2=payload.address_line2,
        city=payload.city,
        state=payload.state,
        pincode=payload.pincode,
        date_of_birth=payload.date_of_birth,
        gender=payload.gender,
        marital_status=payload.marital_status,
        occupation=payload.occupation,
        pan_number=payload.pan_number,
        aadhar_number=payload.aadhar_number,
        annual_income=payload.annual_income,
        net_worth=payload.net_worth,
        risk_profile=payload.risk_profile,
        investment_experience=payload.investment_experience,
        financial_goals=payload.financial_goals,
        nominee_name=payload.nominee_name,
        nominee_relation=payload.nominee_relation,
        nominee_contact=payload.nominee_contact,
        bank_name=payload.bank_name,
        account_number=payload.account_number,
        ifsc_code=payload.ifsc_code,
        account_type=payload.account_type,
        kyc_document_url=payload.kyc_document_url,
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.post("/clients/{client_id}/reset-password", response_model=MessageResponse)
def reset_client_password(client_id: int, request: PasswordResetConfirm, advisor: User = Depends(get_current_advisor), db: Session = Depends(get_db)):
    """Allow advisor to reset a client password."""
    client = db.query(Client).filter(Client.id == client_id, Client.advisor_id == advisor.id).first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")

    is_valid = verify_otp(db, request.email, request.otp_code, "password_reset")
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")

    user = auth.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.role != "client":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only client accounts can be reset through this endpoint")

    user.password_hash = auth.get_password_hash(request.new_password)
    db.commit()
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

    if user.role != "advisor":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This endpoint is for advisor verification only")

    user.is_verified = True
    user.is_active = True
    db.commit()
    return MessageResponse(message="Email verified successfully. You can now login.")
