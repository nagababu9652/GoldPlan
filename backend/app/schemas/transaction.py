from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class TransactionBase(BaseModel):
    customer_id: int
    financial_account_id: Optional[int] = None
    holding_id: Optional[int] = None
    transaction_date: date
    transaction_type: str
    amount: Decimal
    quantity: Optional[Decimal] = Field(default=None, gt=0)
    unit_price: Optional[Decimal] = Field(default=None, ge=0)
    description: Optional[str] = None
    status: str = "COMPLETED"
    reference_number: Optional[str] = None
    notes: Optional[str] = None

    @model_validator(mode="after")
    def require_position_values(self):
        if self.holding_id is not None and self.transaction_type.upper() in {"BUY", "SELL"}:
            if self.quantity is None or self.unit_price is None:
                raise ValueError("Linked BUY/SELL transactions require quantity and unit_price")
        return self


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    financial_account_id: Optional[int] = None
    holding_id: Optional[int] = None
    transaction_date: Optional[date] = None
    transaction_type: Optional[str] = None
    amount: Optional[Decimal] = None
    quantity: Optional[Decimal] = Field(default=None, gt=0)
    unit_price: Optional[Decimal] = Field(default=None, ge=0)
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
