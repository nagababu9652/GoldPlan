from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.database.session import get_db
from app.routers import advisors
from app.schemas.otp import OTPVerifyRequest
from app.services import access


def context(*, actor="EMPLOYEE", permissions=()):
    return access.AccessContext(
        user_id=1, party_id=2, organization_id=7, actor_type=actor,
        employee_id=3 if actor != "CLIENT" else None,
        customer_id=10 if actor == "CLIENT" else None,
        roles=frozenset({actor}), permissions=frozenset(permissions),
        denied_permissions=frozenset(),
    )


def test_remaining_advisor_routes_require_staff_and_permissions():
    app = FastAPI()
    app.include_router(advisors.router)
    db = Mock()
    app.dependency_overrides[get_db] = lambda: db
    expected = {
        ("POST", "/advisors/clients/{client_id}/reset-password"): "CLIENT.UPDATE",
        ("GET", "/advisors/transactions"): "TRANSACTION.READ",
        ("GET", "/advisors/transactions/{transaction_id}/history"): "TRANSACTION.READ",
        ("GET", "/advisors/transactions/{transaction_id}"): "TRANSACTION.READ",
        ("POST", "/advisors/transactions"): "TRANSACTION.CREATE",
        ("PUT", "/advisors/transactions/{transaction_id}"): "TRANSACTION.UPDATE",
        ("DELETE", "/advisors/transactions/{transaction_id}"): "TRANSACTION.UPDATE",
        ("POST", "/advisors/verify-email"): "PROFILE.READ",
    }
    seen = set()
    for route in advisors.router.routes:
        if not hasattr(route, "methods"):
            continue
        key = (next(iter(route.methods)), route.path)
        if key not in expected:
            continue
        seen.add(key)
        names = {dep.call.__qualname__ for dep in route.dependant.dependencies}
        assert "require_employee" in names
        permission = next(dep.call for dep in route.dependant.dependencies
                          if dep.call.__qualname__ == "require_permission.<locals>.dependency")
        assert permission.__closure__[0].cell_contents == expected[key]
    assert seen == set(expected)

    for actor_context in (context(), context(actor="CLIENT", permissions=("TRANSACTION.READ",))):
        app.dependency_overrides[access.get_access_context] = lambda: actor_context
        assert TestClient(app).get("/advisors/transactions/5").status_code == 403
    db.query.assert_not_called()


def test_history_is_hidden_when_customer_assignment_ends(monkeypatch):
    monkeypatch.setattr(advisors, "get_report_customer_ids", lambda advisor, db: [])
    query = Mock()
    query.filter.return_value.first.return_value = None
    db = Mock()
    db.query.return_value = query
    with pytest.raises(HTTPException) as error:
        advisors.get_advisor_transaction_history(5, context(), db)
    assert error.value.status_code == 404
    predicates = " ".join(str(value.compile(compile_kwargs={"literal_binds": True}))
                          for call in query.filter.call_args_list for value in call.args)
    assert "transactions.customer_id IN" in predicates
    assert "transaction_history" not in str(db.query.call_args_list)


def test_email_verification_cannot_consume_another_users_otp(monkeypatch):
    signed_in_user = SimpleNamespace(id=1, email="staff@example.com", email_verified=False)
    db = Mock()
    db.query.return_value.filter.return_value.first.return_value = signed_in_user
    verify = Mock(return_value=True)
    monkeypatch.setattr(advisors, "verify_otp", verify)
    wrong_email = OTPVerifyRequest(email="other@example.com", otp_code="123456",
                                   purpose="email_verification")
    with pytest.raises(HTTPException) as error:
        advisors.verify_advisor_email(wrong_email, context(), db)
    assert error.value.status_code == 404
    verify.assert_not_called()

    wrong_purpose = OTPVerifyRequest(email="staff@example.com", otp_code="123456",
                                     purpose="registration")
    with pytest.raises(HTTPException) as error:
        advisors.verify_advisor_email(wrong_purpose, context(), db)
    assert error.value.status_code == 400
    verify.assert_not_called()

    valid = OTPVerifyRequest(email="staff@example.com", otp_code="123456",
                             purpose="email_verification")
    advisors.verify_advisor_email(valid, context(), db)
    assert signed_in_user.email_verified is True
    verify.assert_called_once_with(db, valid.email, valid.otp_code, "email_verification")
