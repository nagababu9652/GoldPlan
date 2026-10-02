from datetime import date, datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ...database.session import get_db
from ...models.crm.customer import Customer, CustomerGroup
from ...models.crm.message import Message
from ...models.organization.employee import Employee
from ...models.organization.assignment import EmployeeAssignment
from ...services.access import AccessContext, require_employee as get_current_user, require_permission
from ...services.idempotency import finish_create, reserve_create
from ...schemas.message import (
    MessageCreate,
    MessageListResponse,
    MessageResponse,
    MessageUpdate,
)


router = APIRouter(
    prefix="/messages",
    tags=["Advisor Messages"],
)


def get_advisor_employee(
    db: Session,
    current_user: AccessContext,
) -> Employee:
    employee = (
        db.query(Employee)
        .filter(
            Employee.id == current_user.employee_id,
            Employee.organization_id == current_user.organization_id,
            Employee.is_active.is_(True),
            Employee.employment_status == "ACTIVE",
            Employee.deleted_at.is_(None),
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=403,
            detail="Advisor employee record not found",
        )

    return employee


def build_message_response(
    message: Message,
) -> MessageResponse:
    return MessageResponse(
        id=message.id,
        organization_id=message.organization_id,
        sender_employee_id=message.sender_employee_id,

        message_type=message.message_type,
        subject=message.subject,
        body=message.body,
        status=message.status,

        customer_id=message.customer_id,
        customer_group_id=message.customer_group_id,

        customer_name=(
            message.customer.party.display_name
            if message.customer
            and message.customer.party
            else None
        ),

        group_name=(
            message.customer_group.group_name
            if message.customer_group
            else None
        ),

        sent_at=message.sent_at,
        read_at=message.read_at,

        created_at=message.created_at,
        updated_at=message.updated_at,
    )


def validate_customer_and_group(
    db: Session,
    employee: Employee,
    customer_id: int | None,
    customer_group_id: int | None,
):
    if not customer_id and not customer_group_id:
        raise HTTPException(
            status_code=400,
            detail="Either customer_id or customer_group_id is required",
        )

    if customer_id:
        today = date.today()
        assignment = db.query(EmployeeAssignment).filter(
            EmployeeAssignment.employee_id == employee.id,
            EmployeeAssignment.assignment_type == "ADVISOR",
            EmployeeAssignment.entity_type == "CUSTOMER",
            EmployeeAssignment.entity_id == customer_id,
            EmployeeAssignment.effective_from <= today,
            (EmployeeAssignment.effective_to.is_(None) | (EmployeeAssignment.effective_to >= today)),
            EmployeeAssignment.is_active.is_(True),
            EmployeeAssignment.deleted_at.is_(None),
        ).first()
        customer = (
            db.query(Customer)
            .filter(
                Customer.id == customer_id,
                Customer.organization_id == employee.organization_id,
                Customer.is_active.is_(True), Customer.deleted_at.is_(None),
            )
            .first()
        )

        if not customer or not assignment:
            raise HTTPException(
                status_code=404,
                detail="Customer not found",
            )

    if customer_group_id:
        group = (
            db.query(CustomerGroup)
            .filter(
                CustomerGroup.id == customer_group_id,
                CustomerGroup.organization_id == employee.organization_id,
                CustomerGroup.is_active.is_(True), CustomerGroup.deleted_at.is_(None),
            )
            .first()
        )

        if not group:
            raise HTTPException(
                status_code=404,
                detail="Customer group not found",
            )
        assigned = db.query(EmployeeAssignment).filter(
            EmployeeAssignment.employee_id == employee.id,
            EmployeeAssignment.assignment_type == "ADVISOR",
            or_(
                (EmployeeAssignment.entity_type == "CUSTOMER_GROUP") &
                (EmployeeAssignment.entity_id == group.id),
                (EmployeeAssignment.entity_type == "BRANCH") &
                (EmployeeAssignment.entity_id == group.primary_branch_id),
            ),
            EmployeeAssignment.effective_from <= date.today(),
            or_(EmployeeAssignment.effective_to.is_(None),
                EmployeeAssignment.effective_to >= date.today()),
            EmployeeAssignment.is_active.is_(True),
            EmployeeAssignment.deleted_at.is_(None),
        ).first()
        if not assigned:
            raise HTTPException(404, "Assigned customer group not found")


@router.get(
    "/",
    response_model=MessageListResponse,
    dependencies=[Depends(require_permission("MESSAGE.READ"))],
)
def list_messages(
    search: str | None = Query(default=None),
    status: str | None = Query(default=None),
    message_type: str | None = Query(default=None),
    customer_id: int | None = Query(default=None),
    customer_group_id: int | None = Query(default=None),
    from_date: datetime | None = Query(default=None),
    to_date: datetime | None = Query(default=None),

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(
        db,
        current_user,
    )

    query = (
        db.query(Message)
        .filter(
            Message.organization_id
            == employee.organization_id,
            Message.sender_employee_id
            == employee.id,
        )
    )

    if search:
        search_term = f"%{search.strip()}%"

        query = (
            query
            .outerjoin(
                Customer,
                Message.customer_id == Customer.id,
            )
            .outerjoin(
                CustomerGroup,
                Message.customer_group_id
                == CustomerGroup.id,
            )
            .filter(
                or_(
                    Message.subject.ilike(
                        search_term
                    ),
                    Message.body.ilike(
                        search_term
                    ),
                    CustomerGroup.group_name.ilike(
                        search_term
                    ),
                )
            )
        )

    if status:
        query = query.filter(
            Message.status == status
        )

    if message_type:
        query = query.filter(
            Message.message_type
            == message_type
        )

    if customer_id:
        query = query.filter(
            Message.customer_id
            == customer_id
        )

    if customer_group_id:
        query = query.filter(
            Message.customer_group_id
            == customer_group_id
        )

    if from_date:
        query = query.filter(
            Message.sent_at >= from_date
        )

    if to_date:
        query = query.filter(
            Message.sent_at <= to_date
        )

    messages = (
        query
        .order_by(Message.sent_at.desc())
        .all()
    )

    accessible = []
    for message in messages:
        try:
            validate_customer_and_group(db, employee, message.customer_id, message.customer_group_id)
            accessible.append(message)
        except HTTPException:
            continue

    return MessageListResponse(
        messages=[
            build_message_response(message)
            for message in accessible
        ],
        total=len(accessible),
    )


@router.get(
    "/{message_id}",
    response_model=MessageResponse,
    dependencies=[Depends(require_permission("MESSAGE.READ"))],
)
def get_message(
    message_id: int,

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(
        db,
        current_user,
    )

    message = (
        db.query(Message)
        .filter(
            Message.id == message_id,
            Message.organization_id
            == employee.organization_id,
            Message.sender_employee_id
            == employee.id,
        )
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found",
        )

    validate_customer_and_group(db, employee, message.customer_id, message.customer_group_id)

    return build_message_response(message)


@router.post(
    "/",
    response_model=MessageResponse,
    status_code=201,
    dependencies=[Depends(require_permission("MESSAGE.CREATE"))],
)
def create_message(
    payload: MessageCreate,

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    idempotency_key: str | None = Header(default=None),
):
    employee = get_advisor_employee(
        db,
        current_user,
    )

    validate_customer_and_group(
        db,
        employee,
        payload.customer_id,
        payload.customer_group_id,
    )
    reservation = reserve_create(db, key=idempotency_key, operation="message.create", actor_scope=f"user:{current_user.user_id}", payload=payload.model_dump())
    if reservation and reservation.replay:
        message = db.query(Message).filter(Message.id == reservation.resource_id, Message.organization_id == employee.organization_id, Message.sender_employee_id == employee.id).first()
        if message is None:
            raise HTTPException(status_code=404, detail="Message not found")
        return build_message_response(message)

    message = Message(
        organization_id=employee.organization_id,
        sender_employee_id=employee.id,

        customer_id=payload.customer_id,
        customer_group_id=payload.customer_group_id,

        message_type=payload.message_type,
        subject=payload.subject,
        body=payload.body,
        status=payload.status,

        sent_at=datetime.utcnow(),
    )

    db.add(message)
    db.flush()
    finish_create(db, reservation, message.id)
    db.commit()
    db.refresh(message)

    return build_message_response(message)


@router.put(
    "/{message_id}",
    response_model=MessageResponse,
    dependencies=[Depends(require_permission("MESSAGE.UPDATE"))],
)
def update_message(
    message_id: int,
    payload: MessageUpdate,

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(
        db,
        current_user,
    )

    message = (
        db.query(Message)
        .filter(
            Message.id == message_id,
            Message.organization_id
            == employee.organization_id,
            Message.sender_employee_id
            == employee.id,
        )
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found",
        )

    validate_customer_and_group(db, employee, message.customer_id, message.customer_group_id)

    values = payload.model_dump(
        exclude_unset=True
    )

    for field, value in values.items():
        setattr(message, field, value)

    db.commit()
    db.refresh(message)

    return build_message_response(message)


@router.post(
    "/{message_id}/read",
    response_model=MessageResponse,
    dependencies=[Depends(require_permission("MESSAGE.UPDATE"))],
)
def mark_message_read(
    message_id: int,

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(
        db,
        current_user,
    )

    message = (
        db.query(Message)
        .filter(
            Message.id == message_id,
            Message.organization_id
            == employee.organization_id,
            Message.sender_employee_id
            == employee.id,
        )
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found",
        )

    validate_customer_and_group(db, employee, message.customer_id, message.customer_group_id)

    message.status = "READ"
    message.read_at = datetime.utcnow()

    db.commit()
    db.refresh(message)

    return build_message_response(message)


@router.post(
    "/{message_id}/archive",
    response_model=MessageResponse,
    dependencies=[Depends(require_permission("MESSAGE.UPDATE"))],
)
def archive_message(
    message_id: int,

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(
        db,
        current_user,
    )

    message = (
        db.query(Message)
        .filter(
            Message.id == message_id,
            Message.organization_id
            == employee.organization_id,
            Message.sender_employee_id
            == employee.id,
        )
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found",
        )

    validate_customer_and_group(db, employee, message.customer_id, message.customer_group_id)

    message.status = "ARCHIVED"

    db.commit()
    db.refresh(message)

    return build_message_response(message)
