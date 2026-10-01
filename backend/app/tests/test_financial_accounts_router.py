"""Financial-account validation and PostgreSQL lifecycle checks."""
import os
from datetime import date
from decimal import Decimal

import pytest
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.models.identity.auth import User
from app.models.organization.assignment import EmployeeAssignment
from app.models.organization.employee import Employee
from app.routers.financial_accounts import (
    archive_financial_account, create_financial_account,
    get_financial_account, list_financial_accounts, update_financial_account,
)
from app.schemas.financial_account import FinancialAccountCreate, FinancialAccountUpdate


def test_financial_account_requires_exactly_one_owner():
    base = dict(account_type="BANK", account_name="Savings")
    with pytest.raises(ValidationError, match="Exactly one"):
        FinancialAccountCreate(**base)
    with pytest.raises(ValidationError, match="Exactly one"):
        FinancialAccountCreate(**base, customer_id=1, customer_group_id=2)


@pytest.mark.skipif(os.getenv("FINPLAN_DB_TESTS") != "1", reason="Requires configured PostgreSQL")
def test_financial_account_crud_round_trip():
    from app.database.session import engine

    with engine.connect() as connection:
        outer = connection.begin()
        db = Session(bind=connection, join_transaction_mode="create_savepoint", expire_on_commit=False)
        try:
            assignment = (
                db.query(EmployeeAssignment).join(Employee, Employee.id == EmployeeAssignment.employee_id)
                .filter(
                    EmployeeAssignment.assignment_type == "ADVISOR",
                    EmployeeAssignment.entity_type == "CUSTOMER",
                    EmployeeAssignment.is_active.is_(True), Employee.is_active.is_(True),
                ).first()
            )
            assert assignment is not None
            employee = db.query(Employee).filter(Employee.id == assignment.employee_id).one()
            advisor = db.query(User).filter(User.party_id == employee.party_id, User.is_active.is_(True)).first()
            assert advisor is not None

            created = create_financial_account(FinancialAccountCreate(
                customer_id=assignment.entity_id, account_type="loan",
                account_name="Home loan", institution_name="Test Bank",
                account_number_masked="XXXX1234", current_balance=Decimal("500000"),
                valuation_as_of=date.today(), interest_rate=Decimal("8.5"),
            ), advisor, db)
            assert created.account_nature == "LIABILITY"
            assert created.account_type == "LOAN"

            listed = list_financial_accounts(
                customer_id=assignment.entity_id, customer_group_id=None,
                account_status=None, advisor=advisor, db=db,
            )
            assert [account.id for account in listed.accounts] == [created.id]

            updated = update_financial_account(created.id, FinancialAccountUpdate(
                account_type="fixed_deposit", current_balance=Decimal("550000"), status="matured",
            ), advisor, db)
            assert updated.account_nature == "ASSET"
            assert updated.status == "MATURED"
            assert get_financial_account(created.id, advisor, db).id == created.id

            assert archive_financial_account(created.id, advisor, db)["message"] == "Financial account archived successfully"
            assert list_financial_accounts(
                customer_id=assignment.entity_id, customer_group_id=None,
                account_status=None, advisor=advisor, db=db,
            ).total == 0
        finally:
            db.close(); outer.rollback()
