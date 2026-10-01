"""Live authorization foundation. No permissions are taken from JWT role claims."""
from datetime import datetime, timezone
from uuid import UUID

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.crm.customer import Customer, CustomerGroup, GroupMember
from ..models.foundation.party import Party
from ..models.identity.auth import User, UserSession
from ..models.identity.authorization import (
    EmployeePermissionOverride, EmployeePermissionProfile, Permission,
    PermissionProfile, ProfilePermission, RolePermissionProfile,
)
from ..models.organization.core import Organization
from ..models.organization.employee import Employee
from ..models.organization.assignment import EmployeeAssignment
from ..models.organization.subscription import OrganizationSubscription
from . import auth_service as auth
from .subscription_service import subscription_access_active

oauth2 = OAuth2PasswordBearer(tokenUrl="/auth/swagger-login")


class AccessContext(BaseModel):
    model_config = ConfigDict(frozen=True)
    user_id: int
    session_id: int | None = None
    party_id: int
    organization_id: int
    actor_type: str
    employee_id: int | None = None
    customer_id: int | None = None
    roles: frozenset[str]
    permissions: frozenset[str]
    denied_permissions: frozenset[str]
    customer_ids: frozenset[int] = frozenset()
    subscription_status: str = "NONE"
    subscription_active: bool = False
    subscription_period_end: datetime | None = None
    subscription_grace_ends_at: datetime | None = None
    entitlements: frozenset[str] = frozenset()
    limits: dict[str, int] = Field(default_factory=dict)

    def check_permission(self, code: str) -> None:
        if code in self.denied_permissions or code not in self.permissions:
            raise HTTPException(403, "Permission required: " + code)

    def check_customer(self, customer_id: int, organization_id: int) -> None:
        if organization_id != self.organization_id:
            raise HTTPException(404, "Customer not found")
        if self.actor_type == "HEAD":
            return
        if self.actor_type == "CLIENT" and customer_id == self.customer_id:
            return
        if self.actor_type == "EMPLOYEE" and customer_id in self.customer_ids:
            return
        raise HTTPException(404, "Customer not found")

    def check_entitlement(self, code: str) -> None:
        if code not in self.entitlements:
            raise HTTPException(403, "Subscription entitlement required: " + code)

    def check_limit(self, code: str, current_usage: int, requested: int = 1) -> None:
        limit = self.limits.get(code)
        if limit is not None and current_usage + requested > limit:
            raise HTTPException(409, "Subscription limit reached: " + code)


class AuthenticatedIdentity(BaseModel):
    """Authenticated identity used before an organization persona exists."""
    model_config = ConfigDict(frozen=True, arbitrary_types_allowed=True)
    user: User
    session: UserSession


def resolve_authenticated_identity(token: str, db: Session) -> AuthenticatedIdentity:
    payload = auth.decode_token(token)
    if payload is None or payload.type != "access":
        raise HTTPException(401, "Valid access token required")
    try:
        user_id = int(payload.sub)
        session_uuid = UUID(payload.session_uuid)
    except (TypeError, ValueError, AttributeError):
        raise HTTPException(401, "Invalid session identity")
    user = db.query(User).filter(
        User.id == user_id, User.is_active.is_(True),
        User.account_status == "ACTIVE", User.deleted_at.is_(None),
    ).first()
    session = db.query(UserSession).filter(
        UserSession.session_uuid == session_uuid, UserSession.user_id == user_id,
        UserSession.is_active.is_(True), UserSession.logout_time.is_(None),
    ).first()
    if user is None or session is None:
        raise HTTPException(401, "User or session inactive")
    return AuthenticatedIdentity(user=user, session=session)


def get_authenticated_identity(
    token: str = Depends(oauth2), db: Session = Depends(get_db),
) -> AuthenticatedIdentity:
    return resolve_authenticated_identity(token, db)


def utc_naive(value: datetime) -> datetime:
    return value.astimezone(timezone.utc).replace(tzinfo=None) if value.tzinfo else value


def resolve_access_context(token: str, db: Session) -> AccessContext:
    payload = auth.decode_token(token)
    if payload is None or payload.type != "access":
        raise HTTPException(401, "Valid access token required")
    try:
        user_id = int(payload.sub)
        session_uuid = UUID(payload.session_uuid)
    except (TypeError, ValueError, AttributeError):
        raise HTTPException(401, "Invalid session identity")
    user = db.query(User).filter(
        User.id == user_id, User.is_active.is_(True),
        User.account_status == "ACTIVE", User.deleted_at.is_(None),
    ).first()
    session = db.query(UserSession).filter(
        UserSession.session_uuid == session_uuid, UserSession.user_id == user_id,
        UserSession.is_active.is_(True), UserSession.logout_time.is_(None),
    ).first()
    if user is None or session is None:
        raise HTTPException(401, "User or session inactive")
    party = db.query(Party).filter(
        Party.id == user.party_id, Party.is_active.is_(True), Party.deleted_at.is_(None),
    ).first()
    if party is None:
        raise HTTPException(403, "Party inactive")

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    roles = [
        link.role for link in user.roles
        if link.role and link.role.is_active
        and link.effective_from is not None and utc_naive(link.effective_from) <= now
        and (link.effective_to is None or utc_naive(link.effective_to) > now)
    ]
    employees = db.query(Employee).filter(
        Employee.party_id == user.party_id, Employee.is_active.is_(True),
        Employee.deleted_at.is_(None), Employee.employment_status == "ACTIVE",
    ).all()
    customers = db.query(Customer).filter(
        Customer.party_id == user.party_id, Customer.is_active.is_(True),
        Customer.deleted_at.is_(None), Customer.customer_status == "ACTIVE",
    ).all()
    # Only identities with an applicable live persona role participate in resolution.
    employees = [e for e in employees if any(
        r.role_code in {"ORG_ADMIN", "EMPLOYEE", "ADVISOR"}
        and r.organization_id in {None, e.organization_id} for r in roles
    )]
    customers = [c for c in customers if any(
        r.role_code == "CLIENT" and r.organization_id in {None, c.organization_id} for r in roles
    )]
    org_ids = {record.organization_id for record in employees + customers}
    if len(org_ids) != 1 or len(employees) > 1 or len(customers) > 1:
        raise HTTPException(403, "Missing or ambiguous organization identity")
    org_id = next(iter(org_ids))
    organization = db.query(Organization).filter(
        Organization.id == org_id, Organization.is_active.is_(True),
        Organization.deleted_at.is_(None),
    ).first()
    if organization is None:
        raise HTTPException(403, "Organization inactive")
    subscription = db.query(OrganizationSubscription).filter(
        OrganizationSubscription.organization_id == org_id,
        OrganizationSubscription.ended_at.is_(None),
        OrganizationSubscription.deleted_at.is_(None),
    ).first()
    subscription_active = subscription_access_active(subscription, now)
    snapshot = subscription.entitlement_snapshot if subscription_active else {}
    entitlements = frozenset(snapshot.get("features", [])) if isinstance(snapshot, dict) else frozenset()
    raw_limits = snapshot.get("limits", {}) if isinstance(snapshot, dict) else {}
    limits = {
        str(code): int(value) for code, value in raw_limits.items()
        if isinstance(value, (int, float)) and value >= 0
    }
    roles = [r for r in roles if r.organization_id in {None, org_id}]
    codes = frozenset(r.role_code for r in roles)
    employee = employees[0] if employees else None
    customer = customers[0] if customers else None
    actor = "HEAD" if employee and "ORG_ADMIN" in codes else "EMPLOYEE" if employee else "CLIENT"
    # Client grants never flow into staff permissions (or vice versa).
    role_ids = [r.id for r in roles if (r.role_code == "CLIENT") == (actor == "CLIENT")]
    grants = db.query(Permission.permission_code, ProfilePermission.allow_access).join(
        ProfilePermission, ProfilePermission.permission_id == Permission.id,
    ).join(PermissionProfile, PermissionProfile.id == ProfilePermission.profile_id).join(
        RolePermissionProfile, RolePermissionProfile.profile_id == PermissionProfile.id,
    ).filter(
        RolePermissionProfile.role_id.in_(role_ids), Permission.is_active.is_(True),
        PermissionProfile.is_active.is_(True),
        or_(PermissionProfile.organization_id.is_(None), PermissionProfile.organization_id == org_id),
    ).all()
    allowed = {code for code, allow in grants if allow}
    denied = {code for code, allow in grants if not allow}
    if employee:
        employee_grants = db.query(Permission.permission_code, ProfilePermission.allow_access).join(
            ProfilePermission, ProfilePermission.permission_id == Permission.id,
        ).join(PermissionProfile, PermissionProfile.id == ProfilePermission.profile_id).join(
            EmployeePermissionProfile, EmployeePermissionProfile.profile_id == PermissionProfile.id,
        ).filter(
            EmployeePermissionProfile.employee_id == employee.id,
            EmployeePermissionProfile.organization_id == org_id,
            EmployeePermissionProfile.effective_from <= now,
            or_(EmployeePermissionProfile.effective_to.is_(None), EmployeePermissionProfile.effective_to > now),
            Permission.is_active.is_(True), PermissionProfile.is_active.is_(True),
            or_(PermissionProfile.organization_id.is_(None), PermissionProfile.organization_id == org_id),
        ).all()
        overrides = db.query(Permission.permission_code, EmployeePermissionOverride.allow_access).join(
            EmployeePermissionOverride, EmployeePermissionOverride.permission_id == Permission.id,
        ).filter(
            EmployeePermissionOverride.employee_id == employee.id,
            EmployeePermissionOverride.organization_id == org_id,
            EmployeePermissionOverride.effective_from <= now,
            or_(EmployeePermissionOverride.effective_to.is_(None), EmployeePermissionOverride.effective_to > now),
            Permission.is_active.is_(True),
        ).all()
        allowed.update(code for code, allow in employee_grants if allow)
        denied.update(code for code, allow in employee_grants if not allow)
        allowed.update(code for code, allow in overrides if allow)
        denied.update(code for code, allow in overrides if not allow)
    assigned = []
    if employee:
        assigned = db.query(Customer.id).outerjoin(
            GroupMember, and_(GroupMember.customer_id == Customer.id, GroupMember.left_on.is_(None)),
        ).outerjoin(
            CustomerGroup, CustomerGroup.id == GroupMember.customer_group_id,
        ).join(
            EmployeeAssignment, or_(
                and_(EmployeeAssignment.entity_type == "CUSTOMER", EmployeeAssignment.entity_id == Customer.id),
                and_(EmployeeAssignment.entity_type == "CUSTOMER_GROUP", EmployeeAssignment.entity_id == CustomerGroup.id),
                and_(EmployeeAssignment.entity_type == "BRANCH", EmployeeAssignment.entity_id == CustomerGroup.primary_branch_id),
            ),
        ).filter(
            EmployeeAssignment.employee_id == employee.id,
            EmployeeAssignment.assignment_type == "ADVISOR",
            EmployeeAssignment.is_active.is_(True), EmployeeAssignment.deleted_at.is_(None),
            EmployeeAssignment.effective_from <= now.date(),
            or_(EmployeeAssignment.effective_to.is_(None), EmployeeAssignment.effective_to >= now.date()),
            Customer.organization_id == org_id, Customer.is_active.is_(True),
            Customer.deleted_at.is_(None), Customer.customer_status == "ACTIVE",
        ).all()
    return AccessContext(
        user_id=user.id, session_id=session.id, party_id=user.party_id, organization_id=org_id,
        actor_type=actor, employee_id=employee.id if employee else None,
        customer_id=customer.id if customer else None, roles=codes,
        permissions=frozenset(allowed - denied), denied_permissions=frozenset(denied),
        customer_ids=frozenset(row[0] for row in assigned),
        subscription_status=subscription.status if subscription else "NONE",
        subscription_active=subscription_active,
        subscription_period_end=subscription.current_period_end if subscription else None,
        subscription_grace_ends_at=subscription.grace_ends_at if subscription else None,
        entitlements=entitlements, limits=limits,
    )


def get_access_context(token: str = Depends(oauth2), db: Session = Depends(get_db)) -> AccessContext:
    return resolve_access_context(token, db)


def require_permission(code: str):
    def dependency(context: AccessContext = Depends(get_access_context)) -> AccessContext:
        context.check_permission(code)
        return context
    return dependency


def require_entitlement(code: str):
    def dependency(context: AccessContext = Depends(get_access_context)) -> AccessContext:
        context.check_entitlement(code)
        return context
    return dependency


def require_active_subscription(
    context: AccessContext = Depends(get_access_context),
) -> AccessContext:
    if not context.subscription_active:
        raise HTTPException(403, "An active organization subscription is required")
    return context


def require_subscription_entitlement(code: str):
    def dependency(context: AccessContext = Depends(require_active_subscription)) -> AccessContext:
        context.check_entitlement(code)
        return context
    return dependency


def require_head(context: AccessContext = Depends(get_access_context)) -> AccessContext:
    if context.actor_type != "HEAD":
        raise HTTPException(403, "Head access required")
    return context


def require_employee(context: AccessContext = Depends(get_access_context)) -> AccessContext:
    if context.actor_type not in {"HEAD", "EMPLOYEE"}:
        raise HTTPException(403, "Staff access required")
    return context


def require_client(context: AccessContext = Depends(get_access_context)) -> AccessContext:
    if context.actor_type != "CLIENT":
        raise HTTPException(403, "Client persona required")
    return context


def require_customer_access(customer_id: int, context: AccessContext = Depends(get_access_context),
                            db: Session = Depends(get_db)) -> AccessContext:
    customer = db.query(Customer).filter(
        Customer.id == customer_id, Customer.is_active.is_(True), Customer.deleted_at.is_(None),
    ).first()
    if customer is None:
        raise HTTPException(404, "Customer not found")
    context.check_customer(customer.id, customer.organization_id)
    return context
