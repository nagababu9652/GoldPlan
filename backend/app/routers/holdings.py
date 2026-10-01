from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database.session import get_db
from ..models.crm.holding import Holding
from ..models.identity.auth import User
from ..schemas.holding import SECURITY_TYPES, HoldingCreate, HoldingListResponse, HoldingResponse, HoldingUpdate
from .advisors import get_current_advisor
from .financial_accounts import get_account_for_advisor
from .goals import normalize_choice
router = APIRouter(prefix="/advisors/holdings", tags=["advisor-holdings"])

def owned(db, advisor, holding_id):
    row = db.query(Holding).filter(Holding.id == holding_id, Holding.is_active.is_(True), Holding.deleted_at.is_(None)).first()
    if not row: raise HTTPException(404, "Holding not found")
    get_account_for_advisor(db, advisor, row.financial_account_id); return row
def result(row):
    invested = row.quantity * row.average_cost; current = row.quantity * row.current_price; gain = current - invested
    pct = Decimal(0) if invested == 0 else gain / invested * 100
    fields = HoldingResponse.model_fields.keys() - {"invested_value", "current_value", "gain", "gain_percentage"}
    return HoldingResponse.model_validate({**{f: getattr(row, f) for f in fields}, "invested_value": invested, "current_value": current, "gain": gain, "gain_percentage": pct})
@router.get("", response_model=HoldingListResponse)
def list_holdings(financial_account_id: int = Query(...), advisor: User = Depends(get_current_advisor), db: Session = Depends(get_db)):
    get_account_for_advisor(db, advisor, financial_account_id)
    rows = db.query(Holding).filter(Holding.financial_account_id == financial_account_id, Holding.is_active.is_(True), Holding.deleted_at.is_(None)).order_by(Holding.security_name).all()
    return HoldingListResponse(holdings=[result(r) for r in rows], total=len(rows))
@router.post("", response_model=HoldingResponse, status_code=201)
def create_holding(payload: HoldingCreate, advisor: User = Depends(get_current_advisor), db: Session = Depends(get_db)):
    get_account_for_advisor(db, advisor, payload.financial_account_id); values = payload.model_dump(); values["security_type"] = normalize_choice(payload.security_type, SECURITY_TYPES, "security type")
    row = Holding(**values, created_by=advisor.id); db.add(row); db.commit(); db.refresh(row); return result(row)
@router.put("/{holding_id}", response_model=HoldingResponse)
def update_holding(holding_id: int, payload: HoldingUpdate, advisor: User = Depends(get_current_advisor), db: Session = Depends(get_db)):
    row = owned(db, advisor, holding_id); values = payload.model_dump(exclude_unset=True)
    if "security_type" in values: values["security_type"] = normalize_choice(values["security_type"], SECURITY_TYPES, "security type")
    for key, value in values.items(): setattr(row, key, value)
    row.updated_by = advisor.id; db.commit(); db.refresh(row); return result(row)
@router.delete("/{holding_id}")
def archive_holding(holding_id: int, advisor: User = Depends(get_current_advisor), db: Session = Depends(get_db)):
    row = owned(db, advisor, holding_id); row.is_active = False; row.deleted_at = datetime.utcnow(); row.deleted_by = advisor.id; db.commit(); return {"message": "Holding archived successfully"}
