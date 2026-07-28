from app.services.onboarding_service import build_branch_code, build_customer_code, build_organization_code


def test_build_organization_code_uses_slugged_value():
    assert build_organization_code("FinPlan Advisors") == "FINPLAN-ADVISORS"


def test_build_branch_code_uses_slugged_value():
    assert build_branch_code("Mumbai Branch") == "MUMBAI-BRANCH"


def test_build_customer_code_includes_org_and_party_ids():
    assert build_customer_code(12, 3) == "CUST-0003-0012"
