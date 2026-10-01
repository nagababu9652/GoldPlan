from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.crm.customer import Customer
from ..models.foundation.party import Party
from ..models.identity.auth import User
from ..models.identity.authorization import Role, UserRole
from ..models.identity.invitation import AccessInvitation
from ..services.access import AccessContext, require_head, require_permission

router = APIRouter(prefix="/admin/client-access", tags=["admin-client-access"])


@router.get("", dependencies=[Depends(require_head), Depends(require_permission("ORG.INVITATION.READ"))])
def list_client_access(search: str | None = None, status: str | None = None,
        context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    query = db.query(Customer, Party).join(Party, Party.id == Customer.party_id).filter(
        Customer.organization_id == context.organization_id,
        Customer.deleted_at.is_(None), Party.deleted_at.is_(None))
    if search:
        value = f"%{search.strip()}%"
        query = query.filter(or_(Customer.customer_code.ilike(value), Party.display_name.ilike(value),
            Party.email.ilike(value), Party.mobile_number.ilike(value)))
    if status:
        query = query.filter(Customer.customer_status == status.strip().upper())
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    result = []
    for customer, party in query.order_by(Party.display_name).all():
        user = db.query(User).filter(User.party_id == party.id, User.deleted_at.is_(None)).first()
        enabled = False
        if user:
            enabled = db.query(UserRole).join(Role, Role.id == UserRole.role_id).filter(
                UserRole.user_id == user.id, Role.role_code == "CLIENT",
                UserRole.effective_from <= now,
                or_(UserRole.effective_to.is_(None), UserRole.effective_to > now)).first() is not None
        pending = db.query(AccessInvitation.id).filter(
            AccessInvitation.customer_id == customer.id,
            AccessInvitation.invitation_type == "CLIENT_PORTAL",
            AccessInvitation.accepted_at.is_(None), AccessInvitation.revoked_at.is_(None),
            AccessInvitation.expires_at > now).first() is not None
        result.append({"customer_id": customer.id, "customer_code": customer.customer_code,
            "display_name": party.display_name, "email": party.email,
            "mobile_number": party.mobile_number, "customer_status": customer.customer_status,
            "has_account": user is not None, "enabled": enabled and bool(user and user.is_active),
            "account_status": user.account_status if user else "NOT_INVITED",
            "pending_invitation": pending})
    return result
