import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.crm.customer import Customer
from ..models.foundation.party import Party
from ..models.identity.auth import AuthenticationMethod, PasswordHistory, User
from ..models.identity.authorization import Role, UserRole
from ..models.identity.invitation import AccessInvitation
from ..models.identity.security import AuditLog
from ..models.organization.employee import Employee, EmployeeRole
from ..schemas.invitation import (ClientInvitationCreate, InvitationAccept,
    InvitationAcceptResponse, InvitationCreate, InvitationPreview, InvitationResponse)
from ..services.access import AccessContext, require_head, require_permission
from ..services.auth_service import get_password_hash
from ..services.permission_catalog import attach_default_profile, ensure_permission_catalog

router = APIRouter(tags=["access-invitations"])


def now(): return datetime.now(timezone.utc).replace(tzinfo=None)
def token_hash(value): return hashlib.sha256(value.encode()).hexdigest()
def state(row): return "ACCEPTED" if row.accepted_at else "REVOKED" if row.revoked_at else "EXPIRED" if row.expires_at <= now() else "PENDING"


def response(row, url=None):
    return InvitationResponse(id=row.id, employee_id=row.employee_id,
        customer_id=row.customer_id, invitation_type=row.invitation_type,
        email=row.email, status=state(row), expires_at=row.expires_at,
        created_at=row.created_at, invitation_url=url)


def scoped_employee(db, employee_id, org):
    row = db.query(Employee).filter(Employee.id == employee_id,
        Employee.organization_id == org, Employee.deleted_at.is_(None)).first()
    if not row: raise HTTPException(404, "Employee not found")
    return row


def scoped_customer(db, customer_id, org):
    row = db.query(Customer).filter(Customer.id == customer_id,
        Customer.organization_id == org, Customer.deleted_at.is_(None)).first()
    if not row: raise HTTPException(404, "Customer not found")
    return row


def linked_party(db, party_id, label):
    row = db.query(Party).filter(Party.id == party_id, Party.deleted_at.is_(None)).first()
    if not row:
        raise HTTPException(409, f"{label} Party record is missing")
    return row


def permission_deps():
    return [Depends(require_head), Depends(require_permission("ORG.INVITATION.MANAGE"))]


@router.get("/admin/invitations", response_model=list[InvitationResponse],
    dependencies=[Depends(require_head), Depends(require_permission("ORG.INVITATION.READ"))])
def list_invitations(context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    rows = db.query(AccessInvitation).filter(
        AccessInvitation.organization_id == context.organization_id,
    ).order_by(AccessInvitation.created_at.desc()).all()
    return [response(row) for row in rows]


def issue_for_party(*, db, context, party, invitation_type, target_role,
                    employee_id=None, customer_id=None, expires_in_hours=72):
    email = (party.email or "").strip().lower()
    if employee_id:
        employee = scoped_employee(db, employee_id, context.organization_id)
        email = (employee.official_email or email).strip().lower()
    if not email:
        raise HTTPException(422, "An email address is required before access can be invited")
    pending = db.query(AccessInvitation).filter(
        AccessInvitation.invitation_type == invitation_type,
        AccessInvitation.accepted_at.is_(None), AccessInvitation.revoked_at.is_(None))
    pending = pending.filter(AccessInvitation.employee_id == employee_id) if employee_id else pending.filter(AccessInvitation.customer_id == customer_id)
    timestamp = now()
    for old in pending.with_for_update().all(): old.revoked_at = timestamp
    raw = secrets.token_urlsafe(32)
    row = AccessInvitation(organization_id=context.organization_id, party_id=party.id,
        employee_id=employee_id, customer_id=customer_id,
        invitation_type=invitation_type, target_role=target_role, email=email,
        token_hash=token_hash(raw), expires_at=timestamp + timedelta(hours=expires_in_hours),
        invited_by_user_id=context.user_id)
    db.add(row); db.flush()
    table, record_id = ("employees", employee_id) if employee_id else ("customers", customer_id)
    db.add(AuditLog(organization_id=context.organization_id, user_id=context.user_id,
        module_name="AUTHORIZATION", table_name=table, record_id=record_id,
        action="INVITE_" + target_role, new_values={"invitation_id": row.id, "email": email},
        session_id=context.session_id))
    db.commit(); db.refresh(row)
    return response(row, f"http://localhost:3000/accept-invitation?token={raw}")


def issue(payload, context, db):
    employee = scoped_employee(db, payload.employee_id, context.organization_id)
    party = linked_party(db, employee.party_id, "Employee")
    return issue_for_party(db=db, context=context, party=party,
        employee_id=employee.id, invitation_type="EMPLOYEE_ACCESS", target_role="EMPLOYEE",
        expires_in_hours=payload.expires_in_hours)


@router.post("/admin/invitations", response_model=InvitationResponse, status_code=201, dependencies=permission_deps())
def create_invitation(payload: InvitationCreate, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return issue(payload, context, db)


@router.post("/admin/client-invitations", response_model=InvitationResponse, status_code=201, dependencies=permission_deps())
def create_client_invitation(payload: ClientInvitationCreate, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    customer = scoped_customer(db, payload.customer_id, context.organization_id)
    party = linked_party(db, customer.party_id, "Customer")
    return issue_for_party(db=db, context=context, party=party,
        customer_id=customer.id, invitation_type="CLIENT_PORTAL", target_role="CLIENT",
        expires_in_hours=payload.expires_in_hours)


@router.post("/admin/invitations/{invitation_id}/resend", response_model=InvitationResponse, dependencies=permission_deps())
def resend_invitation(invitation_id: int, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    old = db.query(AccessInvitation).filter(AccessInvitation.id == invitation_id,
        AccessInvitation.organization_id == context.organization_id).first()
    if not old: raise HTTPException(404, "Invitation not found")
    if old.accepted_at: raise HTTPException(409, "Accepted invitation cannot be resent")
    if old.invitation_type == "CLIENT_PORTAL":
        customer = scoped_customer(db, old.customer_id, context.organization_id)
        party = linked_party(db, customer.party_id, "Customer")
        return issue_for_party(db=db, context=context, party=party,
            customer_id=customer.id, invitation_type="CLIENT_PORTAL", target_role="CLIENT")
    return issue(InvitationCreate(employee_id=old.employee_id), context, db)


@router.post("/admin/invitations/{invitation_id}/revoke", response_model=InvitationResponse, dependencies=permission_deps())
def revoke_invitation(invitation_id: int, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    row = db.query(AccessInvitation).filter(AccessInvitation.id == invitation_id,
        AccessInvitation.organization_id == context.organization_id).with_for_update().first()
    if not row: raise HTTPException(404, "Invitation not found")
    if row.accepted_at: raise HTTPException(409, "Accepted invitation cannot be revoked")
    row.revoked_at = now(); db.commit(); db.refresh(row)
    return response(row)


def invitation_by_token(db, raw, lock=False):
    query = db.query(AccessInvitation).filter(AccessInvitation.token_hash == token_hash(raw))
    row = query.with_for_update().first() if lock else query.first()
    if not row or state(row) != "PENDING":
        raise HTTPException(410, "Invitation is invalid or no longer active")
    return row


@router.get("/auth/invitations/preview", response_model=InvitationPreview)
def preview_invitation(token: str, db: Session = Depends(get_db)):
    row = invitation_by_token(db, token)
    party = linked_party(db, row.party_id, "Invitation")
    return InvitationPreview(email=row.email, display_name=party.display_name,
        invitation_type=row.invitation_type, organization_id=row.organization_id,
        expires_at=row.expires_at)


@router.post("/auth/invitations/accept", response_model=InvitationAcceptResponse)
def accept_invitation(payload: InvitationAccept, db: Session = Depends(get_db)):
    row = invitation_by_token(db, payload.token, True)
    party = linked_party(db, row.party_id, "Invitation")
    employee = scoped_employee(db, row.employee_id, row.organization_id) if row.invitation_type == "EMPLOYEE_ACCESS" else None
    customer = scoped_customer(db, row.customer_id, row.organization_id) if row.invitation_type == "CLIENT_PORTAL" else None
    if not employee and not customer: raise HTTPException(422, "Unsupported invitation type")
    user = db.query(User).filter(User.email == row.email).first()
    if user and user.party_id != party.id: raise HTTPException(409, "Email belongs to another identity")
    password_hash = get_password_hash(payload.password)
    if not user:
        user = User(party_id=party.id, username=row.email, email=row.email,
            display_name=party.display_name, email_verified=True,
            account_status="ACTIVE", is_active=True)
        db.add(user); db.flush()
    else:
        user.account_status = "ACTIVE"; user.is_active = True
    method = db.query(AuthenticationMethod).filter(AuthenticationMethod.user_id == user.id,
        AuthenticationMethod.authentication_type == "PASSWORD",
        AuthenticationMethod.is_primary.is_(True)).first()
    if method:
        method.credential_hash = password_hash; method.is_enabled = True
    else:
        db.add(AuthenticationMethod(user_id=user.id, authentication_type="PASSWORD",
            credential_hash=password_hash, password_algorithm="bcrypt",
            is_primary=True, is_enabled=True))
    db.add(PasswordHistory(user_id=user.id, password_hash=password_hash, changed_at=now()))
    role = db.query(Role).filter(Role.role_code == row.target_role, Role.is_active.is_(True),
        (Role.organization_id.is_(None)) | (Role.organization_id == row.organization_id)).first()
    if not role: raise HTTPException(500, f"{row.target_role} role is not configured")
    profiles = ensure_permission_catalog(db, assigned_by=row.invited_by_user_id)
    attach_default_profile(db, role,
        profiles["CLIENT_PORTAL_STANDARD" if customer else "FINANCIAL_ADVISOR_STANDARD"],
        assigned_by=row.invited_by_user_id)
    if not db.query(UserRole).filter(UserRole.user_id == user.id, UserRole.role_id == role.id,
        UserRole.effective_to.is_(None)).first():
        db.add(UserRole(user_id=user.id, role_id=role.id, effective_from=now(),
            assigned_by=row.invited_by_user_id, is_primary=True))
    if employee and not db.query(EmployeeRole).filter(EmployeeRole.employee_id == employee.id,
        EmployeeRole.role_id == role.id, EmployeeRole.effective_to.is_(None)).first():
        db.add(EmployeeRole(employee_id=employee.id, role_id=role.id,
            effective_from=now().date(), assigned_by=row.invited_by_user_id, is_primary=True))
    row.accepted_at = now()
    table, record_id = ("employees", employee.id) if employee else ("customers", customer.id)
    db.add(AuditLog(organization_id=row.organization_id, user_id=user.id,
        module_name="AUTHORIZATION", table_name=table, record_id=record_id,
        action="ACCEPT_INVITATION", new_values={"invitation_id": row.id}))
    db.commit()
    label = "Employee access" if employee else "Client portal access"
    return InvitationAcceptResponse(message=label + " activated", email=row.email)
