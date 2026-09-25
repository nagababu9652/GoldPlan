from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TransactionBase(BaseModel):
    customer_id: int
    transaction_date: date
    transaction_type: str
    amount: Decimal
    description: Optional[str] = None
    status: str = "COMPLETED"
    reference_number: Optional[str] = None
    notes: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    transaction_date: Optional[date] = None
    transaction_type: Optional[str] = None
    amount: Optional[Decimal] = None
    description: Optional[str] = None
    status: Optional[str] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None


class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class TransactionHistoryResponse(BaseModel):
    id: int
    transaction_id: int
    action: str
    changed_by: Optional[int] = None
    changed_at: datetime
    old_values: Optional[dict] = None
    new_values: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)