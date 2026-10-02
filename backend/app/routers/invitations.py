import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.crm.customer import Customer
from ..models.foundation.party import Party
from ..models.identity.auth import AuthenticationMethod, PasswordHistory, User
from ..models.identity.authorization import (EmployeePermissionOverride,
    EmployeePermissionProfile, Permission, PermissionProfile,
    ProfilePermission, Role, RolePermissionProfile, UserRole)
from ..models.identity.invitation import AccessInvitation
from ..models.identity.security import AuditLog
from ..models.organization.employee import Employee, EmployeeRole
from ..schemas.invitation import (ClientInvitationCreate, InvitationAccept,
    InvitationAcceptResponse, InvitationCreate, InvitationPreview, InvitationResponse)
from ..services.access import AccessContext, require_head, require_permission
from ..services.auth_service import get_password_hash
from ..services.permission_catalog import attach_default_profile, ensure_permission_catalog
from ..services.idempotency import reserve_create, finish_create

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
        Employee.organization_id == org, Employee.is_active.is_(True),
        Employee.employment_status == "ACTIVE", Employee.deleted_at.is_(None)).first()
    if not row: raise HTTPException(404, "Employee not found")
    return row


def scoped_customer(db, customer_id, org):
    row = db.query(Customer).filter(Customer.id == customer_id,
        Customer.organization_id == org, Customer.is_active.is_(True),
        Customer.customer_status == "ACTIVE", Customer.deleted_at.is_(None)).first()
    if not row: raise HTTPException(404, "Customer not found")
    return row


def linked_party(db, party_id, label):
    row = db.query(Party).filter(Party.id == party_id, Party.deleted_at.is_(None)).first()
    if not row:
        raise HTTPException(409, f"{label} Party record is missing")
    return row


def permission_deps():
    return [Depends(require_head), Depends(require_permission("ORG.INVITATION.MANAGE"))]


def require_current_inviter_authority(db: Session, invitation: AccessInvitation) -> None:
    """A pending invitation cannot outlive its inviter's Head permission."""
    timestamp = now()
    identity = db.query(UserRole.role_id, Employee.id).join(
        User, User.id == UserRole.user_id,
    ).join(Employee, Employee.party_id == User.party_id).join(
        Role, Role.id == UserRole.role_id,
    ).filter(
        User.id == invitation.invited_by_user_id,
        User.is_active.is_(True), User.account_status == "ACTIVE", User.deleted_at.is_(None),
        Employee.organization_id == invitation.organization_id,
        Employee.is_active.is_(True), Employee.employment_status == "ACTIVE",
        Employee.deleted_at.is_(None),
        Role.role_code == "ORG_ADMIN", Role.is_active.is_(True),
        or_(Role.organization_id.is_(None), Role.organization_id == invitation.organization_id),
        UserRole.effective_from <= timestamp,
        or_(UserRole.effective_to.is_(None), UserRole.effective_to > timestamp),
    ).first()
    if identity is None:
        raise HTTPException(410, "Invitation inviter no longer has authority")
    role_id, employee_id = identity
    role_grants = db.query(ProfilePermission.allow_access).join(
        RolePermissionProfile, RolePermissionProfile.profile_id == ProfilePermission.profile_id,
    ).join(PermissionProfile, PermissionProfile.id == ProfilePermission.profile_id).join(
        Permission, Permission.id == ProfilePermission.permission_id,
    ).filter(
        RolePermissionProfile.role_id == role_id,
        Permission.permission_code == "ORG.INVITATION.MANAGE", Permission.is_active.is_(True),
        PermissionProfile.is_active.is_(True),
        or_(PermissionProfile.organization_id.is_(None), PermissionProfile.organization_id == invitation.organization_id),
    ).all()
    employee_grants = db.query(ProfilePermission.allow_access).join(
        EmployeePermissionProfile, EmployeePermissionProfile.profile_id == ProfilePermission.profile_id,
    ).join(PermissionProfile, PermissionProfile.id == ProfilePermission.profile_id).join(
        Permission, Permission.id == ProfilePermission.permission_id,
    ).filter(
        EmployeePermissionProfile.employee_id == employee_id,
        EmployeePermissionProfile.organization_id == invitation.organization_id,
        EmployeePermissionProfile.effective_from <= timestamp,
        or_(EmployeePermissionProfile.effective_to.is_(None), EmployeePermissionProfile.effective_to > timestamp),
        Permission.permission_code == "ORG.INVITATION.MANAGE", Permission.is_active.is_(True),
        PermissionProfile.is_active.is_(True),
        or_(PermissionProfile.organization_id.is_(None), PermissionProfile.organization_id == invitation.organization_id),
    ).all()
    overrides = db.query(EmployeePermissionOverride.allow_access).join(
        Permission, Permission.id == EmployeePermissionOverride.permission_id,
    ).filter(
        EmployeePermissionOverride.employee_id == employee_id,
        EmployeePermissionOverride.organization_id == invitation.organization_id,
        EmployeePermissionOverride.effective_from <= timestamp,
        or_(EmployeePermissionOverride.effective_to.is_(None), EmployeePermissionOverride.effective_to > timestamp),
        Permission.permission_code == "ORG.INVITATION.MANAGE", Permission.is_active.is_(True),
    ).all()
    decisions = [allow for (allow,) in role_grants + employee_grants + overrides]
    if not decisions or not all(decisions):
        raise HTTPException(410, "Invitation inviter no longer has authority")


@router.get("/admin/invitations", response_model=list[InvitationResponse],
    dependencies=[Depends(require_head), Depends(require_permission("ORG.INVITATION.READ"))])
def list_invitations(context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    rows = db.query(AccessInvitation).filter(
        AccessInvitation.organization_id == context.organization_id,
    ).order_by(AccessInvitation.created_at.desc()).all()
    return [response(row) for row in rows]


def issue_for_party(*, db, context, party, invitation_type, target_role,
                    employee_id=None, customer_id=None, expires_in_hours=72, reservation=None):
    email = (party.email or "").strip().lower()
    if employee_id:
        employee = scoped_employee(db, employee_id, context.organization_id)
        email = (employee.official_email or email).strip().lower()
    if not email:
        raise HTTPException(422, "An email address is required before access can be invited")
    pending = db.query(AccessInvitation).filter(
        AccessInvitation.organization_id == context.organization_id,
        AccessInvitation.invitation_type == invitation_type,
        AccessInvitation.accepted_at.is_(None), AccessInvitation.revoked_at.is_(None))
    pending = pending.filter(AccessInvitation.employee_id == employee_id) if employee_id else pending.filter(AccessInvitation.customer_id == customer_id)
    timestamp = now()
    for old in pending.with_for_update().all():
        old.revoked_at = timestamp
        db.add(AuditLog(organization_id=context.organization_id, user_id=context.user_id,
            module_name="AUTHORIZATION", table_name="access_invitations", record_id=old.id,
            action="INVITATION_REVOKED", new_values={"reason": "SUPERSEDED"},
            session_id=context.session_id))
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
    finish_create(db, reservation, row.id)
    db.commit(); db.refresh(row)
    return response(row, f"http://localhost:3000/accept-invitation?token={raw}")


def issue(payload, context, db, reservation=None):
    employee = scoped_employee(db, payload.employee_id, context.organization_id)
    party = linked_party(db, employee.party_id, "Employee")
    return issue_for_party(db=db, context=context, party=party,
        employee_id=employee.id, invitation_type="EMPLOYEE_ACCESS", target_role="EMPLOYEE",
        expires_in_hours=payload.expires_in_hours, reservation=reservation)


@router.post("/admin/invitations", response_model=InvitationResponse, status_code=201, dependencies=permission_deps())
def create_invitation(payload: InvitationCreate, context: AccessContext = Depends(require_head), db: Session = Depends(get_db),
                      idempotency_key: str | None = Header(default=None)):
    reservation = reserve_create(db, key=idempotency_key, operation="employee.invite",
        actor_scope=f"org:{context.organization_id}:user:{context.user_id}", payload=payload.model_dump(mode="json"))
    if reservation and reservation.replay:
        raise HTTPException(409, "Invitation already created; create a new invitation to replace it")
    return issue(payload, context, db, reservation=reservation)


@router.post("/admin/client-invitations", response_model=InvitationResponse, status_code=201, dependencies=permission_deps())
def create_client_invitation(payload: ClientInvitationCreate, context: AccessContext = Depends(require_head), db: Session = Depends(get_db),
                             idempotency_key: str | None = Header(default=None)):
    reservation = reserve_create(db, key=idempotency_key, operation="client.invite",
        actor_scope=f"org:{context.organization_id}:user:{context.user_id}", payload=payload.model_dump(mode="json"))
    if reservation and reservation.replay:
        raise HTTPException(409, "Invitation already created; create a new invitation to replace it")
    customer = scoped_customer(db, payload.customer_id, context.organization_id)
    party = linked_party(db, customer.party_id, "Customer")
    return issue_for_party(db=db, context=context, party=party,
        customer_id=customer.id, invitation_type="CLIENT_PORTAL", target_role="CLIENT",
        expires_in_hours=payload.expires_in_hours, reservation=reservation)


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
    if row.revoked_at is None:
        row.revoked_at = now()
        db.add(AuditLog(organization_id=context.organization_id, user_id=context.user_id,
            module_name="AUTHORIZATION", table_name="access_invitations", record_id=row.id,
            action="INVITATION_REVOKED", new_values={"reason": "ADMIN_REVOKED"},
            session_id=context.session_id))
    db.commit(); db.refresh(row)
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
    require_current_inviter_authority(db, row)
    expected_role = {"EMPLOYEE_ACCESS": "EMPLOYEE", "CLIENT_PORTAL": "CLIENT"}.get(row.invitation_type)
    if expected_role is None or row.target_role != expected_role:
        raise HTTPException(410, "Invitation purpose is no longer valid")
    party = linked_party(db, row.party_id, "Invitation")
    employee = scoped_employee(db, row.employee_id, row.organization_id) if row.invitation_type == "EMPLOYEE_ACCESS" else None
    customer = scoped_customer(db, row.customer_id, row.organization_id) if row.invitation_type == "CLIENT_PORTAL" else None
    if not employee and not customer: raise HTTPException(422, "Unsupported invitation type")
    target = employee or customer
    expected_email = (employee.official_email if employee else party.email) or ""
    if target.party_id != party.id or expected_email.strip().lower() != row.email.strip().lower():
        raise HTTPException(410, "Invitation recipient is no longer valid")
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
