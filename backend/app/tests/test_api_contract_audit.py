"""Regression checks for API/model mismatches found in the full-stack audit."""

import os
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi import HTTPException
from sqlalchemy import select

from app.models.base import Base
from app.routers import advisors
from app.schemas.auth import PasswordResetConfirm, UserRegister
from app.tests.test_groups_router import FakeDB, make_customer


def test_registration_keeps_fields_collected_by_frontend():
    payload = UserRegister(
        first_name="Test", last_name="User", email="test@example.com",
        password="test-password", aadhaar_number="123456789012",
        legal_name="Test User", remarks="Registration notes",
    ).model_dump()
    assert payload["aadhaar_number"] == "123456789012"
    assert payload["legal_name"] == "Test User"
    assert payload["remarks"] == "Registration notes"


def test_profile_returns_frontend_fields_from_party():
    db = Mock()
    db.query.return_value.filter.return_value.first.side_effect = [
        SimpleNamespace(display_name="Test Advisor", email="test@example.com", mobile_number="123", created_at="2026-01-01"),
        SimpleNamespace(first_name="Test", last_name="Advisor"),
    ]
    result = advisors.get_advisor_profile(SimpleNamespace(user_id=7, party_id=1), db)
    assert result["first_name"] == "Test"
    assert result["last_name"] == "Advisor"
    assert result["phone"] == "123"
    assert result["role"] == "advisor"


@pytest.mark.parametrize("client_id,user_party,expected_status", [(99, 70, 404), (7, 80, 400), (7, 70, 200)])
def test_password_reset_is_bound_to_assigned_client(monkeypatch, client_id, user_party, expected_status):
    customer = make_customer(7)
    customer.party_id = 70
    customer.is_active = True
    customer.deleted_at = None
    db = FakeDB(customers=[customer])
    user = SimpleNamespace(party_id=user_party)
    monkeypatch.setattr(advisors, "get_report_customer_ids", lambda advisor, db: [7])
    monkeypatch.setattr(advisors.auth, "get_user_by_email", Mock(return_value=user))
    verify = Mock(return_value=True)
    reset = Mock()
    monkeypatch.setattr(advisors, "verify_otp", verify)
    monkeypatch.setattr(advisors.auth, "reset_password", reset)
    request = PasswordResetConfirm(email="test@example.com", otp_code="123456", new_password="test-password")
    if expected_status != 200:
        with pytest.raises(HTTPException) as error:
                advisors.reset_client_password(client_id, request, SimpleNamespace(user_id=1, organization_id=10), db)
        assert error.value.status_code == expected_status
        verify.assert_not_called()
        reset.assert_not_called()
    else:
        advisors.reset_client_password(client_id, request, SimpleNamespace(user_id=1, organization_id=10), db)
        verify.assert_called_once()
        reset.assert_called_once_with(db, user, request.new_password)


@pytest.mark.skipif(os.getenv("FINPLAN_DB_TESTS") != "1", reason="Requires configured PostgreSQL")
def test_all_mapped_tables_can_be_selected():
    from app.database.session import engine
    with engine.connect() as connection:
        for table in Base.metadata.tables.values():
            connection.execute(select(table).limit(0))
