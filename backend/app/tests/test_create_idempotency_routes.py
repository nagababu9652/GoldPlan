"""A replayed create key must return the original resource without writing again."""
from datetime import date
from types import SimpleNamespace as Record
from unittest.mock import Mock

import pytest
from fastapi import HTTPException
from starlette.requests import Request
from starlette.responses import Response

from app.routers import admin_employees, advisors, auth, clients, groups, invitations
from app.schemas.admin_employee import EmployeeCreate
from app.schemas.auth import UserLogin, UserRegister
from app.schemas.client import ClientCreate
from app.schemas.group import GroupCreate
from app.schemas.invitation import InvitationCreate
from app.schemas.report import ReportSnapshotCreate
from app.schemas.transaction import TransactionCreate
from app.services.idempotency import Reservation


def replay(resource_id=42):
    return Reservation(key_hash="a" * 64, replay=True, resource_id=resource_id)


def test_group_replay_does_not_create_another_group(monkeypatch):
    db = Mock()
    advisor = Record(user_id=7, organization_id=3)
    monkeypatch.setattr(groups, "get_advisor_employee", Mock(return_value=Record(id=9)))
    monkeypatch.setattr(groups, "reserve_create", Mock(return_value=replay()))
    monkeypatch.setattr(groups, "get_group_for_advisor", Mock(return_value=Record(id=42)))
    monkeypatch.setattr(groups, "build_group_response", Mock(return_value={"id": 42}))
    assert groups.create_group(GroupCreate(group_name="Family"), db, advisor, "repeated-request-key") == {"id": 42}
    db.add.assert_not_called()
    db.commit.assert_not_called()


def test_employee_replay_skips_party_creation(monkeypatch):
    db = Mock()
    context = Record(user_id=7, organization_id=3)
    monkeypatch.setattr(admin_employees, "reserve_create", Mock(return_value=replay()))
    monkeypatch.setattr(admin_employees, "scoped", Mock(return_value=Record(id=42)))
    monkeypatch.setattr(admin_employees, "employee_response", Mock(return_value={"id": 42}))
    payload = EmployeeCreate(employee_code="E42", first_name="A", branch_id=1, department_id=1,
                             designation_id=1, joining_date=date.today(), official_email="a@example.com")
    assert admin_employees.create_employee(payload, context, db, "repeated-request-key") == {"id": 42}
    db.add.assert_not_called()
    db.commit.assert_not_called()


def test_client_replay_skips_client_and_household_creation(monkeypatch):
    db = Mock()
    advisor = Record(user_id=7, organization_id=3, party_id=2,
                     check_customer=Mock())
    monkeypatch.setattr(clients, "get_advisor_employee", Mock(return_value=Record(id=9, organization_id=3)))
    monkeypatch.setattr(clients, "reserve_create", Mock(return_value=replay()))
    customer = Record(id=42, organization_id=3)
    db.query.return_value.filter.return_value.first.return_value = customer
    monkeypatch.setattr(clients, "build_client_response", Mock(return_value={"id": 42}))
    assert clients.create_client(ClientCreate(first_name="A", last_name="B"), advisor, db,
                                 "repeated-request-key") == {"id": 42}
    advisor.check_customer.assert_called_once_with(42, 3)
    db.add.assert_not_called()
    db.commit.assert_not_called()


def test_registration_replay_skips_user_creation(monkeypatch):
    db = Mock()
    user = Record(id=42, party_id=2, username="a@example.com", email="a@example.com",
                  display_name="A", is_active=True, account_status="ACTIVE", created_at=None)
    monkeypatch.setattr(auth, "reserve_create", Mock(return_value=replay()))
    monkeypatch.setattr(auth.auth, "get_user_by_id", Mock(return_value=user))
    monkeypatch.setattr(auth.auth, "create_user", Mock())
    result = auth.register(UserRegister(first_name="A", last_name="B", email="a@example.com",
                                        password="password123"), db, "repeated-request-key")
    assert result.id == 42
    auth.auth.create_user.assert_not_called()
    db.add.assert_not_called()


def test_login_replay_does_not_create_second_session(monkeypatch):
    db = Mock()
    monkeypatch.setattr(auth.auth, "authenticate_user", Mock(return_value=Record(id=7, is_active=True)))
    monkeypatch.setattr(auth, "reserve_create", Mock(return_value=replay(7)))
    monkeypatch.setattr(auth.auth, "create_session", Mock())
    request = Request({"type": "http", "method": "POST", "path": "/auth/login",
                       "headers": [], "client": ("127.0.0.1", 1234), "scheme": "http"})
    with pytest.raises(HTTPException) as error:
        auth.login(UserLogin(email="a@example.com", password="password123"), Response(), request, db,
                   "repeated-request-key")
    assert error.value.status_code == 409
    auth.auth.create_session.assert_not_called()


def test_invitation_replay_does_not_issue_a_second_secret(monkeypatch):
    monkeypatch.setattr(invitations, "reserve_create", Mock(return_value=replay()))
    monkeypatch.setattr(invitations, "issue", Mock())
    with pytest.raises(HTTPException) as error:
        invitations.create_invitation(InvitationCreate(employee_id=8),
                                      Record(user_id=7, organization_id=3), Mock(),
                                      "repeated-request-key")
    assert error.value.status_code == 409
    invitations.issue.assert_not_called()


def test_transaction_replay_skips_position_and_history_writes(monkeypatch):
    db = Mock()
    advisor = Record(user_id=7)
    payload = TransactionCreate(customer_id=12, transaction_date=date.today(),
                                transaction_type="BUY", amount=100, status="COMPLETED")
    monkeypatch.setattr(advisors, "get_report_customer_ids", Mock(return_value={12}))
    monkeypatch.setattr(advisors, "validate_transaction_links", Mock())
    monkeypatch.setattr(advisors, "reserve_create", Mock(return_value=replay()))
    monkeypatch.setattr(advisors, "get_advisor_transaction", Mock(return_value=Record(id=42)))
    monkeypatch.setattr(advisors, "apply_position_effect", Mock())
    monkeypatch.setattr(advisors, "create_transaction_history", Mock())
    assert advisors.create_advisor_transaction(payload, advisor, db, "repeated-request-key").id == 42
    advisors.apply_position_effect.assert_not_called()
    advisors.create_transaction_history.assert_not_called()
    db.add.assert_not_called()
    db.commit.assert_not_called()


def test_report_replay_skips_recalculation(monkeypatch):
    db = Mock()
    advisor = Record(user_id=7)
    monkeypatch.setattr(advisors, "get_report_employee", Mock(return_value=Record(id=9)))
    monkeypatch.setattr(advisors, "reserve_create", Mock(return_value=replay()))
    monkeypatch.setattr(advisors, "get_report_snapshot_for_advisor", Mock(return_value=Record(id=42)))
    monkeypatch.setattr(advisors, "get_financial_summary_report", Mock())
    assert advisors.create_report_snapshot(ReportSnapshotCreate(title="Saved"), advisor, db,
                                           "repeated-request-key").id == 42
    advisors.get_financial_summary_report.assert_not_called()
    db.add.assert_not_called()
    db.commit.assert_not_called()
