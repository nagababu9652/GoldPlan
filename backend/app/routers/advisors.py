"""
Advisors Router - handles advisor-specific endpoints.
Uses the new identity schema and auth service.
"""

from datetime import date, datetime, timezone
from typing import Optional

from sqlalchemy import select

from ..models.crm.transaction import Transaction
from ..models.crm.transaction_history import TransactionHistory
from ..models.crm.customer import Customer
from ..models.organization.employee import Employee
from ..models.organization.assignment import EmployeeAssignment
from ..schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionHistoryResponse,
)

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timezone, date
from ..models.meeting import Meeting
from ..database.session import get_db
from ..services import auth_service as auth
from ..models.identity.auth import User
from ..schemas.auth import (
    UserRegister, MessageResponse, PasswordResetConfirm
)
from ..schemas.otp import OTPVerifyRequest
from ..services.otp_service import verify_otp
from ..models.crm.customer import Customer
from ..models.organization.assignment import EmployeeAssignment
from ..models.organization.employee import Employee

router = APIRouter(prefix="/advisors", tags=["advisors"])
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/swagger-login"
)


def get_current_advisor(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Verify the token belongs to an active advisor user."""
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

    has_advisor_role = any(
        user_role.role
        and user_role.role.is_active
        and user_role.role.role_code == "ADVISOR"
        and user_role.effective_from <= datetime.now(timezone.utc).replace(tzinfo=None)
        and (
            user_role.effective_to is None
            or user_role.effective_to > datetime.now(timezone.utc).replace(tzinfo=None)
        )
        for user_role in user.roles
    )

    if not has_advisor_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Advisor role required",
        )

    return user


@router.get("/dashboard")
def get_advisor_dashboard(
    advisor: User = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    """Get real advisor dashboard overview data."""

    today = date.today()

    # Find the employee record belonging to the logged-in advisor.
    employee = (
        db.query(Employee)
        .filter(Employee.party_id == advisor.party_id)
        .first()
    )

    total_clients = 0
    active_clients = 0
    new_clients_this_month = 0

    if employee:
        # Find customers assigned to this advisor.
        client_ids_query = (
            db.query(EmployeeAssignment.entity_id)
            .filter(
                EmployeeAssignment.employee_id == employee.id,
                EmployeeAssignment.entity_type == "CUSTOMER",
                EmployeeAssignment.assignment_type == "ADVISOR",
                EmployeeAssignment.effective_from <= today,
                (
                    (EmployeeAssignment.effective_to.is_(None))
                    | (EmployeeAssignment.effective_to >= today)
                ),
            )
        )

        client_ids = [row[0] for row in client_ids_query.all()]

        if client_ids:
            total_clients = (
                db.query(Customer)
                .filter(Customer.id.in_(client_ids))
                .count()
            )

            active_clients = (
                db.query(Customer)
                .filter(
                    Customer.id.in_(client_ids),
                    Customer.customer_status == "ACTIVE",
                )
                .count()
            )

            first_day_of_month = today.replace(day=1)

            new_clients_this_month = (
                db.query(Customer)
                .filter(
                    Customer.id.in_(client_ids),
                    Customer.onboarding_date >= first_day_of_month,
                    Customer.onboarding_date <= today,
                )
                .count()
            )

    # Real meeting data
    today_meetings = (
        db.query(Meeting)
        .filter(
            Meeting.advisor_id == advisor.id,
            Meeting.meeting_date == today,
            Meeting.status == "scheduled",
        )
        .order_by(Meeting.meeting_time.asc())
        .all()
    )

    upcoming_meetings = (
        db.query(Meeting)
        .filter(
            Meeting.advisor_id == advisor.id,
            Meeting.meeting_date >= today,
            Meeting.status == "scheduled",
        )
        .count()
    )

    return {
        "advisor_name": advisor.display_name or "",
        "email": advisor.email,

        # Client data — now real
        "total_clients": total_clients,
        "active_clients": active_clients,
        "new_clients_this_month": new_clients_this_month,

        # Meeting data — real
        "upcoming_reviews": upcoming_meetings,
        "today_meetings": len(today_meetings),

        # Not implemented yet
        "portfolio_value": None,
        "portfolio_change": None,
        "total_reports": None,
        "pending_reports": None,
        "unread_messages": None,
        "total_aum": None,
        "avg_portfolio_size": None,
        "client_satisfaction": None,
        "reviews_completed": None,

        "last_login": (
            advisor.last_login_at.isoformat()
            if advisor.last_login_at
            else None
        ),
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



def get_advisor_employee(
    advisor: User,
    db: Session,
) -> Employee:
    employee = (
        db.query(Employee)
        .filter(
            Employee.party_id == advisor.party_id,
            Employee.is_active.is_(True),
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advisor employee record not found",
        )

    return employee


def get_advisor_customer_ids(
    advisor: User,
    db: Session,
) -> list[int]:
    employee = get_advisor_employee(advisor, db)

    today = date.today()

    assignments = (
        db.query(EmployeeAssignment.entity_id)
        .filter(
            EmployeeAssignment.employee_id == employee.id,
            EmployeeAssignment.assignment_type == "ADVISOR",
            EmployeeAssignment.entity_type == "CUSTOMER",
            EmployeeAssignment.effective_from <= today,
            (
                (EmployeeAssignment.effective_to.is_(None))
                | (EmployeeAssignment.effective_to >= today)
            ),
            EmployeeAssignment.is_active.is_(True),
        )
        .all()
    )

    return [row.entity_id for row in assignments]


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

@router.get(
    "/transactions",
    response_model=list[TransactionResponse],
)
def get_advisor_transactions(
    limit: int = 50,
    customer_id: Optional[int] = None,
    transaction_type: Optional[str] = None,
    transaction_status: Optional[str] = None,
    advisor: User = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    """List transactions belonging only to customers assigned to the advisor."""

    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 100",
        )

    customer_ids = get_advisor_customer_ids(advisor, db)

    if not customer_ids:
        return []

    query = (
        db.query(Transaction)
        .filter(
            Transaction.customer_id.in_(customer_ids),
            Transaction.is_active.is_(True),
        )
    )

    if customer_id is not None:
        if customer_id not in customer_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to access this customer",
            )

        query = query.filter(Transaction.customer_id == customer_id)

    if transaction_type:
        query = query.filter(
            Transaction.transaction_type == transaction_type.upper()
        )

    if transaction_status:
        query = query.filter(
            Transaction.status == transaction_status.upper()
        )

    return (
        query
        .order_by(
            Transaction.transaction_date.desc(),
            Transaction.id.desc(),
        )
        .limit(limit)
        .all()
    )


@router.get(
    "/transactions/{transaction_id}/history",
    response_model=list[TransactionHistoryResponse],
)
def get_advisor_transaction_history(
    transaction_id: int,
    advisor: User = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    customer_ids = get_advisor_customer_ids(advisor, db)

    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.customer_id.in_(customer_ids),
        )
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    return (
        db.query(TransactionHistory)
        .filter(
            TransactionHistory.transaction_id == transaction_id,
        )
        .order_by(
            TransactionHistory.changed_at.desc(),
            TransactionHistory.id.desc(),
        )
        .all()
    )

@router.get(
    "/transactions/{transaction_id}",
    response_model=TransactionResponse,
)
def get_advisor_transaction(
    transaction_id: int,
    advisor: User = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    """Get one transaction if it belongs to one of the advisor's customers."""

    customer_ids = get_advisor_customer_ids(advisor, db)

    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.customer_id.in_(customer_ids),
            Transaction.is_active.is_(True),
        )
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    return transaction



def create_transaction_history(
    db: Session,
    transaction: Transaction,
    action: str,
    changed_by: int,
    old_values: Optional[dict] = None,
    new_values: Optional[dict] = None,
) -> None:
    history = TransactionHistory(
        transaction_id=transaction.id,
        action=action,
        changed_by=changed_by,
        changed_at=datetime.utcnow(),
        old_values=old_values,
        new_values=new_values,
    )

    db.add(history)

@router.post(
    "/transactions",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_advisor_transaction(
    payload: TransactionCreate,
    advisor: User = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    customer_ids = get_advisor_customer_ids(advisor, db)

    if payload.customer_id not in customer_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to create transactions for this customer",
        )

    transaction = Transaction(
        **payload.model_dump(),
        created_by=advisor.id,
    )

    db.add(transaction)

    # Generate the transaction ID before creating its history record.
    db.flush()

    new_values = TransactionResponse.model_validate(
        transaction
    ).model_dump(mode="json")

    create_transaction_history(
        db=db,
        transaction=transaction,
        action="CREATE",
        changed_by=advisor.id,
        old_values=None,
        new_values=new_values,
    )

    db.commit()
    db.refresh(transaction)

    return transaction

@router.put(
    "/transactions/{transaction_id}",
    response_model=TransactionResponse,
)
def update_advisor_transaction(
    transaction_id: int,
    payload: TransactionUpdate,
    advisor: User = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    customer_ids = get_advisor_customer_ids(advisor, db)

    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.customer_id.in_(customer_ids),
            Transaction.is_active.is_(True),
        )
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    # Capture the transaction before changes.
    old_values = TransactionResponse.model_validate(
        transaction
    ).model_dump(mode="json")

    updates = payload.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(transaction, field, value)

    transaction.updated_by = advisor.id

    # Apply the changes before capturing the new snapshot.
    db.flush()

    new_values = TransactionResponse.model_validate(
        transaction
    ).model_dump(mode="json")

    create_transaction_history(
        db=db,
        transaction=transaction,
        action="UPDATE",
        changed_by=advisor.id,
        old_values=old_values,
        new_values=new_values,
    )

    db.commit()
    db.refresh(transaction)

    return transaction


@router.delete(
    "/transactions/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_advisor_transaction(
    transaction_id: int,
    advisor: User = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    customer_ids = get_advisor_customer_ids(advisor, db)

    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.customer_id.in_(customer_ids),
            Transaction.is_active.is_(True),
        )
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    # Capture the transaction before soft deletion.
    old_values = TransactionResponse.model_validate(
        transaction
    ).model_dump(mode="json")

    transaction.is_active = False
    transaction.deleted_at = datetime.utcnow()
    transaction.deleted_by = advisor.id

    db.flush()

    create_transaction_history(
        db=db,
        transaction=transaction,
        action="DELETE",
        changed_by=advisor.id,
        old_values=old_values,
        new_values=None,
    )

    db.commit()

    return None

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