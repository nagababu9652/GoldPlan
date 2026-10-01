"""Financial-goal validation and PostgreSQL lifecycle checks."""
import os
from datetime import date
from decimal import Decimal

import pytest
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.models.identity.auth import User
from app.models.organization.assignment import EmployeeAssignment
from app.models.organization.employee import Employee
from app.routers.goals import archive_goal, create_goal, get_goal, list_goals, update_goal
from app.schemas.goal import GoalCreate, GoalUpdate


def test_goal_requires_exactly_one_owner():
    base = dict(goal_type="OTHER", title="Test", target_amount=100, target_date=date(2030, 1, 1))
    with pytest.raises(ValidationError, match="Exactly one"):
        GoalCreate(**base)
    with pytest.raises(ValidationError, match="Exactly one"):
        GoalCreate(**base, customer_id=1, customer_group_id=2)


def test_goal_update_rejects_null_for_required_fields():
    with pytest.raises(ValidationError, match="status cannot be null"):
        GoalUpdate(status=None)


@pytest.mark.skipif(os.getenv("FINPLAN_DB_TESTS") != "1", reason="Requires configured PostgreSQL")
def test_goal_crud_round_trip_and_archive():
    from app.database.session import engine

    with engine.connect() as connection:
        outer = connection.begin()
        db = Session(bind=connection, join_transaction_mode="create_savepoint", expire_on_commit=False)
        try:
            assignment = (
                db.query(EmployeeAssignment)
                .join(Employee, Employee.id == EmployeeAssignment.employee_id)
                .filter(
                    EmployeeAssignment.assignment_type == "ADVISOR",
                    EmployeeAssignment.entity_type == "CUSTOMER",
                    EmployeeAssignment.is_active.is_(True),
                    Employee.is_active.is_(True),
                ).first()
            )
            assert assignment is not None, "Database needs an advisor/customer assignment fixture"
            employee = db.query(Employee).filter(Employee.id == assignment.employee_id).one()
            advisor = db.query(User).filter(User.party_id == employee.party_id, User.is_active.is_(True)).first()
            assert advisor is not None, "Assigned employee needs an active user fixture"

            created = create_goal(GoalCreate(
                customer_id=assignment.entity_id,
                goal_type="retirement", title="Retirement corpus",
                target_amount=Decimal("1000000"), current_amount=Decimal("250000"),
                target_date=date(2040, 1, 1), priority=1,
                expected_inflation_rate=Decimal("6"), expected_return_rate=Decimal("10"),
            ), advisor, db)
            assert created.goal_type == "RETIREMENT"
            assert created.progress_percentage == Decimal("25.00")

            listed = list_goals(
                customer_id=assignment.entity_id, customer_group_id=None,
                goal_status=None, advisor=advisor, db=db,
            )
            assert [goal.id for goal in listed.goals] == [created.id]

            updated = update_goal(created.id, GoalUpdate(
                current_amount=Decimal("1000000"), status="achieved",
            ), advisor, db)
            assert updated.status == "ACHIEVED"
            assert updated.progress_percentage == Decimal("100.00")
            assert get_goal(created.id, advisor, db).id == created.id

            assert archive_goal(created.id, advisor, db)["message"] == "Goal archived successfully"
            assert list_goals(
                customer_id=assignment.entity_id, customer_group_id=None,
                goal_status=None, advisor=advisor, db=db,
            ).total == 0
        finally:
            db.close()
            outer.rollback()
