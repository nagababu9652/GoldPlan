from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

SECURITY_TYPES = {"MUTUAL_FUND", "EQUITY", "ETF", "BOND", "GOVERNMENT_SECURITY", "OTHER"}
class HoldingCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    financial_account_id: int
    security_type: str
    security_name: str = Field(min_length=1, max_length=250)
    symbol: Optional[str] = None; isin: Optional[str] = None; folio_number: Optional[str] = None
    quantity: Decimal = Field(default=0, ge=0)
    average_cost: Decimal = Field(default=0, ge=0)
    current_price: Decimal = Field(default=0, ge=0)
    valuation_as_of: Optional[date] = None; remarks: Optional[str] = None
class HoldingUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    security_type: Optional[str] = None; security_name: Optional[str] = Field(default=None, min_length=1)
    symbol: Optional[str] = None; isin: Optional[str] = None; folio_number: Optional[str] = None
    quantity: Optional[Decimal] = Field(default=None, ge=0); average_cost: Optional[Decimal] = Field(default=None, ge=0)
    current_price: Optional[Decimal] = Field(default=None, ge=0); valuation_as_of: Optional[date] = None; remarks: Optional[str] = None
class HoldingResponse(HoldingCreate):
    id: int; invested_value: Decimal; current_value: Decimal; gain: Decimal; gain_percentage: Decimal
    created_at: datetime; updated_at: Optional[datetime] = None
class HoldingListResponse(BaseModel):
    holdings: list[HoldingResponse]; total: int
