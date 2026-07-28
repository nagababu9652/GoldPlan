from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from ..models.crm.customer import Customer
from ..models.foundation.party import Party
from ..models.organization.core import Branch, Organization


def build_organization_code(name: str) -> str:
    cleaned = "".join(ch for ch in name.upper() if ch.isalnum() or ch in {"-", "_", " "})
    parts = [part for part in cleaned.replace("_", " ").split() if part]
    return "-".join(parts).upper() or "ORG"


def build_branch_code(name: str) -> str:
    cleaned = "".join(ch for ch in name.upper() if ch.isalnum() or ch in {"-", "_", " "})
    parts = [part for part in cleaned.replace("_", " ").split() if part]
    return "-".join(parts).upper() or "BRANCH"


def build_customer_code(organization_id: int, party_id: int) -> str:
    return f"CUST-{party_id:04d}-{organization_id:04d}"


def create_organization_onboarding(db: Session, organization_name: str, branch_name: str, party: Party, user_id: int) -> tuple[Organization, Branch, Customer]:
    organization = Organization(
        organization_code=build_organization_code(organization_name),
        legal_name=organization_name,
        trade_name=organization_name,
        email=party.email,
        phone=party.mobile_number,
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(organization)
    db.flush()

    branch = Branch(
        organization_id=organization.id,
        branch_code=build_branch_code(branch_name),
        branch_name=branch_name,
        branch_type="MAIN",
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(branch)
    db.flush()

    customer = Customer(
        organization_id=organization.id,
        party_id=party.id,
        customer_code=build_customer_code(organization.id, party.id),
        onboarding_date=datetime.utcnow().date(),
        customer_status="ACTIVE",
        created_by=user_id,
        updated_by=user_id,
    )
    db.add(customer)
    db.flush()

    return organization, branch, customer
