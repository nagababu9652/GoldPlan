from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..schemas.admin_access import LoginAccessResponse
from ..services.access import AccessContext, require_head, require_permission
from ..services.access_lifecycle import set_employee_login_access

router = APIRouter(prefix="/admin/employees", tags=["admin-employee-access"])


def change_login_access(
    employee_id: int, enabled: bool, context: AccessContext, db: Session,
) -> LoginAccessResponse:
    try:
        user, revoked = set_employee_login_access(
            db, employee_id=employee_id, enabled=enabled, actor=context,
        )
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise
    return LoginAccessResponse(
        employee_id=employee_id,
        user_id=user.id,
        account_status=user.account_status,
        is_active=user.is_active,
        revoked_sessions=revoked,
    )


@router.post("/{employee_id}/disable-login", response_model=LoginAccessResponse)
def disable_employee_login(
    employee_id: int,
    context: AccessContext = Depends(require_head),
    _permission: AccessContext = Depends(require_permission("ORG.EMPLOYEE.ACCESS_MANAGE")),
    db: Session = Depends(get_db),
):
    return change_login_access(employee_id, False, context, db)


@router.post("/{employee_id}/enable-login", response_model=LoginAccessResponse)
def enable_employee_login(
    employee_id: int,
    context: AccessContext = Depends(require_head),
    _permission: AccessContext = Depends(require_permission("ORG.EMPLOYEE.ACCESS_MANAGE")),
    db: Session = Depends(get_db),
):
    return change_login_access(employee_id, True, context, db)
