"""Tests for /advisors endpoints with explicit ADVISOR role verification.

Ensures the database contains an ADVISOR role in identity.roles and a
corresponding identity.user_roles row for the test advisor, then exercises
the endpoints consumed by PortfolioPerformance and the dashboard.
"""
import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from fastapi.testclient import TestClient

from app.database.session import SessionLocal
from app.main import create_app
from app.models.identity.auth import User
from app.models.identity.authorization import Role, UserRole
from app.services import auth_service as auth


@pytest.fixture
def client():
    app = create_app()
    return TestClient(app)


def _register_and_login(client, role):
    unique = str(uuid.uuid4())[:8]
    email = f"{role}_{unique}@test.com"
    reg = client.post("/auth/register", json={
        "first_name": "Test",
        "last_name": role.capitalize(),
        "email": email,
        "password": "test1234",
        "role": role,
    })
    assert reg.status_code == 201, f"Registration failed: {reg.text}"
    login = client.post("/auth/login", json={
        "email": email,
        "password": "test1234",
    })
    assert login.status_code == 200, f"Login failed: {login.text}"
    return email, login.json()["access_token"]


@pytest.fixture
def advisor_creds(client):
    email, token = _register_and_login(client, "advisor")
    return email, token


@pytest.fixture
def advisor_token(advisor_creds):
    return advisor_creds[1]


@pytest.fixture
def advisor_email(advisor_creds):
    return advisor_creds[0]


@pytest.fixture
def user_token(client):
    _, token = _register_and_login(client, "user")
    return token


class TestAdvisorRoleInDb:
    """Verify the DB actually has ADVISOR role + user_roles row."""

    def test_advisor_role_exists_and_active(self):
        db = SessionLocal()
        try:
            role = db.query(Role).filter(Role.role_code == "ADVISOR").first()
            assert role is not None, "identity.roles has no ADVISOR row"
            assert role.is_active is True
        finally:
            db.close()

    def test_test_advisor_has_user_role_row(self, client, advisor_email):
        db = SessionLocal()
        try:
            user = auth.get_user_by_email(db, advisor_email)
            assert user is not None
            role = db.query(Role).filter(Role.role_code == "ADVISOR").first()
            assert role is not None
            link = (
                db.query(UserRole)
                .filter(UserRole.user_id == user.id, UserRole.role_id == role.id)
                .first()
            )
            assert link is not None, (
                f"identity.user_roles has no row for user {user.id} + ADVISOR role {role.id}"
            )
        finally:
            db.close()


class TestAdvisorsEndpoints:
    """Advisor-gated endpoints return 200 for a real advisor."""

    ENDPOINTS = [
        "/advisors/dashboard",
        "/advisors/portfolio",
        "/advisors/reports",
        "/advisors/documents",
        "/advisors/messages",
        "/advisors/profile",
        "/advisors/meetings",
        "/advisors/meetings/today",
    ]

    @pytest.mark.parametrize("endpoint", ENDPOINTS)
    def test_advisor_endpoints_ok(self, client, advisor_token, endpoint):
        resp = client.get(endpoint, headers={"Authorization": f"Bearer {advisor_token}"})
        assert resp.status_code == 200, f"{endpoint} failed: {resp.text}"

    def test_portfolio_contract_for_component(self, client, advisor_token):
        """Shape required by frontend PortfolioPerformance component."""
        resp = client.get(
            "/advisors/portfolio",
            headers={"Authorization": f"Bearer {advisor_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        for field in ("holdings", "total_value", "total_cost", "total_returns", "returns_percentage"):
            assert field in data
        assert isinstance(data["holdings"], list) and len(data["holdings"]) > 0
        for h in data["holdings"]:
            for field in ("name", "value", "allocation", "returns"):
                assert field in h


class TestAdvisorRoleEnforcement:
    """Non-advisors are rejected; unauthenticated requests are rejected."""

    def test_user_role_cannot_access_portfolio(self, client, user_token):
        resp = client.get(
            "/advisors/portfolio",
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert resp.status_code == 403
        assert resp.json()["detail"] == "Advisor role required"

    def test_user_role_cannot_access_dashboard(self, client, user_token):
        resp = client.get(
            "/advisors/dashboard",
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert resp.status_code == 403

    def test_user_role_cannot_access_today_meetings(self, client, user_token):
        resp = client.get(
            "/advisors/meetings/today",
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert resp.status_code == 403

    def test_no_token_returns_401(self, client):
        assert client.get("/advisors/portfolio").status_code == 401
        assert client.get("/advisors/dashboard").status_code == 401
        assert client.get("/advisors/meetings/today").status_code == 401