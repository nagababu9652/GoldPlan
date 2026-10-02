from decimal import Decimal
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from datetime import date

from app.routers.advisors import apply_position_effect, build_monthly_cash_flow


class HoldingQuery:
    def __init__(self, holding): self.holding = holding
    def join(self, *args): return self
    def filter(self, *args): return self
    def with_for_update(self): return self
    def one(self): return self.holding

class PositionDB:
    def __init__(self, holding): self.holding = holding
    def query(self, model): return HoldingQuery(self.holding)

def transaction(kind, quantity, price):
    return SimpleNamespace(status="COMPLETED", holding_id=1, transaction_type=kind,
                           customer_id=7, financial_account_id=5,
                           quantity=Decimal(quantity), unit_price=Decimal(price))

def test_buy_sell_and_reversal_update_position():
    holding = SimpleNamespace(quantity=Decimal("10"), average_cost=Decimal("100"), current_price=Decimal("100"))
    db = PositionDB(holding)
    buy = transaction("BUY", "10", "200")
    apply_position_effect(db, buy)
    assert holding.quantity == 20 and holding.average_cost == 150
    apply_position_effect(db, buy, reverse=True)
    assert holding.quantity == 10 and holding.average_cost == 100
    sell = transaction("SELL", "4", "210")
    apply_position_effect(db, sell)
    assert holding.quantity == 6
    apply_position_effect(db, sell, reverse=True)
    assert holding.quantity == 10

def test_sell_cannot_exceed_position():
    holding = SimpleNamespace(quantity=Decimal("2"), average_cost=Decimal("100"), current_price=Decimal("100"))
    with pytest.raises(HTTPException, match="exceeds"):
        apply_position_effect(PositionDB(holding), transaction("SELL", "3", "100"))


def test_monthly_cash_flow_groups_completed_transaction_types():
    rows = [
        SimpleNamespace(transaction_date=date(2026, 8, 2), transaction_type="BUY", amount=Decimal("100")),
        SimpleNamespace(transaction_date=date(2026, 8, 12), transaction_type="SELL", amount=Decimal("140")),
        SimpleNamespace(transaction_date=date(2026, 9, 1), transaction_type="DIVIDEND", amount=Decimal("10")),
        SimpleNamespace(transaction_date=date(2025, 1, 1), transaction_type="BUY", amount=Decimal("999")),
    ]
    months = build_monthly_cash_flow(rows, date(2026, 9, 30))
    assert len(months) == 12
    assert months[-2] == {
        "month": "2026-08-01", "inflows": 140.0, "outflows": 100.0, "net_cash_flow": 40.0,
    }
    assert months[-1]["net_cash_flow"] == 10.0
