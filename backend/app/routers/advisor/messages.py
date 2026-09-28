from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ...database.session import get_db
from ...models.crm.customer import Customer, CustomerGroup
from ...models.crm.message import Message
from ...models.organization.employee import Employee
from ...routers.advisors import get_current_advisor as get_current_user
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
    current_user,
) -> Employee:
    employee = (
        db.query(Employee)
        .filter(
            Employee.party_id == current_user.party_id,
            Employee.is_active.is_(True),
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
        customer = (
            db.query(Customer)
            .filter(
                Customer.id == customer_id,
                Customer.organization_id
                == employee.organization_id,
            )
            .first()
        )

        if not customer:
            raise HTTPException(
                status_code=404,
                detail="Customer not found",
            )

    if customer_group_id:
        group = (
            db.query(CustomerGroup)
            .filter(
                CustomerGroup.id == customer_group_id,
                CustomerGroup.organization_id
                == employee.organization_id,
            )
            .first()
        )

        if not group:
            raise HTTPException(
                status_code=404,
                detail="Customer group not found",
            )


@router.get(
    "/",
    response_model=MessageListResponse,
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

    return MessageListResponse(
        messages=[
            build_message_response(message)
            for message in messages
        ],
        total=len(messages),
    )


@router.get(
    "/{message_id}",
    response_model=MessageResponse,
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

    return build_message_response(message)


@router.post(
    "/",
    response_model=MessageResponse,
    status_code=201,
)
def create_message(
    payload: MessageCreate,

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
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
    db.commit()
    db.refresh(message)

    return build_message_response(message)


@router.put(
    "/{message_id}",
    response_model=MessageResponse,
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

    message.status = "READ"
    message.read_at = datetime.utcnow()

    db.commit()
    db.refresh(message)

    return build_message_response(message)


@router.post(
    "/{message_id}/archive",
    response_model=MessageResponse,
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

    message.status = "ARCHIVED"

    db.commit()
    db.refresh(message)

    return build_message_response(message)