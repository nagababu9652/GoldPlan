from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.foundation.party import Party
from ..services import auth_service as auth
from ..services.onboarding_service import create_organization_onboarding

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.post("/organization", status_code=status.HTTP_201_CREATED)
def create_organization_onboarding_endpoint(
    organization_name: str,
    branch_name: str,
    party_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
    party = db.query(Party).filter(Party.id == party_id).first()
    if not party:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Party not found")

    organization, branch, customer = create_organization_onboarding(
        db=db,
        organization_name=organization_name,
        branch_name=branch_name,
        party=party,
        user_id=user_id,
    )

    return {
        "organization_id": organization.id,
        "branch_id": branch.id,
        "customer_id": customer.id,
        "organization_code": organization.organization_code,
        "branch_code": branch.branch_code,
        "customer_code": customer.customer_code,
    }
