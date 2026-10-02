"""Advisor-scoped financial-account operations."""
from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.crm.financial_account import FinancialAccount
from ..services.access import AccessContext, require_employee, require_permission
from ..services.idempotency import finish_create, reserve_create
from ..schemas.financial_account import (
    ACCOUNT_STATUSES, ACCOUNT_TYPES, LIABILITY_TYPES,
    FinancialAccountCreate, FinancialAccountListResponse,
    FinancialAccountResponse, FinancialAccountUpdate,
)
from .goals import authorize_owner, normalize_choice

router = APIRouter(prefix="/advisors/financial-accounts", tags=["advisor-financial-accounts"])


def get_account_for_advisor(db: Session, advisor: AccessContext, account_id: int) -> FinancialAccount:
    account = db.query(FinancialAccount).filter(
        FinancialAccount.id == account_id,
        FinancialAccount.organization_id == advisor.organization_id,
        FinancialAccount.is_active.is_(True), FinancialAccount.deleted_at.is_(None),
    ).first()
    if not account:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Financial account not found")
    employee = authorize_owner(db, advisor, account.customer_id, account.customer_group_id)
    if account.organization_id != employee.organization_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Financial account not found")
    return account


@router.get("", response_model=FinancialAccountListResponse,
            dependencies=[Depends(require_permission("ACCOUNT.READ"))])
def list_financial_accounts(
    customer_id: int | None = Query(None), customer_group_id: int | None = Query(None),
    account_status: str | None = Query(None, alias="status"),
    advisor: AccessContext = Depends(require_employee), db: Session = Depends(get_db),
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


@router.get("/{account_id}", response_model=FinancialAccountResponse,
            dependencies=[Depends(require_permission("ACCOUNT.READ"))])
def get_financial_account(account_id: int, advisor: AccessContext = Depends(require_employee), db: Session = Depends(get_db)):
    return get_account_for_advisor(db, advisor, account_id)


@router.post("", response_model=FinancialAccountResponse, status_code=201,
             dependencies=[Depends(require_permission("ACCOUNT.CREATE"))])
def create_financial_account(payload: FinancialAccountCreate, advisor: AccessContext = Depends(require_employee), db: Session = Depends(get_db), idempotency_key: str | None = Header(default=None)):
    employee = authorize_owner(db, advisor, payload.customer_id, payload.customer_group_id)
    reservation = reserve_create(db, key=idempotency_key, operation="financial_account.create", actor_scope=f"user:{advisor.user_id}", payload=payload.model_dump())
    if reservation and reservation.replay:
        return get_account_for_advisor(db, advisor, reservation.resource_id)
    account_type = normalize_choice(payload.account_type, ACCOUNT_TYPES, "account type")
    account = FinancialAccount(
        organization_id=employee.organization_id,
        **payload.model_dump(exclude={"account_type", "status", "currency_code"}),
        account_type=account_type,
        account_nature="LIABILITY" if account_type in LIABILITY_TYPES else "ASSET",
        status=normalize_choice(payload.status, ACCOUNT_STATUSES, "account status"),
        currency_code=payload.currency_code.upper(), created_by=advisor.user_id,
    )
    db.add(account); db.flush(); finish_create(db, reservation, account.id); db.commit(); db.refresh(account)
    return account


@router.put("/{account_id}", response_model=FinancialAccountResponse,
            dependencies=[Depends(require_permission("ACCOUNT.UPDATE"))])
def update_financial_account(account_id: int, payload: FinancialAccountUpdate, advisor: AccessContext = Depends(require_employee), db: Session = Depends(get_db)):
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
    account.updated_by = advisor.user_id
    db.commit(); db.refresh(account)
    return account


@router.delete("/{account_id}", dependencies=[Depends(require_permission("ACCOUNT.UPDATE"))])
def archive_financial_account(account_id: int, advisor: AccessContext = Depends(require_employee), db: Session = Depends(get_db)):
    account = get_account_for_advisor(db, advisor, account_id)
    account.is_active = False; account.deleted_at = datetime.utcnow(); account.deleted_by = advisor.user_id
    db.commit()
    return {"message": "Financial account archived successfully"}
