"""Advisor-scoped financial-account operations."""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.crm.financial_account import FinancialAccount
from ..models.identity.auth import User
from ..schemas.financial_account import (
    ACCOUNT_STATUSES, ACCOUNT_TYPES, LIABILITY_TYPES,
    FinancialAccountCreate, FinancialAccountListResponse,
    FinancialAccountResponse, FinancialAccountUpdate,
)
from .advisors import get_current_advisor
from .goals import authorize_owner, normalize_choice

router = APIRouter(prefix="/advisors/financial-accounts", tags=["advisor-financial-accounts"])


def get_account_for_advisor(db: Session, advisor: User, account_id: int) -> FinancialAccount:
    account = db.query(FinancialAccount).filter(
        FinancialAccount.id == account_id,
        FinancialAccount.is_active.is_(True), FinancialAccount.deleted_at.is_(None),
    ).first()
    if not account:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Financial account not found")
    employee = authorize_owner(db, advisor, account.customer_id, account.customer_group_id)
    if account.organization_id != employee.organization_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Financial account not found")
    return account


@router.get("", response_model=FinancialAccountListResponse)
def list_financial_accounts(
    customer_id: int | None = Query(None), customer_group_id: int | None = Query(None),
    account_status: str | None = Query(None, alias="status"),
    advisor: User = Depends(get_current_advisor), db: Session = Depends(get_db),
):
    if (customer_id is None) == (customer_group_id is None):
        raise HTTPException(422, "Exactly one owner filter is required")
    employee = authorize_owner(db, advisor, customer_id, customer_group_id)
    query = db.query(FinancialAccount).filter(
        FinancialAccount.organization_id == employee.organization_id,
        FinancialAccount.customer_id == customer_id,
        FinancialAccount.customer_group_id == customer_group_id,
        FinancialAccount.is_active.is_(True), FinancialAccount.deleted_at.is_(None),
    )
    if account_status:
        query = query.filter(FinancialAccount.status == normalize_choice(account_status, ACCOUNT_STATUSES, "account status"))
    accounts = query.order_by(FinancialAccount.account_nature, FinancialAccount.account_name).all()
    return FinancialAccountListResponse(accounts=accounts, total=len(accounts))


@router.get("/{account_id}", response_model=FinancialAccountResponse)
def get_financial_account(account_id: int, advisor: User = Depends(get_current_advisor), db: Session = Depends(get_db)):
    return get_account_for_advisor(db, advisor, account_id)


@router.post("", response_model=FinancialAccountResponse, status_code=201)
def create_financial_account(payload: FinancialAccountCreate, advisor: User = Depends(get_current_advisor), db: Session = Depends(get_db)):
    employee = authorize_owner(db, advisor, payload.customer_id, payload.customer_group_id)
    account_type = normalize_choice(payload.account_type, ACCOUNT_TYPES, "account type")
    account = FinancialAccount(
        organization_id=employee.organization_id,
        **payload.model_dump(exclude={"account_type", "status", "currency_code"}),
        account_type=account_type,
        account_nature="LIABILITY" if account_type in LIABILITY_TYPES else "ASSET",
        status=normalize_choice(payload.status, ACCOUNT_STATUSES, "account status"),
        currency_code=payload.currency_code.upper(), created_by=advisor.id,
    )
    db.add(account); db.commit(); db.refresh(account)
    return account


@router.put("/{account_id}", response_model=FinancialAccountResponse)
def update_financial_account(account_id: int, payload: FinancialAccountUpdate, advisor: User = Depends(get_current_advisor), db: Session = Depends(get_db)):
    account = get_account_for_advisor(db, advisor, account_id)
    updates = payload.model_dump(exclude_unset=True)
    if "account_type" in updates:
        updates["account_type"] = normalize_choice(updates["account_type"], ACCOUNT_TYPES, "account type")
        updates["account_nature"] = "LIABILITY" if updates["account_type"] in LIABILITY_TYPES else "ASSET"
    if "status" in updates:
        updates["status"] = normalize_choice(updates["status"], ACCOUNT_STATUSES, "account status")
    if "currency_code" in updates:
        updates["currency_code"] = updates["currency_code"].upper()
    for field, value in updates.items(): setattr(account, field, value)
    account.updated_by = advisor.id
    db.commit(); db.refresh(account)
    return account


@router.delete("/{account_id}")
def archive_financial_account(account_id: int, advisor: User = Depends(get_current_advisor), db: Session = Depends(get_db)):
    account = get_account_for_advisor(db, advisor, account_id)
    account.is_active = False; account.deleted_at = datetime.utcnow(); account.deleted_by = advisor.id
    db.commit()
    return {"message": "Financial account archived successfully"}
