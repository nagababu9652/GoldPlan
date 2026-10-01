from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.foundation.party import Party
from ..models.organization.employee import Employee
from ..schemas.organization import OrganizationBootstrap, OrganizationBootstrapResponse
from ..services.access import AuthenticatedIdentity, get_authenticated_identity
from ..services.onboarding_service import bootstrap_head_organization

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.post(
    "/organization",
    response_model=OrganizationBootstrapResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_organization_onboarding_endpoint(
    payload: OrganizationBootstrap,
    identity: AuthenticatedIdentity = Depends(get_authenticated_identity),
    db: Session = Depends(get_db),
):
    """Create an organization and its first Head from the authenticated identity."""
    user = identity.user
    if not user.email_verified:
        raise HTTPException(status_code=403, detail="Verified email required")
    party = db.query(Party).filter(
        Party.id == user.party_id,
        Party.is_active.is_(True),
        Party.deleted_at.is_(None),
    ).with_for_update().first()
    if not party:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Party not found")
    if party.organization_id is not None or db.query(Employee.id).filter(
        Employee.party_id == party.id,
    ).first():
        raise HTTPException(status_code=409, detail="Organization bootstrap already completed")
    try:
        organization, branch, employee, role = bootstrap_head_organization(
            db,
            organization_name=payload.organization_name,
            branch_name=payload.branch_name,
            party=party,
            user_id=user.id,
            session_id=identity.session.id,
        )
        db.commit()
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail=str(exc))
    except Exception:
        db.rollback()
        raise
    return OrganizationBootstrapResponse(
        organization_id=organization.id,
        branch_id=branch.id,
        employee_id=employee.id,
        role=role.role_code,
        organization_code=organization.organization_code,
        branch_code=branch.branch_code,
    )
