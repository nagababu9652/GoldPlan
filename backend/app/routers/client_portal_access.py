from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.crm.customer import Customer
from ..models.identity.auth import User
from ..models.identity.authorization import Role, UserRole
from ..models.identity.invitation import AccessInvitation
from ..services.access import AccessContext, require_employee, require_permission, utc_naive
from ..services.access_lifecycle import now_utc_naive, set_client_portal_access

router = APIRouter(prefix="/admin/clients/{customer_id}/portal-access", tags=["client-portal-access"])


def scoped_customer(customer_id: int, context: AccessContext, db: Session):
    row = db.query(Customer).filter(Customer.id == customer_id,
        Customer.organization_id == context.organization_id,
        Customer.deleted_at.is_(None)).first()
    if not row: raise HTTPException(404, "Customer not found")
    context.check_customer(row.id, row.organization_id)
    return row


@router.get("")
def status(customer_id: int, context: AccessContext = Depends(require_employee),
        _permission: AccessContext = Depends(require_permission("ORG.INVITATION.READ")),
        db: Session = Depends(get_db)):
    customer = scoped_customer(customer_id, context, db)
    user = db.query(User).filter(User.party_id == customer.party_id, User.deleted_at.is_(None)).first()
    enabled = False
    if user:
        now = now_utc_naive()
        enabled = db.query(UserRole).join(Role, Role.id == UserRole.role_id).filter(
            UserRole.user_id == user.id, Role.role_code == "CLIENT",
            UserRole.effective_from <= now,
            or_(UserRole.effective_to.is_(None), UserRole.effective_to > now)).first() is not None
    pending = db.query(AccessInvitation).filter(AccessInvitation.customer_id == customer.id,
        AccessInvitation.invitation_type == "CLIENT_PORTAL",
        AccessInvitation.accepted_at.is_(None), AccessInvitation.revoked_at.is_(None),
        AccessInvitation.expires_at > now_utc_naive()).first()
    return {"customer_id": customer.id, "user_id": user.id if user else None,
        "has_account": user is not None, "enabled": enabled and bool(user and user.is_active),
        "account_status": user.account_status if user else "NOT_INVITED",
        "pending_invitation": pending is not None}


@router.post("/enable")
def enable(customer_id: int, context: AccessContext = Depends(require_employee),
        _permission: AccessContext = Depends(require_permission("ORG.INVITATION.MANAGE")),
        db: Session = Depends(get_db)):
    scoped_customer(customer_id, context, db)
    try:
        user, revoked = set_client_portal_access(db, customer_id=customer_id, enabled=True, actor=context)
        db.commit()
    except Exception:
        db.rollback(); raise
    return {"customer_id": customer_id, "user_id": user.id, "enabled": True,
        "account_status": user.account_status, "revoked_sessions": revoked}


@router.post("/disable")
def disable(customer_id: int, context: AccessContext = Depends(require_employee),
        _permission: AccessContext = Depends(require_permission("ORG.INVITATION.MANAGE")),
        db: Session = Depends(get_db)):
    customer = scoped_customer(customer_id, context, db)
    user = db.query(User).filter(User.party_id == customer.party_id,
        User.deleted_at.is_(None)).first()
    if user is None:
        timestamp = now_utc_naive()
        pending = db.query(AccessInvitation).filter(
            AccessInvitation.customer_id == customer.id,
            AccessInvitation.invitation_type == "CLIENT_PORTAL",
            AccessInvitation.accepted_at.is_(None), AccessInvitation.revoked_at.is_(None),
        ).with_for_update().all()
        for invitation in pending: invitation.revoked_at = timestamp
        db.commit()
        return {"customer_id": customer_id, "user_id": None, "enabled": False,
            "account_status": "NOT_INVITED", "revoked_sessions": 0}
    try:
        user, revoked = set_client_portal_access(db, customer_id=customer_id, enabled=False, actor=context)
        db.commit()
    except Exception:
        db.rollback(); raise
    return {"customer_id": customer_id, "user_id": user.id, "enabled": False,
        "account_status": user.account_status, "revoked_sessions": revoked}
