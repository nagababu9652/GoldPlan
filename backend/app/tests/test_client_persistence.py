"""Client/profile persistence checks for fields exposed by the API."""
import os
from uuid import uuid4

import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.orm import Session
from unittest.mock import Mock

from app.models.foundation.geography import City, Country, State
from app.models.foundation.party import Party
from app.models.identity.auth import User
from app.models.organization.employee import Employee
from app.routers import clients
from app.routers.clients import create_client, update_client
from app.schemas.client import ClientCreate, ClientUpdate
from app.services.auth_service import create_party_profile
from app.services.party_profile import lookup_id
from app.services.access import AccessContext


def test_client_requests_reject_fields_without_a_storage_workflow():
    with pytest.raises(ValidationError):
        ClientCreate(first_name="Test", last_name="Client", nominee_name="Ignored")
    with pytest.raises(ValidationError):
        ClientUpdate(group_id=123)


def test_client_creation_enforces_subscription_capacity(monkeypatch):
    db = Mock()
    db.query.return_value.filter.return_value.count.return_value = 1
    monkeypatch.setattr(
        clients, "get_advisor_employee",
        lambda advisor, database: type("EmployeeRecord", (), {"organization_id": 7})(),
    )
    context = AccessContext(
        user_id=1, party_id=2, organization_id=7, actor_type="HEAD", employee_id=3,
        roles=frozenset({"ORG_ADMIN"}), permissions=frozenset(), denied_permissions=frozenset(),
        subscription_status="ACTIVE", subscription_active=True,
        entitlements=frozenset({"FEATURE.CRM"}), limits={"LIMIT.CLIENTS": 1},
    )
    with pytest.raises(HTTPException) as error:
        create_client(
            ClientCreate(first_name="Limit", last_name="Reached"),
            context, db,
        )
    assert error.value.status_code == 409
    assert "LIMIT.CLIENTS" in error.value.detail
    db.add.assert_not_called()


@pytest.mark.skipif(os.getenv("FINPLAN_DB_TESTS") != "1", reason="Requires configured PostgreSQL")
def test_client_fields_round_trip_through_domain_tables():
    from app.database.session import engine

    with engine.connect() as connection:
        outer = connection.begin()
        db = Session(bind=connection, join_transaction_mode="create_savepoint", expire_on_commit=False)
        try:
            advisor = (
                db.query(User).join(Employee, Employee.party_id == User.party_id)
                .filter(User.is_active.is_(True), Employee.is_active.is_(True)).first()
            )
            assert advisor is not None, "Database needs an active advisor/employee fixture"
            suffix = uuid4().hex[:10]
            organization_id = db.query(Employee.organization_id).filter(
                Employee.party_id == advisor.party_id,
            ).scalar()
            employee_id = db.query(Employee.id).filter(
                Employee.party_id == advisor.party_id,
                Employee.organization_id == organization_id,
            ).scalar()
            class TestAccess:
                def __init__(self, org_id):
                    self.organization_id = org_id
                    self.employee_id = employee_id
                    self.party_id = advisor.party_id
                    self.user_id = advisor.id
                def check_limit(self, code, current_usage, requested=1): return None
            access_context = TestAccess(organization_id)
            created = create_client(ClientCreate(
                first_name="Persistence", last_name=suffix,
                address_line1="1 Test Road", city="Hyderabad",
                state="Telangana", country="India", pincode="500001",
                bank_name="Test Bank", account_number=f"TEST{suffix}",
                ifsc_code="TEST0000001", kyc_status="PENDING",
            ), access_context, db)
            assert (created.city, created.state, created.country) == ("Hyderabad", "Telangana", "India")
            assert (created.bank_name, created.account_number) == ("Test Bank", f"TEST{suffix}")
            assert created.kyc_status == "PENDING"

            updated = update_client(created.id, ClientUpdate(
                address_line2="Second floor", pincode="500002",
                bank_name="Updated Bank", ifsc_code="UPDT0000001",
                kyc_status="VERIFIED",
            ), db, access_context)
            assert updated.address_line2 == "Second floor"
            assert updated.pincode == "500002"
            assert updated.bank_name == "Updated Bank"
            assert updated.ifsc_code == "UPDT0000001"
            assert updated.kyc_status == "VERIFIED"
        finally:
            db.close()
            outer.rollback()


@pytest.mark.skipif(os.getenv("FINPLAN_DB_TESTS") != "1", reason="Requires configured PostgreSQL")
def test_registration_resolves_submitted_city_and_state():
    from app.database.session import engine

    with engine.connect() as connection:
        outer = connection.begin()
        db = Session(bind=connection, join_transaction_mode="create_savepoint", expire_on_commit=False)
        try:
            country = db.query(Country).filter(Country.country_name == "India").one()
            suffix = uuid4().hex[:8]
            state = State(country_id=country.id, state_name=f"Test State {suffix}")
            db.add(state)
            db.flush()
            city = City(state_id=state.id, city_name=f"Test City {suffix}")
            db.add(city)
            party = Party(
                party_code=f"TEST-{suffix}",
                party_type_id=lookup_id(db, "PARTY_TYPE", "INDIVIDUAL"),
                display_name="Registration Geography Test",
            )
            db.add(party)
            db.flush()

            create_party_profile(db, party, {
                "address_line1": "10 Registration Street",
                "city": city.city_name, "state": state.state_name,
                "country": country.country_name, "pincode": "999999",
            })
            db.flush()
            db.expire_all()
            stored = db.query(Party).filter(Party.id == party.id).one().addresses[0]
            assert stored.city_id == city.id
            assert stored.state_id == state.id
            assert stored.country_id == country.id

            with pytest.raises(HTTPException, match="Unknown or ambiguous city_name"):
                create_party_profile(db, party, {
                    "address_line1": "Bad address", "city": "Does Not Exist",
                    "state": state.state_name, "country": country.country_name,
                })
        finally:
            db.close()
            outer.rollback()
