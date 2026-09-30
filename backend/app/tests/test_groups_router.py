from datetime import date, datetime
from types import SimpleNamespace

import pytest
from pydantic import ValidationError
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.models.crm.customer import Customer, CustomerGroup, GroupMember
from app.models.organization.employee import Employee
from app.routers import groups as groups_router
from app.schemas.group import (
    GroupCreate,
    GroupHeadUpdate,
    GroupMemberAdd,
    GroupUpdate,
    MoveHouseholdRequest,
)


class FakeQuery:
    def __init__(self, rows=None):
        self.rows = list(rows or [])
        self.criteria = []
        self.order_by_columns = []

    def filter(self, *criteria):
        self.criteria.extend(criteria)
        return self

    def join(self, *_entities, **_kwargs):
        return self

    def _matches(self, row):
        for criterion in self.criteria:
            if hasattr(criterion, "clauses"):
                clause_results = [self._criterion_matches(row, clause) for clause in criterion.clauses]
                operator_name = getattr(getattr(criterion, "operator", None), "__name__", None)
                if operator_name == "or_":
                    match = any(clause_results)
                else:
                    match = all(clause_results)
                if not match:
                    return False
                continue
            if not self._criterion_matches(row, criterion):
                return False
        return True

    def _criterion_matches(self, row, criterion):
        left = getattr(criterion, "left", None)
        right = getattr(criterion, "right", None)
        if left is None and right is None:
            return True

        attr_name = getattr(left, "key", None)
        if attr_name is None:
            attr_name = getattr(left, "name", None)
        if attr_name is None:
            attr_name = str(left).rsplit(".", 1)[-1] if left is not None else None
        if attr_name is None:
            return True

        source = row
        if getattr(getattr(left, "table", None), "name", None) == "customer_groups" and hasattr(row, "customer_group_id"):
            source = row.group
        value = getattr(source, attr_name, None)
        right_value = getattr(right, "value", None)
        if right_value is None:
            text = str(right).lower()
            if text == "true":
                right_value = True
            elif text == "false":
                right_value = False
            elif text in {"none", "null"}:
                right_value = None
            else:
                right_value = right
        if hasattr(criterion, "operator") and getattr(criterion.operator, "__name__", None) == "is_":
            return value is right_value
        if getattr(criterion.operator, "__name__", None) == "ne":
            return value != right_value
        if getattr(criterion.operator, "__name__", None) == "in_op":
            return value in right_value
        return value == right_value

    def order_by(self, *columns):
        self.order_by_columns.extend(columns)
        return self

    def first(self):
        for row in self.rows:
            if self._matches(row):
                return row
        return None

    def all(self):
        rows = [row for row in self.rows if self._matches(row)]
        for column in reversed(self.order_by_columns):
            name = column.element.key
            descending = column.modifier.__name__ == "desc_op"
            rows.sort(key=lambda row: getattr(row, name), reverse=descending)
        return rows

    def update(self, values, synchronize_session=False):
        updated = 0
        for row in self.rows:
            if not self._matches(row):
                continue
            for key, value in values.items():
                attr_name = getattr(key, "key", None) or key
                setattr(row, attr_name, value)
            updated += 1
        return updated


class FakeDB:
    def __init__(self, employees=None, groups=None, customers=None, members=None):
        self.employees = list(employees or [])
        self.groups = list(groups or [])
        self.customers = list(customers or [])
        self.members = list(members or [])
        self.added = []
        self.committed = False
        self.commit_count = 0
        self.rolled_back = False
        self._next_group_id = max((g.id for g in self.groups), default=0) + 1
        self._next_member_id = max((m.id for m in self.members), default=0) + 1

    def query(self, model):
        if model is Employee:
            return FakeQuery(self.employees)
        if model is CustomerGroup:
            return FakeQuery(self.groups)
        if model is Customer:
            return FakeQuery(self.customers)
        if model is GroupMember:
            for member in self.members:
                member.__dict__["group"] = next((g for g in self.groups if g.id == member.customer_group_id), None)
            return FakeQuery(self.members)
        raise AssertionError(f"Unexpected model: {model}")

    def add(self, obj):
        self.added.append(obj)
        if isinstance(obj, CustomerGroup):
            if getattr(obj, "id", None) is None:
                obj.__dict__["id"] = self._next_group_id
                self._next_group_id += 1
            if getattr(obj, "created_at", None) is None:
                obj.__dict__["created_at"] = datetime.utcnow()
            if getattr(obj, "updated_at", None) is None:
                obj.__dict__["updated_at"] = obj.created_at
            if obj not in self.groups:
                self.groups.append(obj)
        elif isinstance(obj, Customer):
            if getattr(obj, "id", None) is None:
                obj.__dict__["id"] = len(self.customers) + 1
            if obj not in self.customers:
                self.customers.append(obj)
        elif isinstance(obj, GroupMember):
            if getattr(obj, "id", None) is None:
                obj.__dict__["id"] = self._next_member_id
                self._next_member_id += 1
            if not hasattr(obj, "customer") or obj.customer is None:
                customer = next((c for c in self.customers if c.id == obj.customer_id), None)
                obj.__dict__["customer"] = customer
            if obj not in self.members:
                self.members.append(obj)

    def flush(self):
        return None

    def refresh(self, obj):
        return None

    def commit(self):
        self.committed = True
        self.commit_count += 1

    def rollback(self):
        self.rolled_back = True


def make_advisor(**kwargs):
    payload = {
        "id": 5,
        "party_id": 42,
        "organization_id": 10,
        "branch_id": 3,
        "is_active": True,
    }
    payload.update(kwargs)
    return SimpleNamespace(**payload)


def make_customer(customer_id=7, first_name="Alice", last_name="Smith", status="ACTIVE"):
    return SimpleNamespace(
        id=customer_id,
        customer_code=f"C-{customer_id:05d}",
        organization_id=10,
        customer_status=status,
        party=SimpleNamespace(
            display_name=None,
            first_name=first_name,
            last_name=last_name,
            email=f"{first_name.lower()}@example.com",
            mobile_number="9999999999",
        ),
    )


def make_group(group_id=1, **kwargs):
    payload = {
        "id": group_id,
        "organization_id": 10,
        "group_code": f"G-{group_id:05d}",
        "group_name": f"Family {group_id}",
        "group_type": "HOUSEHOLD",
        "head_customer_id": None,
        "primary_branch_id": None,
        "primary_advisor_employee_id": None,
        "risk_profile": None,
        "investment_objective": None,
        "remarks": None,
        "is_active": True,
        "created_at": datetime(2024, 1, 1, 12, 0, 0),
        "updated_at": datetime(2024, 1, 2, 12, 0, 0),
    }
    payload.update(kwargs)
    return SimpleNamespace(**payload)


def make_group_member(member_id=1, customer_group_id=1, customer=None, **kwargs):
    payload = {
        "id": member_id,
        "customer_group_id": customer_group_id,
        "customer_id": customer.id if customer else 1,
        "relationship_type": "SELF",
        "is_group_head": False,
        "is_primary": False,
        "joined_on": date(2024, 1, 1),
        "left_on": None,
        "remarks": None,
        "customer": customer,
    }
    payload.update(kwargs)
    return SimpleNamespace(**payload)


@pytest.fixture
def membership_client():
    customer = make_customer(7)
    other_customer = make_customer(8)
    db = FakeDB(
        employees=[make_advisor()],
        groups=[
            make_group(1),
            make_group(2, organization_id=99),
            make_group(3, primary_advisor_employee_id=99),
            make_group(4, is_active=False),
        ],
        members=[
            make_group_member(1, 1, customer, joined_on=date(2026, 1, 1), left_on=date(2026, 3, 20)),
            make_group_member(3, 1, customer, joined_on=date(2026, 6, 10), is_primary=True),
            make_group_member(2, 1, other_customer, joined_on=date(2026, 6, 10), is_group_head=True),
            make_group_member(4, 2, customer),
            make_group_member(5, 4, customer, left_on=date(2026, 3, 20)),
        ],
    )
    app = FastAPI()
    app.include_router(groups_router.router)
    app.dependency_overrides[groups_router.get_db] = lambda: db
    app.dependency_overrides[groups_router.get_current_advisor] = lambda: SimpleNamespace(id=77, party_id=42)
    with TestClient(app) as client:
        yield client


@pytest.mark.parametrize("query", ["", "?include_history=true"])
def test_members_endpoint_only_returns_active_periods(membership_client, query):
    response = membership_client.get(f"/advisors/groups/1/members{query}")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 2
    assert [member["id"] for member in body["members"]] == [2, 3]
    assert all(member["left_on"] is None for member in body["members"])


def test_membership_history_preserves_repeated_periods(membership_client):
    response = membership_client.get("/advisors/groups/1/members/history")
    assert response.status_code == 200
    body = response.json()
    assert body["group_id"] == 1
    assert body["total"] == 3
    assert [member["id"] for member in body["members"]] == [3, 2, 1]
    periods = [member for member in body["members"] if member["customer_id"] == 7]
    assert [(member["joined_on"], member["left_on"]) for member in periods] == [
        ("2026-06-10", None),
        ("2026-01-01", "2026-03-20"),
    ]


@pytest.mark.parametrize("suffix", ["members", "members/history"])
@pytest.mark.parametrize("group_id, status_code", [(2, 404), (3, 403), (999, 404)])
def test_membership_endpoints_enforce_group_access(membership_client, suffix, group_id, status_code):
    response = membership_client.get(f"/advisors/groups/{group_id}/{suffix}")
    assert response.status_code == status_code


def test_membership_history_available_for_inactive_group(membership_client):
    response = membership_client.get("/advisors/groups/4/members/history")
    assert response.status_code == 200
    assert [member["id"] for member in response.json()["members"]] == [5]
    active = membership_client.get("/advisors/groups/4/members")
    assert active.json()["members"] == []


def test_get_advisor_employee_uses_party_id_and_active_flag():
    employee = make_advisor(id=21, party_id=42, organization_id=10, branch_id=7)
    db = FakeDB(employees=[employee])
    advisor = SimpleNamespace(id=77, party_id=42)

    resolved = groups_router.get_advisor_employee(db, advisor)

    assert resolved is employee


def test_build_group_response_uses_created_at_when_updated_at_is_null():
    group = make_group(
        group_id=1,
        created_at=datetime(2024, 1, 1, 12, 0, 0),
        updated_at=None,
    )

    response = groups_router.build_group_response(
        db=FakeDB(groups=[], customers=[], members=[]),
        group=group,
    )

    assert response.updated_at == group.created_at


def test_build_group_response_uses_head_customer_id_name_when_present():
    head_customer = make_customer(7, "Alice", "Smith")
    group = make_group(
        group_id=2,
        head_customer_id=7,
        created_at=datetime(2024, 2, 1, 12, 0, 0),
        updated_at=datetime(2024, 2, 2, 12, 0, 0),
    )

    response = groups_router.build_group_response(
        db=FakeDB(
            customers=[head_customer],
            members=[make_group_member(1, 2, head_customer)],
        ),
        group=group,
    )

    assert response.head_customer_name == "Alice Smith"
    assert response.head_customer_id == head_customer.id


def test_group_counts_exclude_past_periods_and_other_groups():
    customer = make_customer(7)
    group = make_group(1)
    historical = make_group_member(1, 1, customer, left_on=date(2026, 3, 20))
    current = make_group_member(2, 1, customer, joined_on=date(2026, 6, 10))
    db = FakeDB(members=[historical, current, make_group_member(3, 2, customer)])

    response = groups_router.build_group_response(db, group)

    assert response.member_count == response.active_member_count == 1
    assert historical.left_on == date(2026, 3, 20)


@pytest.mark.parametrize("head_id", [7, 99, None])
@pytest.mark.parametrize("has_current_head", [False, True])
def test_group_head_response_uses_only_active_members(head_id, has_current_head):
    former_head = make_customer(7, "Former", "Head")
    current_head = make_customer(8, "Current", "Head")
    group = make_group(1, head_customer_id=head_id)
    members = [make_group_member(
        1, 1, former_head, is_group_head=True, left_on=date(2026, 3, 20)
    )]
    if has_current_head:
        members.append(make_group_member(2, 1, current_head, is_group_head=True))
    db = FakeDB(customers=[former_head, current_head], members=members)

    response = groups_router.build_group_response(db, group)

    assert response.head_customer_id == (8 if has_current_head else None)
    assert response.head_customer_name == ("Current Head" if has_current_head else None)
    assert response.member_count == response.active_member_count == int(has_current_head)
    assert group.head_customer_id == head_id  # Reading must not rewrite stored data.


def test_set_group_head_rejects_historical_member():
    customer = make_customer(7)
    historical = make_group_member(1, 1, customer, left_on=date(2026, 3, 20))
    group = make_group(1)
    db = FakeDB(
        employees=[make_advisor()], groups=[group],
        customers=[customer], members=[historical],
    )

    with pytest.raises(HTTPException) as error:
        groups_router.set_group_head(
            group_id=1, body=GroupHeadUpdate(customer_id=7), db=db,
            advisor=SimpleNamespace(id=77, party_id=42),
        )

    assert error.value.status_code == 400
    assert group.head_customer_id is None
    assert historical.is_group_head is False
    assert not db.committed


def test_list_groups_returns_group_list():
    head_customer = make_customer(8, "Bob", "Jones")
    group = make_group(group_id=3, group_name="Jones Family", head_customer_id=8, is_active=True)
    group_member = make_group_member(1, 3, customer=head_customer, is_group_head=True)
    employee = make_advisor(id=10, party_id=42, organization_id=10, branch_id=7)
    db = FakeDB(employees=[employee], groups=[group], customers=[head_customer], members=[group_member])

    response = groups_router.list_groups(
        db=db,
        advisor=SimpleNamespace(id=77, party_id=42),
        group_type=None,
        search=None,
        include_inactive=False,
    )

    assert response.total == 1
    assert response.groups[0].group_name == "Jones Family"
    assert response.groups[0].head_customer_name == "Bob Jones"


def test_create_group_creates_group_and_head_member():
    employee = make_advisor(id=12, party_id=42, organization_id=10, branch_id=5)
    head_customer = make_customer(11, "Carol", "Ng")
    db = FakeDB(employees=[employee], customers=[head_customer])

    result = groups_router.create_group(
        group_data=GroupCreate(group_name="Ng Family", group_type="HOUSEHOLD", head_customer_id=head_customer.id),
        db=db,
        advisor=SimpleNamespace(id=77, party_id=42),
    )

    assert result.group_name == "Ng Family"
    assert result.head_customer_id == head_customer.id
    assert db.groups[0].group_name == "Ng Family"
    assert len(db.members) == 1
    assert db.members[0].is_group_head is True


def test_get_group_returns_group_detail():
    employee = make_advisor(id=14, party_id=42, organization_id=10, branch_id=7)
    head_customer = make_customer(15, "Dana", "Lee")
    group = make_group(group_id=4, group_name="Lee Household", head_customer_id=15, primary_advisor_employee_id=14)
    member = make_group_member(2, 4, customer=head_customer, is_group_head=True)
    db = FakeDB(employees=[employee], groups=[group], customers=[head_customer], members=[member])

    result = groups_router.get_group(
        group_id=4,
        db=db,
        advisor=SimpleNamespace(id=77, party_id=42),
    )

    assert result.group_name == "Lee Household"
    assert result.head_customer_name == "Dana Lee"


def test_update_group_updates_fields():
    employee = make_advisor(id=16, party_id=42, organization_id=10, branch_id=7)
    group = make_group(group_id=5, group_name="Old Name", group_type="HOUSEHOLD", is_active=True)
    db = FakeDB(employees=[employee], groups=[group])

    result = groups_router.update_group(
        group_id=5,
        group_data=GroupUpdate(group_name="Updated Name"),
        db=db,
        advisor=SimpleNamespace(id=77, party_id=42),
    )

    assert result.group_name == "Updated Name"
    assert result.group_type == "HOUSEHOLD"
    assert db.groups[0].group_name == "Updated Name"


def test_add_group_member_creates_member_and_marks_head():
    employee = make_advisor(id=17, party_id=42, organization_id=10, branch_id=7)
    group = make_group(group_id=6, group_name="Team Household", is_active=True)
    customer = make_customer(21, "Evan", "Wood")
    db = FakeDB(employees=[employee], groups=[group], customers=[customer])

    result = groups_router.add_group_member(
        group_id=6,
        member_data=GroupMemberAdd(customer_id=21, relationship_type="BROTHER", is_group_head=True),
        db=db,
        advisor=SimpleNamespace(id=77, party_id=42),
    )

    assert result.customer_id == 21
    assert result.is_group_head is True
    assert db.groups[0].head_customer_id == 21


def test_set_group_head_updates_group_head():
    employee = make_advisor(id=18, party_id=42, organization_id=10, branch_id=7)
    group = make_group(group_id=7, head_customer_id=None, is_active=True)
    customer = make_customer(22, "Frank", "Miller")
    member = make_group_member(1, 7, customer=customer, is_group_head=False, is_primary=True)
    db = FakeDB(employees=[employee], groups=[group], customers=[customer], members=[member])

    result = groups_router.set_group_head(
        group_id=7,
        body=GroupHeadUpdate(customer_id=22),
        db=db,
        advisor=SimpleNamespace(id=77, party_id=42),
    )

    assert result.group.head_customer_id == 22
    assert result.message.startswith("Frank Miller")


def test_remove_group_member_marks_left_on():
    employee = make_advisor(id=20, party_id=42, organization_id=10, branch_id=7)
    group = make_group(group_id=9, is_active=True)
    customer = make_customer(24, "Henry", "Moore")
    member = make_group_member(1, 9, customer=customer, is_group_head=False, is_primary=False)
    db = FakeDB(employees=[employee], groups=[group], customers=[customer], members=[member])

    result = groups_router.remove_group_member(
        group_id=9,
        customer_id=24,
        db=db,
        advisor=SimpleNamespace(id=77, party_id=42),
    )

    assert result["customer_id"] == 24
    assert result["left_on"] == date.today()
    assert member.left_on == date.today()


@pytest.mark.parametrize("group_type", ["HOUSEHOLD", "FAMILY"])
def test_remove_sole_household_head_preserves_history_and_closes_group(group_type):
    customer = make_customer(7)
    group = make_group(1, group_type=group_type, head_customer_id=7)
    member = make_group_member(2, 1, customer, is_group_head=True, is_primary=True)
    historical = make_group_member(1, 1, customer, left_on=date(2025, 1, 1))
    db = FakeDB(employees=[make_advisor()], groups=[group], members=[historical, member])

    groups_router.remove_group_member(1, 7, db, SimpleNamespace(party_id=42))

    assert group.is_active is False
    assert group.head_customer_id is None
    assert member.left_on == date.today()
    assert member.is_primary is member.is_group_head is False
    assert historical.left_on == date(2025, 1, 1)
    assert db.commit_count == 1


def test_remove_head_with_remaining_members_is_blocked():
    head = make_customer(7)
    member = make_group_member(1, 1, head, is_group_head=True)
    group = make_group(1, head_customer_id=7)
    db = FakeDB(employees=[make_advisor()], groups=[group], members=[
        member, make_group_member(2, 1, make_customer(8)),
    ])
    with pytest.raises(HTTPException) as error:
        groups_router.remove_group_member(1, 7, db, SimpleNamespace(party_id=42))
    assert error.value.status_code == 400
    assert member.left_on is None
    assert group.head_customer_id == 7
    assert not db.committed


@pytest.mark.parametrize("is_head", [False, True])
def test_move_last_member_closes_source_and_preserves_other_memberships(is_head):
    customer = make_customer(7)
    source = make_group(1, head_customer_id=7 if is_head else None)
    target = make_group(2)
    business = make_group(3, group_type="BUSINESS")
    old = make_group_member(1, 1, customer, is_group_head=is_head, is_primary=True)
    association = make_group_member(2, 3, customer)
    historical = make_group_member(3, 2, customer, left_on=date(2025, 1, 1))
    db = FakeDB(employees=[make_advisor()], groups=[source, target, business],
                customers=[customer], members=[old, association, historical])

    groups_router.move_client_to_household(
        2, MoveHouseholdRequest(customer_id=7), db, SimpleNamespace(party_id=42)
    )

    assert source.is_active is False
    assert source.head_customer_id is None
    assert old.left_on == date.today()
    assert old.is_primary is old.is_group_head is False
    assert association.left_on is None
    assert historical.left_on == date(2025, 1, 1)
    new = db.members[-1]
    assert new.id != historical.id
    assert new.customer_group_id == 2
    assert new.is_primary is True
    assert new.left_on is None


@pytest.mark.parametrize("group_type", ["HOUSEHOLD", "FAMILY", "BUSINESS", "INVESTMENT", "TRUST", "HUF", "OTHER"])
def test_household_exclusivity_and_entity_membership(group_type):
    customer = make_customer(7)
    source = make_group(1)
    target = make_group(2, group_type=group_type)
    original = make_group_member(1, 1, customer, is_primary=True)
    db = FakeDB(employees=[make_advisor()], groups=[source, target],
                customers=[customer], members=[original])
    if group_type in {"HOUSEHOLD", "FAMILY"}:
        with pytest.raises(HTTPException) as error:
            groups_router.add_group_member(2, GroupMemberAdd(customer_id=7), db, SimpleNamespace(party_id=42))
        assert error.value.status_code == 409
        assert not db.committed
    else:
        added = groups_router.add_group_member(2, GroupMemberAdd(customer_id=7), db, SimpleNamespace(party_id=42))
        assert added.is_primary is False
    assert original.is_primary is True
    assert original.left_on is None


@pytest.mark.parametrize("replacement", [None, 7, 9, 8])
def test_move_head_requires_active_replacement(replacement):
    customer = make_customer(7)
    source = make_group(1, head_customer_id=7)
    target = make_group(2)
    head = make_group_member(1, 1, customer, is_group_head=True, is_primary=True)
    remaining = make_group_member(2, 1, make_customer(8), is_primary=True)
    historical = make_group_member(3, 1, make_customer(9), left_on=date(2025, 1, 1))
    db = FakeDB(employees=[make_advisor()], groups=[source, target],
                customers=[customer], members=[head, remaining, historical])
    payload = MoveHouseholdRequest(customer_id=7, new_head_customer_id=replacement)
    if replacement != 8:
        with pytest.raises(HTTPException) as error:
            groups_router.move_client_to_household(2, payload, db, SimpleNamespace(party_id=42))
        assert error.value.status_code == 400
        assert head.left_on is None
        assert source.head_customer_id == 7
        assert not db.committed
    else:
        groups_router.move_client_to_household(2, payload, db, SimpleNamespace(party_id=42))
        assert head.left_on == date.today()
        assert remaining.is_group_head is True
        assert source.head_customer_id == 8
        assert source.is_active is True
    assert historical.left_on == date(2025, 1, 1)


@pytest.mark.parametrize("group_type", ["HOUSEHOLD", "FAMILY", "BUSINESS", "INVESTMENT", "TRUST", "HUF", "OTHER"])
def test_occupied_group_deactivation_rules(group_type):
    group = make_group(1, group_type=group_type, head_customer_id=7)
    member = make_group_member(1, 1, make_customer(7), is_group_head=True)
    db = FakeDB(employees=[make_advisor()], groups=[group], members=[member])
    if group_type in {"HOUSEHOLD", "FAMILY"}:
        with pytest.raises(HTTPException) as error:
            groups_router.deactivate_group(1, db, SimpleNamespace(party_id=42))
        assert error.value.status_code == 409
        assert group.is_active is True
        assert member.left_on is None
    else:
        groups_router.deactivate_group(1, db, SimpleNamespace(party_id=42))
        assert group.is_active is False
        assert group.head_customer_id is None
        assert member.left_on == date.today()
        assert member.is_group_head is member.is_primary is False


def test_remove_member_rolls_back_on_commit_failure(monkeypatch):
    group = make_group(1)
    member = make_group_member(1, 1, make_customer(7))
    db = FakeDB(employees=[make_advisor()], groups=[group], members=[member])
    def fail_commit():
        raise RuntimeError("Commit failed")
    monkeypatch.setattr(db, "commit", fail_commit)
    with pytest.raises(RuntimeError, match="Commit failed"):
        groups_router.remove_group_member(1, 7, db, SimpleNamespace(party_id=42))
    assert db.rolled_back is True


@pytest.mark.parametrize("group_type", ["INDIVIDUAL", "INVALID", "", "   "])
def test_new_group_rejects_unsupported_types(group_type):
    with pytest.raises(ValidationError):
        GroupCreate(group_name="Test", group_type=group_type)


@pytest.mark.parametrize("group_type,role", [
    ("HOUSEHOLD", "SELF"), ("FAMILY", "SELF"), ("BUSINESS", "MEMBER"),
    ("INVESTMENT", "MEMBER"), ("TRUST", "MEMBER"), ("HUF", "MEMBER"), ("OTHER", "MEMBER"),
])
def test_initial_head_role_and_normalized_group_type(group_type, role):
    customer = make_customer(7)
    db = FakeDB(employees=[make_advisor()], customers=[customer])
    result = groups_router.create_group(
        GroupCreate(group_name="Test", group_type=f" {group_type.lower()} ", head_customer_id=7),
        db, SimpleNamespace(party_id=42),
    )
    assert result.group_type == group_type
    assert db.members[0].relationship_type == role
    assert db.members[0].is_primary == (group_type in {"HOUSEHOLD", "FAMILY"})


@pytest.mark.parametrize("group_type,role", [
    ("HOUSEHOLD", "DEPENDENT"), ("FAMILY", "SPOUSE"), ("BUSINESS", "DIRECTOR"),
    ("INVESTMENT", "BENEFICIAL_OWNER"), ("TRUST", "TRUSTEE"), ("HUF", "KARTA"), ("OTHER", "MEMBER"),
])
def test_add_member_accepts_roles_for_group_type(group_type, role):
    db = FakeDB(employees=[make_advisor()], groups=[make_group(1, group_type=group_type)],
                customers=[make_customer(7)])
    result = groups_router.add_group_member(
        1, GroupMemberAdd(customer_id=7, relationship_type=f" {role.lower()} "),
        db, SimpleNamespace(party_id=42),
    )
    assert result.relationship_type == role


@pytest.mark.parametrize("group_type,role", [
    ("HOUSEHOLD", "DIRECTOR"), ("BUSINESS", "SPOUSE"), ("TRUST", "KARTA"),
    ("HUF", "TRUSTEE"), ("INVESTMENT", "SON"), ("OTHER", "OWNER"),
])
def test_add_member_rejects_roles_from_other_group_types(group_type, role):
    db = FakeDB(employees=[make_advisor()], groups=[make_group(1, group_type=group_type)],
                customers=[make_customer(7)])
    with pytest.raises(HTTPException) as error:
        groups_router.add_group_member(
            1, GroupMemberAdd(customer_id=7, relationship_type=role),
            db, SimpleNamespace(party_id=42),
        )
    assert error.value.status_code == 400
    assert not db.added
    assert not db.committed


def test_move_rejects_entity_role_before_modifying_memberships():
    db = FakeDB(employees=[make_advisor()], groups=[make_group(1)], customers=[make_customer(7)])
    with pytest.raises(HTTPException) as error:
        groups_router.move_client_to_household(
            1, MoveHouseholdRequest(customer_id=7, relationship_type="DIRECTOR"),
            db, SimpleNamespace(party_id=42),
        )
    assert error.value.status_code == 400
    assert not db.committed
    assert not db.added


def test_group_type_change_is_rejected():
    group = make_group(1)
    db = FakeDB(employees=[make_advisor()], groups=[group])
    with pytest.raises(HTTPException) as error:
        groups_router.update_group(1, GroupUpdate(group_type="BUSINESS"), db, SimpleNamespace(party_id=42))
    assert error.value.status_code == 400
    assert group.group_type == "HOUSEHOLD"
    assert not db.committed


def test_deactivate_group_sets_inactive():
    employee = make_advisor(id=21, party_id=42, organization_id=10, branch_id=7)
    group = make_group(group_id=10, is_active=True)
    db = FakeDB(employees=[employee], groups=[group])

    result = groups_router.deactivate_group(
        group_id=10,
        db=db,
        advisor=SimpleNamespace(id=77, party_id=42),
    )

    assert result.group.is_active is False
    assert db.groups[0].is_active is False


def test_group_lifecycle_scenario_matches_user_flow():
    employee = make_advisor(id=30, party_id=42, organization_id=10, branch_id=8)
    head_customer = make_customer(41, "Nani", "S")
    member_customer = make_customer(42, "Ravi", "K")
    new_customer = make_customer(43, "Priya", "M")

    group = make_group(
        group_id=20,
        group_name="Nani S Household",
        head_customer_id=head_customer.id,
        is_active=True,
    )
    head_member = make_group_member(
        101,
        20,
        customer=head_customer,
        is_group_head=True,
        is_primary=True,
    )
    second_member = make_group_member(
        102,
        20,
        customer=member_customer,
        is_group_head=False,
        is_primary=False,
    )

    db = FakeDB(
        employees=[employee],
        groups=[group],
        customers=[head_customer, member_customer, new_customer],
        members=[head_member, second_member],
    )

    listed = groups_router.list_groups(
        db=db,
        advisor=SimpleNamespace(id=77, party_id=42),
        group_type=None,
        search=None,
        include_inactive=False,
    )
    assert listed.total == 1
    assert listed.groups[0].group_name == "Nani S Household"

    open_group = groups_router.get_group(
        group_id=20,
        db=db,
        advisor=SimpleNamespace(id=77, party_id=42),
    )
    assert open_group.group_name == "Nani S Household"
    assert open_group.head_customer_name == "Nani S"

    members = groups_router.list_group_members(
        group_id=20,
        db=db,
        advisor=SimpleNamespace(id=77, party_id=42),
    )
    assert any(m.display_name == "Nani S" for m in members.members)
    assert any(m.is_group_head for m in members.members)
    assert any(m.is_primary for m in members.members)

    added = groups_router.add_group_member(
        group_id=20,
        member_data=GroupMemberAdd(
            customer_id=new_customer.id,
            relationship_type="SON",
            is_group_head=False,
        ),
        db=db,
        advisor=SimpleNamespace(id=77, party_id=42),
    )
    assert added.customer_id == new_customer.id
    assert added.is_primary is True

    groups_router.set_group_head(
        group_id=20,
        body=GroupHeadUpdate(customer_id=new_customer.id),
        db=db,
        advisor=SimpleNamespace(id=77, party_id=42),
    )

    remove_result = groups_router.remove_group_member(
        group_id=20,
        customer_id=member_customer.id,
        db=db,
        advisor=SimpleNamespace(id=77, party_id=42),
    )
    assert remove_result["customer_id"] == member_customer.id

    updated = groups_router.update_group(
        group_id=20,
        group_data=GroupUpdate(group_name="Nani S Household Updated"),
        db=db,
        advisor=SimpleNamespace(id=77, party_id=42),
    )
    assert updated.group_name == "Nani S Household Updated"

    with pytest.raises(HTTPException) as error:
        groups_router.deactivate_group(
            group_id=20, db=db,
            advisor=SimpleNamespace(id=77, party_id=42),
        )
    assert error.value.status_code == 409
    assert group.is_active is True
