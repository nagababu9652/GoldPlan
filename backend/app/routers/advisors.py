"""
Advisors Router - handles advisor-specific endpoints.
Uses the new identity schema and auth service.
"""

from datetime import date, datetime, timedelta
from typing import Optional

from sqlalchemy import select

from ..models.crm.transaction import Transaction
from ..models.crm.financial_account import FinancialAccount
from ..models.crm.holding import Holding
from ..models.crm.report_snapshot import ReportSnapshot
from ..models.crm.transaction_history import TransactionHistory
from ..models.crm.customer import Customer
from ..models.organization.employee import Employee
from ..models.foundation.party import Party
from ..models.organization.assignment import EmployeeAssignment
from ..schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionHistoryResponse,
)

from fastapi import APIRouter, Depends, Header, HTTPException, status
from ..services.idempotency import finish_create, reserve_create
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import NoResultFound
from ..models.crm.meeting import Meeting
from ..database.session import get_db
from ..services import auth_service as auth
from ..services.access import AccessContext, require_employee, require_permission
from ..models.identity.auth import User
from ..schemas.auth import (
    UserRegister, MessageResponse, PasswordResetConfirm
)
from ..schemas.otp import OTPVerifyRequest
from ..schemas.report import (
    ReportSnapshotCreate,
    ReportSnapshotListResponse,
    ReportSnapshotResponse,
)
from ..services.otp_service import verify_otp
from ..models.crm.customer import Customer
from ..models.organization.assignment import EmployeeAssignment
from ..models.organization.employee import Employee

router = APIRouter(prefix="/advisors", tags=["advisors"])


from .advisor.meetings import router as meetings_router
from .advisor.messages import router as messages_router
from .advisor.document import router as documents_router
router.include_router(meetings_router)
router.include_router(messages_router)
router.include_router(documents_router)

@router.get("/dashboard", dependencies=[Depends(require_permission("CLIENT.READ"))])
def get_advisor_dashboard(
    advisor: AccessContext = Depends(require_employee),
    db: Session = Depends(get_db),
):
    """Get real advisor dashboard overview data."""

    today = date.today()

    employee = get_report_employee(advisor, db)
    user = db.query(User).filter(User.id == advisor.user_id, User.party_id == advisor.party_id).first()
    client_ids = get_report_customer_ids(advisor, db)
    total_clients = len(set(client_ids))
    active_clients = 0
    new_clients_this_month = 0
    if client_ids:
        active_clients = db.query(Customer).filter(
            Customer.id.in_(client_ids),
            Customer.organization_id == employee.organization_id,
            Customer.customer_status == "ACTIVE",
        ).count()
        new_clients_this_month = db.query(Customer).filter(
            Customer.id.in_(client_ids),
            Customer.organization_id == employee.organization_id,
            Customer.onboarding_date >= today.replace(day=1),
            Customer.onboarding_date <= today,
        ).count()

    today_meetings = []
    upcoming_meetings = 0
    today_start = datetime.combine(today, datetime.min.time())
    tomorrow_start = today_start + timedelta(days=1)
    meeting_query = db.query(Meeting).filter(
        Meeting.organization_id == employee.organization_id,
        Meeting.advisor_employee_id == employee.id,
        Meeting.status == "SCHEDULED",
    )
    today_meetings = (
        meeting_query
        .filter(Meeting.scheduled_start >= today_start, Meeting.scheduled_start < tomorrow_start)
        .order_by(Meeting.scheduled_start.asc())
        .all()
    )
    upcoming_meetings = meeting_query.filter(Meeting.scheduled_start >= today_start).count()

    return {
        "advisor_name": user.display_name or "" if user else "",
        "email": user.email if user else "",

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
            user.last_login_at.isoformat()
            if user and user.last_login_at
            else None
        ),
    }

@router.get("/portfolio", dependencies=[Depends(require_permission("HOLDING.READ"))])
def get_advisor_portfolio(
    advisor: AccessContext = Depends(require_employee),
    db: Session = Depends(get_db),
):
    """Aggregate current holdings for assigned clients."""
    employee = get_report_employee(advisor, db)
    client_ids = get_report_customer_ids(advisor, db)
    accounts = db.query(FinancialAccount).filter(
        FinancialAccount.organization_id == employee.organization_id,
        FinancialAccount.customer_id.in_(client_ids),
        FinancialAccount.is_active.is_(True),
        FinancialAccount.deleted_at.is_(None),
        FinancialAccount.status == "ACTIVE",
    ).all() if client_ids else []
    account_ids = [account.id for account in accounts]
    holdings = db.query(Holding).filter(
        Holding.financial_account_id.in_(account_ids),
        Holding.is_active.is_(True),
        Holding.deleted_at.is_(None),
    ).all() if account_ids else []
    categories: dict[str, dict[str, float]] = {}
    for holding in holdings:
        category = categories.setdefault(holding.security_type, {"value": 0.0, "cost": 0.0})
        category["value"] += float(holding.quantity or 0) * float(holding.current_price or 0)
        category["cost"] += float(holding.quantity or 0) * float(holding.average_cost or 0)
    total_value = sum(category["value"] for category in categories.values())
    total_cost = sum(category["cost"] for category in categories.values())
    total_returns = total_value - total_cost
    return {
        "holdings": [
            {"name": name, "value": values["value"],
             "allocation": values["value"] / total_value * 100 if total_value else 0,
             "returns": (values["value"] - values["cost"]) / values["cost"] * 100
             if values["cost"] else 0}
            for name, values in sorted(categories.items())
        ],
        "total_value": total_value,
        "total_cost": total_cost,
        "total_returns": total_returns,
        "returns_percentage": total_returns / total_cost * 100 if total_cost else 0,
    }


@router.get("/profile", dependencies=[Depends(require_permission("PROFILE.READ"))])
def get_advisor_profile(
    advisor: AccessContext = Depends(require_employee),
    db: Session = Depends(get_db),
):
    """Get advisor profile information."""
    user = db.query(User).filter(User.id == advisor.user_id, User.party_id == advisor.party_id).first()
    party = db.query(Party).filter(Party.id == advisor.party_id, Party.deleted_at.is_(None)).first()
    return {
        "first_name": party.first_name or "" if party else "",
        "last_name": party.last_name or "" if party else "",
        "phone": user.mobile_number or "" if user else "",
        "role": "advisor",
        "display_name": user.display_name if user else "",
        "email": user.email if user else "",
        "mobile_number": user.mobile_number or "" if user else "",
        "member_since": str(user.created_at) if user else "",
        "plan_type": "Premium",
    }



def get_report_employee(context: AccessContext, db: Session) -> Employee:
    employee = db.query(Employee).filter(
        Employee.id == context.employee_id,
        Employee.organization_id == context.organization_id,
        Employee.is_active.is_(True),
        Employee.employment_status == "ACTIVE",
        Employee.deleted_at.is_(None),
    ).first()
    if employee is None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Employee record not found")
    return employee


def get_report_customer_ids(context: AccessContext, db: Session) -> list[int]:
    employee = get_report_employee(context, db)
    today = date.today()
    assignments = db.query(EmployeeAssignment.entity_id).join(
        Customer,
        Customer.id == EmployeeAssignment.entity_id,
    ).filter(
        EmployeeAssignment.employee_id == employee.id,
        EmployeeAssignment.assignment_type == "ADVISOR",
        EmployeeAssignment.entity_type == "CUSTOMER",
        Customer.organization_id == employee.organization_id,
        Customer.is_active.is_(True),
        Customer.customer_status == "ACTIVE",
        Customer.deleted_at.is_(None),
        EmployeeAssignment.effective_from <= today,
        (EmployeeAssignment.effective_to.is_(None) | (EmployeeAssignment.effective_to >= today)),
        EmployeeAssignment.is_active.is_(True),
        EmployeeAssignment.deleted_at.is_(None),
    ).all()
    return [row.entity_id for row in assignments]


@router.get("/reports/financial-summary", dependencies=[Depends(require_permission("REPORT.READ"))])
def get_financial_summary_report(
    advisor: AccessContext = Depends(require_employee),
    db: Session = Depends(get_db),
):
    """Return a dated financial snapshot for the advisor's active clients."""
    as_of = date.today()
    customer_ids = get_report_customer_ids(advisor, db)

    if not customer_ids:
        return {
            "report_date": as_of, "client_count": 0,
            "total_assets": 0, "total_liabilities": 0, "net_worth": 0,
            "invested_value": 0, "current_value": 0, "unrealized_gain": 0,
            "goal_target": 0, "goal_funding": 0, "clients": [],
        }

    customers = db.query(Customer).filter(
        Customer.id.in_(customer_ids), Customer.is_active.is_(True),
    ).all()
    accounts = db.query(FinancialAccount).filter(
        FinancialAccount.customer_id.in_(customer_ids),
        FinancialAccount.is_active.is_(True),
        FinancialAccount.status == "ACTIVE",
    ).all()
    account_ids = [account.id for account in accounts]
    holdings = db.query(Holding).filter(
        Holding.financial_account_id.in_(account_ids), Holding.is_active.is_(True),
    ).all() if account_ids else []

    from ..models.crm.goal import FinancialGoal
    goals = db.query(FinancialGoal).filter(
        FinancialGoal.customer_id.in_(customer_ids),
        FinancialGoal.is_active.is_(True), FinancialGoal.status == "ACTIVE",
    ).all()

    rows = []
    for customer in customers:
        client_accounts = [a for a in accounts if a.customer_id == customer.id]
        client_account_ids = {a.id for a in client_accounts}
        client_holdings = [h for h in holdings if h.financial_account_id in client_account_ids]
        client_goals = [g for g in goals if g.customer_id == customer.id]
        assets = sum(float(a.current_balance or 0) for a in client_accounts if a.account_nature == "ASSET")
        liabilities = sum(float(a.current_balance or 0) for a in client_accounts if a.account_nature == "LIABILITY")
        invested = sum(float(h.quantity or 0) * float(h.average_cost or 0) for h in client_holdings)
        current = sum(float(h.quantity or 0) * float(h.current_price or 0) for h in client_holdings)
        goal_target = sum(float(g.target_amount or 0) for g in client_goals)
        goal_funding = sum(float(g.current_amount or 0) for g in client_goals)
        rows.append({
            "customer_id": customer.id,
            "customer_name": customer.party.display_name if customer.party else customer.customer_code,
            "assets": assets, "liabilities": liabilities, "net_worth": assets - liabilities,
            "invested_value": invested, "current_value": current,
            "unrealized_gain": current - invested,
            "goal_target": goal_target, "goal_funding": goal_funding,
        })

    return {
        "report_date": as_of, "client_count": len(rows),
        "total_assets": sum(row["assets"] for row in rows),
        "total_liabilities": sum(row["liabilities"] for row in rows),
        "net_worth": sum(row["net_worth"] for row in rows),
        "invested_value": sum(row["invested_value"] for row in rows),
        "current_value": sum(row["current_value"] for row in rows),
        "unrealized_gain": sum(row["unrealized_gain"] for row in rows),
        "goal_target": sum(row["goal_target"] for row in rows),
        "goal_funding": sum(row["goal_funding"] for row in rows),
        "clients": sorted(rows, key=lambda row: row["net_worth"], reverse=True),
    }


INFLOW_TRANSACTION_TYPES = {"SELL", "DEPOSIT", "INCOME", "DIVIDEND", "INTEREST", "REFUND"}
OUTFLOW_TRANSACTION_TYPES = {"BUY", "WITHDRAWAL", "EXPENSE", "FEE", "TAX"}


def _shift_month(month: date, offset: int) -> date:
    month_index = month.year * 12 + month.month - 1 + offset
    return date(month_index // 12, month_index % 12 + 1, 1)


def build_monthly_cash_flow(transactions, as_of: date) -> list[dict]:
    """Group completed transaction amounts into the latest twelve calendar months."""
    current_month = as_of.replace(day=1)
    months = {
        _shift_month(current_month, offset): {"inflows": 0.0, "outflows": 0.0}
        for offset in range(-11, 1)
    }
    for transaction in transactions:
        month = transaction.transaction_date.replace(day=1)
        if month not in months:
            continue
        amount = float(transaction.amount or 0)
        kind = transaction.transaction_type.upper()
        if kind in INFLOW_TRANSACTION_TYPES:
            months[month]["inflows"] += amount
        elif kind in OUTFLOW_TRANSACTION_TYPES:
            months[month]["outflows"] += amount

    return [
        {
            "month": month.isoformat(),
            "inflows": values["inflows"],
            "outflows": values["outflows"],
            "net_cash_flow": values["inflows"] - values["outflows"],
        }
        for month, values in sorted(months.items())
    ]


@router.get("/reports/cash-flow", dependencies=[Depends(require_permission("REPORT.READ"))])
def get_cash_flow_report(
    advisor: AccessContext = Depends(require_employee),
    db: Session = Depends(get_db),
):
    """Return twelve months of completed transaction cash flow."""
    as_of = date.today()
    period_start = _shift_month(as_of.replace(day=1), -11)
    customer_ids = get_report_customer_ids(advisor, db)
    transactions = []
    if customer_ids:
        transactions = db.query(Transaction).filter(
            Transaction.customer_id.in_(customer_ids),
            Transaction.is_active.is_(True),
            Transaction.status == "COMPLETED",
            Transaction.transaction_date >= period_start,
            Transaction.transaction_date <= as_of,
        ).all()
    months = build_monthly_cash_flow(transactions, as_of)
    return {
        "period_start": period_start,
        "period_end": as_of,
        "total_inflows": sum(month["inflows"] for month in months),
        "total_outflows": sum(month["outflows"] for month in months),
        "net_cash_flow": sum(month["net_cash_flow"] for month in months),
        "months": months,
    }


REPORT_ASSUMPTIONS = {
    "currency": "INR",
    "account_scope": "Active customer-owned financial accounts assigned to the advisor",
    "assets": "Sum of active ASSET account current balances",
    "liabilities": "Sum of active LIABILITY account current balances",
    "holding_current_value": "quantity multiplied by current_price",
    "holding_invested_value": "quantity multiplied by average_cost",
    "goal_scope": "Active customer-owned goals",
    "cash_flow_scope": "Completed active transactions in the latest twelve calendar months",
    "cash_flow_inflows": sorted(INFLOW_TRANSACTION_TYPES),
    "cash_flow_outflows": sorted(OUTFLOW_TRANSACTION_TYPES),
}


def get_report_snapshot_for_advisor(
    db: Session, advisor: AccessContext, snapshot_id: int,
) -> ReportSnapshot:
    employee = get_report_employee(advisor, db)
    snapshot = db.query(ReportSnapshot).filter(
        ReportSnapshot.id == snapshot_id,
        ReportSnapshot.organization_id == employee.organization_id,
        ReportSnapshot.advisor_employee_id == employee.id,
        ReportSnapshot.is_active.is_(True),
        ReportSnapshot.deleted_at.is_(None),
    ).first()
    if not snapshot:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Report snapshot not found")
    included_ids = {
        int(item["customer_id"])
        for item in snapshot.payload.get("financial_summary", {}).get("clients", [])
        if isinstance(item, dict) and item.get("customer_id") is not None
    }
    if included_ids and not included_ids.issubset(set(get_report_customer_ids(advisor, db))):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Report snapshot not found")
    return snapshot


@router.get("/reports/snapshots", response_model=ReportSnapshotListResponse,
            dependencies=[Depends(require_permission("REPORT.READ"))])
def list_report_snapshots(
    advisor: AccessContext = Depends(require_employee),
    db: Session = Depends(get_db),
):
    employee = get_report_employee(advisor, db)
    reports = db.query(ReportSnapshot).filter(
        ReportSnapshot.organization_id == employee.organization_id,
        ReportSnapshot.advisor_employee_id == employee.id,
        ReportSnapshot.is_active.is_(True),
        ReportSnapshot.deleted_at.is_(None),
    ).order_by(
        ReportSnapshot.report_date.desc(),
        ReportSnapshot.created_at.desc(),
        ReportSnapshot.id.desc(),
    ).all()
    current_ids = set(get_report_customer_ids(advisor, db))
    reports = [report for report in reports if {
        int(item["customer_id"])
        for item in report.payload.get("financial_summary", {}).get("clients", [])
        if isinstance(item, dict) and item.get("customer_id") is not None
    }.issubset(current_ids)]
    return ReportSnapshotListResponse(reports=reports, total=len(reports))


@router.get("/reports/snapshots/{snapshot_id}", response_model=ReportSnapshotResponse,
            dependencies=[Depends(require_permission("REPORT.READ"))])
def get_report_snapshot(
    snapshot_id: int,
    advisor: AccessContext = Depends(require_employee),
    db: Session = Depends(get_db),
):
    return get_report_snapshot_for_advisor(db, advisor, snapshot_id)


@router.post(
    "/reports/snapshots",
    response_model=ReportSnapshotResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("REPORT.GENERATE"))],
)
def create_report_snapshot(
    request: ReportSnapshotCreate,
    advisor: AccessContext = Depends(require_employee),
    db: Session = Depends(get_db),
    idempotency_key: str | None = Header(default=None),
):
    employee = get_report_employee(advisor, db)
    reservation = reserve_create(db, key=idempotency_key, operation="report_snapshot.create", actor_scope=f"user:{advisor.user_id}", payload=request.model_dump())
    if reservation and reservation.replay:
        return get_report_snapshot_for_advisor(db, advisor, reservation.resource_id)
    financial_summary = get_financial_summary_report(advisor=advisor, db=db)
    cash_flow = get_cash_flow_report(advisor=advisor, db=db)
    report_date = date.fromisoformat(str(financial_summary["report_date"]))
    period_start = date.fromisoformat(str(cash_flow["period_start"]))
    period_end = date.fromisoformat(str(cash_flow["period_end"]))
    snapshot = ReportSnapshot(
        organization_id=employee.organization_id,
        advisor_employee_id=employee.id,
        title=request.title or f"Financial Snapshot {report_date.isoformat()}",
        report_type="FINANCIAL_SNAPSHOT",
        report_date=report_date,
        period_start=period_start,
        period_end=period_end,
        assumptions=jsonable_encoder(REPORT_ASSUMPTIONS),
        payload=jsonable_encoder({
            "financial_summary": financial_summary,
            "cash_flow": cash_flow,
        }),
        created_by=advisor.user_id,
    )
    db.add(snapshot)
    if reservation:
        db.flush()
        finish_create(db, reservation, snapshot.id)
    db.commit()
    db.refresh(snapshot)
    return snapshot


@router.post("/clients/{client_id}/reset-password", response_model=MessageResponse,
             dependencies=[Depends(require_permission("CLIENT.UPDATE"))])
def reset_client_password(
    client_id: int,
    request: PasswordResetConfirm,
    advisor: AccessContext = Depends(require_employee),
    db: Session = Depends(get_db)
):
    """Allow advisor to reset a client password using the new auth service."""
    customer_ids = get_report_customer_ids(advisor, db)
    customer = (
        db.query(Customer)
        .filter(Customer.id == client_id, Customer.id.in_(customer_ids),
                Customer.organization_id == advisor.organization_id,
                Customer.is_active.is_(True), Customer.deleted_at.is_(None))
        .first()
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Client not found")
    user = auth.get_user_by_email(db, request.email)
    if not user or user.party_id != customer.party_id:
        raise HTTPException(status_code=400, detail="Email does not belong to the selected client")

    is_valid = verify_otp(db, request.email, request.otp_code, "password_reset")
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")

    auth.reset_password(db, user, request.new_password)
    return MessageResponse(message="Client password reset successfully")

@router.get(
    "/transactions",
    response_model=list[TransactionResponse],
    dependencies=[Depends(require_permission("TRANSACTION.READ"))],
)
def get_advisor_transactions(
    limit: int = 50,
    customer_id: Optional[int] = None,
    transaction_type: Optional[str] = None,
    transaction_status: Optional[str] = None,
    advisor: AccessContext = Depends(require_employee),
    db: Session = Depends(get_db),
):
    """List transactions belonging only to customers assigned to the advisor."""

    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 100",
        )

    customer_ids = get_report_customer_ids(advisor, db)

    if not customer_ids:
        return []

    query = (
        db.query(Transaction)
        .filter(
            Transaction.customer_id.in_(customer_ids),
            Transaction.is_active.is_(True),
            Transaction.deleted_at.is_(None),
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
    dependencies=[Depends(require_permission("TRANSACTION.READ"))],
)
def get_advisor_transaction_history(
    transaction_id: int,
    advisor: AccessContext = Depends(require_employee),
    db: Session = Depends(get_db),
):
    customer_ids = get_report_customer_ids(advisor, db)

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
    dependencies=[Depends(require_permission("TRANSACTION.READ"))],
)
def get_advisor_transaction(
    transaction_id: int,
    advisor: AccessContext = Depends(require_employee),
    db: Session = Depends(get_db),
):
    """Get one transaction if it belongs to one of the advisor's customers."""

    customer_ids = get_report_customer_ids(advisor, db)

    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.customer_id.in_(customer_ids),
            Transaction.is_active.is_(True),
            Transaction.deleted_at.is_(None),
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

def validate_transaction_links(db, customer_id, account_id, holding_id):
    if holding_id is not None and account_id is None:
        raise HTTPException(status_code=422, detail="A holding requires a financial account")
    if account_id is None:
        return
    account = db.query(FinancialAccount).filter(
        FinancialAccount.id == account_id,
        FinancialAccount.customer_id == customer_id,
        FinancialAccount.is_active.is_(True),
        FinancialAccount.deleted_at.is_(None),
    ).first()
    if not account:
        raise HTTPException(status_code=422, detail="Financial account does not belong to this customer")
    if holding_id is not None and not db.query(Holding).filter(
        Holding.id == holding_id,
        Holding.financial_account_id == account_id,
        Holding.is_active.is_(True),
        Holding.deleted_at.is_(None),
    ).first():
        raise HTTPException(status_code=422, detail="Holding does not belong to this financial account")

def apply_position_effect(db, transaction, reverse=False):
    if transaction.status != "COMPLETED" or not transaction.holding_id or transaction.transaction_type not in {"BUY", "SELL"}:
        return
    if transaction.quantity is None or transaction.unit_price is None:
        raise HTTPException(status_code=422, detail="Linked BUY/SELL transactions require quantity and unit price")
    try:
        holding = db.query(Holding).join(
            FinancialAccount, Holding.financial_account_id == FinancialAccount.id,
        ).filter(
            Holding.id == transaction.holding_id,
            Holding.is_active.is_(True), Holding.deleted_at.is_(None),
            Holding.financial_account_id == transaction.financial_account_id,
            FinancialAccount.customer_id == transaction.customer_id,
        ).with_for_update().one()
    except NoResultFound:
        raise HTTPException(status_code=409, detail="Linked holding is no longer active")
    quantity = transaction.quantity
    if transaction.transaction_type == "SELL":
        if reverse:
            holding.quantity += quantity
        else:
            if holding.quantity < quantity:
                raise HTTPException(status_code=422, detail="Sell quantity exceeds the holding position")
            holding.quantity -= quantity
    elif reverse:
        old_value = holding.quantity * holding.average_cost
        if holding.quantity < quantity:
            raise HTTPException(status_code=422, detail="Cannot reverse transaction beyond the holding position")
        holding.quantity -= quantity
        holding.average_cost = 0 if holding.quantity == 0 else max(0, (old_value - quantity * transaction.unit_price) / holding.quantity)
    else:
        old_value = holding.quantity * holding.average_cost
        new_quantity = holding.quantity + quantity
        holding.average_cost = (old_value + quantity * transaction.unit_price) / new_quantity
        holding.quantity = new_quantity
    holding.current_price = transaction.unit_price

@router.post(
    "/transactions",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("TRANSACTION.CREATE"))],
)
def create_advisor_transaction(
    payload: TransactionCreate,
    advisor: AccessContext = Depends(require_employee),
    db: Session = Depends(get_db),
    idempotency_key: str | None = Header(default=None),
):
    customer_ids = get_report_customer_ids(advisor, db)

    if payload.customer_id not in customer_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to create transactions for this customer",
        )

    validate_transaction_links(db, payload.customer_id, payload.financial_account_id, payload.holding_id)
    reservation = reserve_create(db, key=idempotency_key, operation="transaction.create", actor_scope=f"user:{advisor.user_id}", payload=payload.model_dump())
    if reservation and reservation.replay:
        return get_advisor_transaction(reservation.resource_id, advisor=advisor, db=db)
    transaction = Transaction(
        **payload.model_dump(),
        created_by=advisor.user_id,
    )

    db.add(transaction)
    apply_position_effect(db, transaction)

    # Generate the transaction ID before creating its history record.
    db.flush()
    finish_create(db, reservation, transaction.id)

    new_values = TransactionResponse.model_validate(
        transaction
    ).model_dump(mode="json")

    create_transaction_history(
        db=db,
        transaction=transaction,
        action="CREATE",
        changed_by=advisor.user_id,
        old_values=None,
        new_values=new_values,
    )

    db.commit()
    db.refresh(transaction)

    return transaction

@router.put(
    "/transactions/{transaction_id}",
    response_model=TransactionResponse,
    dependencies=[Depends(require_permission("TRANSACTION.UPDATE"))],
)
def update_advisor_transaction(
    transaction_id: int,
    payload: TransactionUpdate,
    advisor: AccessContext = Depends(require_employee),
    db: Session = Depends(get_db),
):
    customer_ids = get_report_customer_ids(advisor, db)

    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.customer_id.in_(customer_ids),
            Transaction.is_active.is_(True),
            Transaction.deleted_at.is_(None),
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

    apply_position_effect(db, transaction, reverse=True)
    updates = payload.model_dump(exclude_unset=True)

    validate_transaction_links(
        db, transaction.customer_id,
        updates.get("financial_account_id", transaction.financial_account_id),
        updates.get("holding_id", transaction.holding_id),
    )

    for field, value in updates.items():
        setattr(transaction, field, value)

    apply_position_effect(db, transaction)

    transaction.updated_by = advisor.user_id

    # Apply the changes before capturing the new snapshot.
    db.flush()

    new_values = TransactionResponse.model_validate(
        transaction
    ).model_dump(mode="json")

    create_transaction_history(
        db=db,
        transaction=transaction,
        action="UPDATE",
        changed_by=advisor.user_id,
        old_values=old_values,
        new_values=new_values,
    )

    db.commit()
    db.refresh(transaction)

    return transaction


@router.delete(
    "/transactions/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("TRANSACTION.UPDATE"))],
)
def delete_advisor_transaction(
    transaction_id: int,
    advisor: AccessContext = Depends(require_employee),
    db: Session = Depends(get_db),
):
    customer_ids = get_report_customer_ids(advisor, db)

    transaction = (
        db.query(Transaction)
        .filter(
            Transaction.id == transaction_id,
            Transaction.customer_id.in_(customer_ids),
            Transaction.is_active.is_(True),
            Transaction.deleted_at.is_(None),
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
    apply_position_effect(db, transaction, reverse=True)
    transaction.deleted_at = datetime.utcnow()
    transaction.deleted_by = advisor.user_id

    db.flush()

    create_transaction_history(
        db=db,
        transaction=transaction,
        action="DELETE",
        changed_by=advisor.user_id,
        old_values=old_values,
        new_values=None,
    )

    db.commit()

    return None

@router.post("/verify-email", response_model=MessageResponse,
             dependencies=[Depends(require_permission("PROFILE.READ"))])
def verify_advisor_email(
    request: OTPVerifyRequest,
    advisor: AccessContext = Depends(require_employee),
    db: Session = Depends(get_db),
):
    """Verify only the signed-in staff member's email using OTP."""
    user = db.query(User).filter(
        User.id == advisor.user_id, User.party_id == advisor.party_id,
        User.is_active.is_(True), User.deleted_at.is_(None),
    ).first()
    if user is None or user.email.casefold() != str(request.email).casefold():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if request.purpose != "email_verification":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email verification OTP required")
    is_valid = verify_otp(db, request.email, request.otp_code, "email_verification")
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")

    # Update user verification
    user.email_verified = True
    db.commit()
    return MessageResponse(message="Email verified successfully")
