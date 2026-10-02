from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from app.routers.client_portal_access import status
from app.services.access import AccessContext


def query_returning(row):
    query = Mock()
    query.filter.return_value = query
    query.join.return_value = query
    query.first.return_value = row
    return query


@pytest.mark.parametrize("account_status, expected_enabled", [
    ("ACTIVE", True), ("DISABLED", False),
])
def test_portal_status_counts_only_active_client_role_in_current_organization(
        account_status, expected_enabled):
    context = AccessContext(
        user_id=1, party_id=2, organization_id=7, actor_type="HEAD",
        employee_id=3, roles=frozenset({"ORG_ADMIN"}),
        permissions=frozenset({"ORG.INVITATION.READ"}),
        denied_permissions=frozenset(),
    )
    customer_query = query_returning(SimpleNamespace(id=10, organization_id=7, party_id=20))
    user_query = query_returning(SimpleNamespace(id=30, party_id=20, is_active=True,
                                                 account_status=account_status))
    role_query = query_returning(SimpleNamespace(id=40))
    invitation_query = query_returning(None)
    db = Mock()
    db.query.side_effect = [customer_query, user_query, role_query, invitation_query]

    result = status(10, context, context, db)

    assert result["enabled"] is expected_enabled
    predicates = " ".join(str(value.compile(compile_kwargs={"literal_binds": True}))
                          for call in role_query.filter.call_args_list for value in call.args)
    assert "roles.is_active IS true" in predicates
    assert "roles.organization_id IS NULL" in predicates
    assert "roles.organization_id = 7" in predicates
