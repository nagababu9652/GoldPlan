"""Transactional login-access lifecycle and last-Head protection."""
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..models.identity.auth import RefreshToken, User, UserSession
from ..models.identity.authorization import Role, UserRole
from ..models.identity.security import AuditLog
from ..models.organization.employee import Employee
from .access import AccessContext, utc_naive


def now_utc_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def employee_user_for_update(
    db: Session, employee_id: int, organization_id: int,
) -> tuple[Employee, User]:
    employee = db.query(Employee).filter(
        Employee.id == employee_id,
        Employee.organization_id == organization_id,
        Employee.is_active.is_(True),
        Employee.employment_status == "ACTIVE",
        Employee.deleted_at.is_(None),
    ).with_for_update().first()
    if employee is None:
        raise HTTPException(404, "Employee not found")
    user = db.query(User).filter(
        User.party_id == employee.party_id,
        User.deleted_at.is_(None),
    ).with_for_update().first()
    if user is None:
        raise HTTPException(404, "Employee login account not found")
    return employee, user


def protect_last_active_head(db: Session, target_user_id: int, organization_id: int) -> None:
    """Lock effective Head grants and reject removal of the final active Head."""
    now = now_utc_naive()
    rows = db.query(UserRole, User.id).join(
        Role, Role.id == UserRole.role_id,
    ).join(
        User, User.id == UserRole.user_id,
    ).join(
        Employee, Employee.party_id == User.party_id,
    ).filter(
        Role.role_code == "ORG_ADMIN",
        Role.is_active.is_(True),
        or_(Role.organization_id.is_(None), Role.organization_id == organization_id),
        UserRole.effective_from <= now,
        or_(UserRole.effective_to.is_(None), UserRole.effective_to > now),
        User.is_active.is_(True), User.account_status == "ACTIVE", User.deleted_at.is_(None),
        Employee.organization_id == organization_id,
        Employee.is_active.is_(True), Employee.deleted_at.is_(None),
        Employee.employment_status == "ACTIVE",
    ).with_for_update(of=UserRole).all()
    active_head_ids = {user_id for _, user_id in rows}
    if target_user_id in active_head_ids and len(active_head_ids) <= 1:
        raise HTTPException(409, "Cannot disable the last active Head")


def revoke_user_sessions(db: Session, user_id: int) -> int:
    now = now_utc_naive()
    sessions = db.query(UserSession).filter(
        UserSession.user_id == user_id,
        UserSession.is_active.is_(True),
        UserSession.logout_time.is_(None),
    ).with_for_update().all()
    session_ids = []
    for session in sessions:
        session.is_active = False
        session.logout_time = now
        session_ids.append(session.id)
    if session_ids:
        db.query(RefreshToken).filter(
            RefreshToken.session_id.in_(session_ids),
            RefreshToken.revoked_at.is_(None),
        ).update({"revoked_at": now}, synchronize_session=False)
    return len(sessions)


def set_employee_login_access(
    db: Session, *, employee_id: int, enabled: bool, actor: AccessContext,
) -> tuple[User, int]:
    employee, user = employee_user_for_update(db, employee_id, actor.organization_id)
    old_status = user.account_status
    old_is_active = user.is_active
    revoked_sessions = 0
    if not enabled:
        protect_last_active_head(db, user.id, actor.organization_id)
        user.account_status = "DISABLED"
        user.is_active = False
        user.updated_by = actor.user_id
        revoked_sessions = revoke_user_sessions(db, user.id)
        action = "LOGIN_DISABLED"
    else:
        user.account_status = "ACTIVE"
        user.is_active = True
        user.updated_by = actor.user_id
        action = "LOGIN_ENABLED"

    db.add(AuditLog(
        organization_id=actor.organization_id,
        user_id=actor.user_id,
        module_name="EMPLOYEE_ACCESS",
        table_name="users",
        record_id=user.id,
        action=action,
        old_values={"account_status": old_status, "is_active": old_is_active},
        new_values={
            "account_status": user.account_status,
            "is_active": user.is_active,
            "employee_id": employee.id,
            "revoked_sessions": revoked_sessions,
        },
        session_id=actor.session_id,
    ))
    return user, revoked_sessions
