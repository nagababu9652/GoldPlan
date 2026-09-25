"""
Tests for the /advisors/meetings endpoints including /advisors/meetings/today.
"""
import os
import sys
import uuid
from datetime import date, time as dtime, datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from fastapi.testclient import TestClient

from app.database.session import get_db
from app.main import create_app
from app.models.identity.auth import User
from app.models.identity.authorization import Role, UserRole


@pytest.fixture
def client():
    app = create_app()
    return TestClient(app)


@pytest.fixture
def advisor_token(client):
    """Register and login an advisor, return the access token."""
    unique = str(uuid.uuid4())[:8]
    email = f"meeting_advisor_{unique}@test.com"

    reg_response = client.post("/auth/register", json={
        "first_name": "Meeting",
        "last_name": "Advisor",
        "email": email,
        "password": "test1234",
        "role": "advisor",
    })
    assert reg_response.status_code == 201, f"Registration failed: {reg_response.text}"

    login_response = client.post("/auth/login", json={
        "email": email,
        "password": "test1234",
    })
    assert login_response.status_code == 200, f"Login failed: {login_response.text}"

    return login_response.json()["access_token"]


class TestTodayMeetingsEndpoint:
    """Tests for the GET /advisors/meetings/today endpoint."""

    def test_today_meetings_requires_auth(self, client):
        """Endpoint should return 401 without a token."""
        response = client.get("/advisors/meetings/today")
        assert response.status_code == 401

    def test_today_meetings_rejects_invalid_token(self, client):
        """Endpoint should return 401 with an invalid token."""
        response = client.get(
            "/advisors/meetings/today",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401

    def test_today_meetings_returns_empty_list(self, client, advisor_token):
        """Endpoint should return an empty list for a new advisor."""
        response = client.get(
            "/advisors/meetings/today",
            headers={"Authorization": f"Bearer {advisor_token}"}
        )
        assert response.status_code == 200

        data = response.json()
        assert "meetings" in data
        assert "total" in data
        assert data["meetings"] == []
        assert data["total"] == 0

    def test_today_meetings_response_shape(self, client, advisor_token):
        """Response should match the MeetingListResponse schema."""
        response = client.get(
            "/advisors/meetings/today",
            headers={"Authorization": f"Bearer {advisor_token}"}
        )
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data["meetings"], list)
        assert isinstance(data["total"], int)


class TestAllMeetingsEndpoint:
    """Tests for the GET /advisors/meetings endpoint."""

    def test_all_meetings_requires_auth(self, client):
        """Endpoint should return 401 without a token."""
        response = client.get("/advisors/meetings")
        assert response.status_code == 401

    def test_all_meetings_returns_empty_list(self, client, advisor_token):
        """Endpoint should return an empty list for a new advisor."""
        response = client.get(
            "/advisors/meetings",
            headers={"Authorization": f"Bearer {advisor_token}"}
        )
        assert response.status_code == 200

        data = response.json()
        assert data["meetings"] == []
        assert data["total"] == 0

    def test_all_meetings_response_shape(self, client, advisor_token):
        """Response should match the MeetingListResponse schema."""
        response = client.get(
            "/advisors/meetings",
            headers={"Authorization": f"Bearer {advisor_token}"}
        )
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data["meetings"], list)
        assert isinstance(data["total"], int)


class TestMeetingNotFound:
    """Tests for the GET /advisors/meetings/{id} endpoint."""

    def test_get_nonexistent_meeting_returns_404(self, client, advisor_token):
        """Getting a non-existent meeting should return 404."""
        response = client.get(
            "/advisors/meetings/99999",
            headers={"Authorization": f"Bearer {advisor_token}"}
        )
        assert response.status_code == 404

class TestCreateMeetingValidation:
    """Tests for POST /advisors/meetings validation."""

    def test_create_meeting_rejects_nonexistent_client(
        self,
        client,
        advisor_token,
    ):
        """Creating a meeting for a non-existent client should return 404."""
        response = client.post(
            "/advisors/meetings",
            headers={"Authorization": f"Bearer {advisor_token}"},
            json={
                "client_id": 999999999,
                "title": "Test Meeting",
                "meeting_date": date.today().isoformat(),
                "meeting_time": "10:30:00",
                "meeting_type": "virtual",
                "status": "scheduled",
            },
        )

        assert response.status_code == 404

class TestMeetingPayloadValidation:
    """Tests for MeetingCreate request validation."""

    def test_invalid_meeting_type_returns_422(
        self,
        client,
        advisor_token,
    ):
        response = client.post(
            "/advisors/meetings",
            headers={"Authorization": f"Bearer {advisor_token}"},
            json={
                "client_id": 999999999,
                "title": "Test Meeting",
                "meeting_date": date.today().isoformat(),
                "meeting_time": "10:30:00",
                "meeting_type": "invalid_type",
                "status": "scheduled",
            },
        )

        assert response.status_code == 422

    def test_invalid_status_returns_422(
        self,
        client,
        advisor_token,
    ):
        response = client.post(
            "/advisors/meetings",
            headers={"Authorization": f"Bearer {advisor_token}"},
            json={
                "client_id": 999999999,
                "title": "Test Meeting",
                "meeting_date": date.today().isoformat(),
                "meeting_time": "10:30:00",
                "meeting_type": "virtual",
                "status": "invalid_status",
            },
        )

        assert response.status_code == 422

class TestMeetingMutationAuth:
    """Authentication tests for meeting mutations."""

    def test_create_meeting_requires_auth(self, client):
        response = client.post(
            "/advisors/meetings",
            json={
                "client_id": 1,
                "title": "Test Meeting",
                "meeting_date": date.today().isoformat(),
                "meeting_time": "10:30:00",
                "meeting_type": "virtual",
                "status": "scheduled",
            },
        )

        assert response.status_code == 401

    def test_update_meeting_requires_auth(self, client):
        response = client.put(
            "/advisors/meetings/99999",
            json={
                "title": "Updated Meeting",
            },
        )

        assert response.status_code == 401

    def test_delete_meeting_requires_auth(self, client):
        response = client.delete(
            "/advisors/meetings/99999",
        )

        assert response.status_code == 401

class TestMeetingMutationNotFound:
    """Tests for mutation endpoints when meeting does not exist."""

    def test_update_nonexistent_meeting_returns_404(
        self,
        client,
        advisor_token,
    ):
        response = client.put(
            "/advisors/meetings/99999",
            headers={"Authorization": f"Bearer {advisor_token}"},
            json={
                "title": "Updated Meeting",
            },
        )

        assert response.status_code == 404

    def test_delete_nonexistent_meeting_returns_404(
        self,
        client,
        advisor_token,
    ):
        response = client.delete(
            "/advisors/meetings/99999",
            headers={"Authorization": f"Bearer {advisor_token}"},
        )

        assert response.status_code == 404

