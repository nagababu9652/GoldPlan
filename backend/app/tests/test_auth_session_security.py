"""Account actions require a live session and cannot revoke another user's session."""
from types import SimpleNamespace as Record
from unittest.mock import Mock
from uuid import UUID

import pytest
from fastapi import HTTPException
from starlette.requests import Request
from starlette.responses import Response

from app.routers import auth as router
from app.schemas.auth import OTPRequest, PasswordResetRequest, UserLogin
from app.services import access, access_lifecycle, auth_service, otp_service


def test_otp_responses_never_disclose_code(monkeypatch):
    otp = Record(_plain_otp="123456")
    monkeypatch.setattr(router, "create_otp", Mock(return_value=otp))
    monkeypatch.setattr(router.auth, "get_user_by_email", Mock(return_value=Record(id=7)))
    sent = router.send_otp(OTPRequest(destination="a@example.com"), Mock())
    reset = router.forgot_password(
        PasswordResetRequest(email="a@example.com"), Mock(),
    )
    assert "otp_code" not in sent.model_dump()
    assert "123456" not in str(sent.model_dump())
    assert "otp_code" not in reset.model_dump()
    assert "123456" not in str(reset.model_dump())


@pytest.mark.parametrize("user_exists", [True, False])
def test_password_reset_request_does_not_reveal_account_existence(monkeypatch, user_exists):
    monkeypatch.setattr(router.auth, "get_user_by_email", Mock(
        return_value=Record(id=7) if user_exists else None,
    ))
    monkeypatch.setattr(router, "create_otp", Mock())
    response = router.forgot_password(
        PasswordResetRequest(email="a@example.com"), Mock(),
    )
    assert response.message == "If an account exists with this email, a password reset OTP has been sent"


def test_revoked_session_cannot_resolve_authenticated_identity(monkeypatch):
    monkeypatch.setattr(access.auth, "decode_token", lambda token: Record(
        type="access", sub="7", session_uuid="11111111-1111-1111-1111-111111111111",
    ))
    db = Mock()
    db.query.return_value.filter.return_value.first.side_effect = [Record(id=7), None]
    with pytest.raises(HTTPException) as error:
        access.resolve_authenticated_identity("signed-token", db)
    assert error.value.status_code == 401


def test_session_revocation_requires_owner_and_valid_uuid():
    db = Mock()
    db.query.return_value.filter.return_value.first.return_value = None
    target = "11111111-1111-1111-1111-111111111111"
    assert auth_service.logout_session(db, target, user_id=7) is False
    predicates = db.query.return_value.filter.call_args.args
    rendered = " ".join(str(predicate.compile(compile_kwargs={"literal_binds": True})) for predicate in predicates)
    assert "user_sessions.user_id = 7" in rendered
    assert "user_sessions.session_uuid = '11111111111111111111111111111111'" in rendered
    db.commit.assert_not_called()
    db.query.reset_mock()
    assert auth_service.logout_session(db, "invalid", user_id=7) is False
    db.query.assert_not_called()


def test_session_routes_use_authenticated_user(monkeypatch):
    identity = access.AuthenticatedIdentity.model_construct(
        user=Record(id=7, party_id=4, username="owner", email="owner@example.com",
                    display_name="Owner", is_active=True, account_status="ACTIVE", created_at=None),
        session=Record(id=9),
    )
    db = Mock()
    monkeypatch.setattr(router.auth, "get_active_sessions", Mock(return_value=[]))
    monkeypatch.setattr(router.auth, "logout_session", Mock(return_value=False))
    assert router.get_current_user_info(identity).id == 7
    assert router.get_sessions(identity, db) == []
    router.auth.get_active_sessions.assert_called_once_with(db, 7)
    with pytest.raises(HTTPException) as error:
        router.logout_session(str(UUID(int=1)), identity, db)
    assert error.value.status_code == 404
    router.auth.logout_session.assert_called_once_with(db, str(UUID(int=1)), user_id=7)


def test_failed_otp_delivery_rolls_back_without_reporting_success(monkeypatch):
    db = Mock()
    db.query.return_value.filter.return_value.count.return_value = 0
    db.query.return_value.filter.return_value.all.return_value = []
    monkeypatch.setattr(otp_service, "send_otp_email", Mock(return_value=False))
    with pytest.raises(HTTPException) as error:
        otp_service.create_otp(db, "recipient@example.com")
    assert error.value.status_code == 503
    db.flush.assert_called_once()
    db.rollback.assert_called_once()
    db.commit.assert_not_called()


def test_otp_attempt_limit_invalidates_code(monkeypatch):
    db = Mock()
    record = Record(failed_attempts=4, is_used=False, otp_code_hash="stored")
    db.query.return_value.filter.return_value.order_by.return_value.with_for_update.return_value.first.return_value = record
    monkeypatch.setattr(otp_service, "verify_otp_hash", Mock(return_value=False))
    assert otp_service.verify_otp(db, "recipient@example.com", "000000") is False
    assert record.failed_attempts == 5
    assert record.is_used is True
    otp_service.verify_otp_hash.assert_called_once()
    db.commit.assert_called_once()
    db.query.return_value.filter.return_value.order_by.return_value.with_for_update.assert_called_once_with()


@pytest.mark.parametrize("method", ["change_password", "reset_password"])
def test_password_update_revokes_existing_sessions(monkeypatch, method):
    db = Mock()
    auth_method = Record(credential_hash="old-hash")
    db.query.return_value.filter.return_value.first.return_value = auth_method
    db.query.return_value.filter.return_value.order_by.return_value.limit.return_value.all.return_value = []
    user = Record(id=7, last_password_change_at=None)
    monkeypatch.setattr(auth_service, "verify_password", Mock(return_value=True))
    monkeypatch.setattr(auth_service, "get_password_hash", Mock(return_value="new-hash"))
    revoked = Mock()
    monkeypatch.setattr(access_lifecycle, "revoke_user_sessions", revoked)

    if method == "change_password":
        assert auth_service.change_password(db, user, "old-password", "new-password") is True
    else:
        assert auth_service.reset_password(db, user, "new-password") is True

    assert auth_method.credential_hash == "new-hash"
    revoked.assert_called_once_with(db, 7)
    db.commit.assert_called_once()


@pytest.mark.parametrize("secure", [False, True])
def test_login_keeps_refresh_token_in_cookie_only(monkeypatch, secure):
    monkeypatch.setattr(router.settings, "refresh_cookie_secure", secure)
    monkeypatch.setattr(router.auth, "authenticate_user", Mock(return_value=Record(id=7, is_active=True)))
    monkeypatch.setattr(router.auth, "create_session", Mock(return_value=(Record(), "access", "refresh-secret")))
    request = Request({"type": "http", "method": "POST", "path": "/auth/login",
                       "headers": [], "client": ("127.0.0.1", 1234), "scheme": "http"})
    response = Response()
    token = router.login(UserLogin(email="a@example.com", password="password123"), response, request, Mock())
    assert "refresh_token" not in token.model_dump()
    cookie = response.headers["set-cookie"]
    assert "refresh_token=refresh-secret" in cookie
    assert "httponly" in cookie.lower()
    assert ("secure" in cookie.lower()) is secure
