"""Opt-in PostgreSQL authorization checks against an isolated test database.

Set FINPLAN_SECURITY_TEST_DB=1. The configured server must contain a database
named finplan_security_test with the application schema; tests roll back writes.
"""
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime
from threading import Barrier
from uuid import uuid4

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.foundation.lookup import LookupCategory, LookupValue
from app.models.foundation.party import Party
from app.models.identity.auth import User
from app.models.identity.authorization import Role, UserRole
from app.models.organization.core import Branch, Department, Designation, Organization
from app.models.organization.employee import Employee
from app.models.organization.external import Agency, ArnHolder
from app.routers.admin_external import agencies, list_arn_documents
from app.services.access_lifecycle import protect_last_active_head


pytestmark = pytest.mark.skipif(os.getenv("FINPLAN_SECURITY_TEST_DB") != "1",
                                reason="Requires isolated finplan_security_test PostgreSQL database")


@pytest.fixture
def db():
    url = make_url(settings.database_url).set(database="finplan_security_test")
    assert url.database == "finplan_security_test"
    engine = create_engine(url)
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, autoflush=True, expire_on_commit=False)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()
        engine.dispose()


def organization_fixture(db):
    suffix = uuid4().hex[:12]
    category = LookupCategory(category_code=f"TEST_{suffix}", category_name=f"Test {suffix}")
    db.add(category); db.flush()
    kind = LookupValue(category_id=category.id, value_code="INDIVIDUAL", value_name="Individual")
    db.add(kind); db.flush()
    organizations = []
    for index in (1, 2):
        org = Organization(organization_code=f"SEC_{suffix}_{index}", legal_name=f"Security {index}",
                           default_currency_code="INR", timezone="Asia/Kolkata")
        db.add(org); db.flush()
        party = Party(organization_id=org.id, party_code=f"SEC_P_{suffix}_{index}",
                      party_type_id=kind.id, display_name=f"Head {index}")
        db.add(party); db.flush()
        agency = Agency(organization_id=org.id, party_id=party.id,
                        agency_code=f"SEC_A_{index}", start_date=date.today(), status="ACTIVE")
        db.add(agency); db.flush()
        organizations.append((org, party, agency))
    return kind, organizations


def test_agency_queries_do_not_return_another_organizations_records(db):
    _, organizations = organization_fixture(db)
    first, second = organizations
    foreign_arn = ArnHolder(organization_id=second[0].id, arn_number=f"ARN-{uuid4().hex[:8]}",
                            holder_party_id=second[1].id, holder_type="AGENCY",
                            agency_id=second[2].id, status="ACTIVE")
    db.add(foreign_arn); db.flush()
    context = type("Context", (), {"organization_id": first[0].id})()

    found = agencies(True, context, db)

    assert [row.id for row in found] == [first[2].id]
    assert second[2].id not in [row.id for row in found]
    with pytest.raises(HTTPException) as error:
        list_arn_documents(foreign_arn.id, context, db)
    assert error.value.status_code == 404


def test_last_active_head_is_checked_against_live_database_rows(db):
    kind, organizations = organization_fixture(db)
    org = organizations[0][0]
    branch = Branch(organization_id=org.id, branch_code="MAIN", branch_name="Main")
    db.add(branch); db.flush()
    department = Department(organization_id=org.id, branch_id=branch.id,
                            department_code="LEAD", department_name="Leadership")
    designation = Designation(organization_id=org.id, designation_code="HEAD", designation_name="Head")
    db.add_all([department, designation]); db.flush()
    role = Role(organization_id=org.id, role_code="ORG_ADMIN", role_name="Head")
    db.add(role); db.flush()
    users = []
    for index in (1, 2):
        party = Party(organization_id=org.id, party_code=f"HEAD_{index}_{uuid4().hex[:8]}",
                      party_type_id=kind.id, display_name=f"Head {index}")
        db.add(party); db.flush()
        user = User(party_id=party.id, username=f"head_{uuid4().hex}@example.com",
                    email=f"head_{uuid4().hex}@example.com", account_status="ACTIVE", is_active=True)
        db.add(user); db.flush()
        db.add(Employee(organization_id=org.id, party_id=party.id, employee_code=f"H{index}",
                        branch_id=branch.id, department_id=department.id,
                        designation_id=designation.id, joining_date=date.today(),
                        employment_type="FULL_TIME", employment_status="ACTIVE"))
        db.add(UserRole(user_id=user.id, role_id=role.id, effective_from=datetime.utcnow()))
        users.append(user)
    db.flush()

    protect_last_active_head(db, users[0].id, org.id)
    users[0].is_active = False
    db.flush()
    with pytest.raises(HTTPException) as error:
        protect_last_active_head(db, users[1].id, org.id)
    assert error.value.status_code == 409


def test_concurrent_head_removals_leave_one_active_head():
    """Independent committed transactions must not both remove the last Head."""
    url = make_url(settings.database_url).set(database="finplan_security_test")
    assert url.database == "finplan_security_test"
    engine = create_engine(url)
    ids = {}
    try:
        with Session(engine) as setup:
            suffix = uuid4().hex[:12]
            category = LookupCategory(category_code=f"RACE_{suffix}", category_name="Race test")
            setup.add(category); setup.flush()
            ids["category"] = category.id
            kind = LookupValue(category_id=category.id, value_code="INDIVIDUAL", value_name="Individual")
            setup.add(kind); setup.flush()
            ids["kind"] = kind.id
            org = Organization(organization_code=f"RACE_{suffix}", legal_name="Race test",
                               default_currency_code="INR", timezone="Asia/Kolkata")
            setup.add(org); setup.flush()
            ids["org"] = org.id
            branch = Branch(organization_id=org.id, branch_code="MAIN", branch_name="Main")
            setup.add(branch); setup.flush()
            ids["branch"] = branch.id
            department = Department(organization_id=org.id, branch_id=branch.id,
                                    department_code="LEAD", department_name="Leadership")
            designation = Designation(organization_id=org.id, designation_code="HEAD", designation_name="Head")
            setup.add_all([department, designation]); setup.flush()
            ids["department"], ids["designation"] = department.id, designation.id
            role = Role(organization_id=org.id, role_code="ORG_ADMIN", role_name="Head")
            setup.add(role); setup.flush()
            ids["role"] = role.id
            ids["parties"], ids["users"], ids["employees"], ids["grants"] = [], [], [], []
            for index in (1, 2):
                party = Party(organization_id=org.id, party_code=f"HEAD_{index}_{suffix}",
                              party_type_id=kind.id, display_name=f"Head {index}")
                setup.add(party); setup.flush()
                ids["parties"].append(party.id)
                user = User(party_id=party.id, username=f"head_{uuid4().hex}@example.com",
                            email=f"head_{uuid4().hex}@example.com", account_status="ACTIVE", is_active=True)
                setup.add(user); setup.flush()
                ids["users"].append(user.id)
                employee = Employee(organization_id=org.id, party_id=party.id, employee_code=f"H{index}",
                                    branch_id=branch.id, department_id=department.id,
                                    designation_id=designation.id, joining_date=date.today(),
                                    employment_type="FULL_TIME", employment_status="ACTIVE")
                grant = UserRole(user_id=user.id, role_id=role.id, effective_from=datetime.utcnow())
                setup.add_all([employee, grant]); setup.flush()
                ids["employees"].append(employee.id)
                ids["grants"].append(grant.id)
            setup.commit()

        start = Barrier(2)

        def remove_head(user_id):
            with Session(engine) as session:
                start.wait(timeout=10)
                try:
                    protect_last_active_head(session, user_id, ids["org"])
                    user = session.get(User, user_id)
                    user.is_active = False
                    user.account_status = "DISABLED"
                    session.commit()
                    return "disabled"
                except HTTPException as error:
                    session.rollback()
                    return error.status_code

        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(remove_head, ids["users"]))
        assert sorted(results, key=str) == sorted(["disabled", 409], key=str)
        with Session(engine) as verify:
            active = verify.query(User).filter(User.id.in_(ids["users"]), User.is_active.is_(True)).count()
            assert active == 1
    finally:
        if ids.get("org"):
            with Session(engine) as cleanup:
                cleanup.query(UserRole).filter(UserRole.id.in_(ids["grants"])).delete(synchronize_session=False)
                cleanup.query(Employee).filter(Employee.id.in_(ids["employees"])).delete(synchronize_session=False)
                cleanup.query(User).filter(User.id.in_(ids["users"])).delete(synchronize_session=False)
                cleanup.query(Party).filter(Party.id.in_(ids["parties"])).delete(synchronize_session=False)
                cleanup.query(Role).filter(Role.id == ids["role"]).delete(synchronize_session=False)
                cleanup.query(Department).filter(Department.id == ids["department"]).delete(synchronize_session=False)
                cleanup.query(Designation).filter(Designation.id == ids["designation"]).delete(synchronize_session=False)
                cleanup.query(Branch).filter(Branch.id == ids["branch"]).delete(synchronize_session=False)
                cleanup.query(Organization).filter(Organization.id == ids["org"]).delete(synchronize_session=False)
                cleanup.query(LookupValue).filter(LookupValue.id == ids["kind"]).delete(synchronize_session=False)
                cleanup.query(LookupCategory).filter(LookupCategory.id == ids["category"]).delete(synchronize_session=False)
                cleanup.commit()
        engine.dispose()
