"""Household / customer-group management routes for advisors."""

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.crm.customer import Customer, CustomerGroup, GroupMember
from ..models.identity.auth import User
from ..models.organization.employee import Employee
from ..schemas.group import (
    GroupActionResponse,
    GroupCreate,
    GroupHeadUpdate,
    GroupListResponse,
    GroupMemberAdd,
    GroupMemberListResponse,
    GroupMemberResponse,
    GroupPrimaryUpdate,
    GroupResponse,
    GroupUpdate,
)
from .advisors import get_current_advisor


router = APIRouter(
    prefix="/advisors/groups",
    tags=["advisor-groups"],
)


# ============================================================
# HELPERS
# ============================================================

def get_advisor_employee(
    db: Session,
    advisor: User,
) -> Employee:
    """
    Resolve the organization employee record belonging to
    the currently authenticated advisor.

    The organization employee model exposes an active-status flag in some
    versions and an employment_status string in others; support both.
    """

    active_filter = (
        Employee.is_active.is_(True)
        if hasattr(Employee, "is_active")
        else Employee.employment_status == "ACTIVE"
    )

    employee = (
        db.query(Employee)
        .filter(
            Employee.party_id == advisor.party_id,
            active_filter,
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Active advisor employee record not found",
        )

    return employee


def get_group_for_advisor(
    db: Session,
    group_id: int,
    employee: Employee,
) -> CustomerGroup:
    """
    Load a group belonging to the advisor's organization.

    Groups are organization-owned. If a group has a specific
    primary advisor, only that advisor can manage it.
    """

    group = (
        db.query(CustomerGroup)
        .filter(
            CustomerGroup.id == group_id,
            CustomerGroup.organization_id == employee.organization_id,
        )
        .first()
    )

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Household not found",
        )

    if (
        group.primary_advisor_employee_id is not None
        and group.primary_advisor_employee_id != employee.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not assigned to this household",
        )

    return group


def get_customer_for_advisor(
    db: Session,
    customer_id: int,
    employee: Employee,
) -> Customer:
    """Load a customer belonging to the advisor's organization."""

    customer = (
        db.query(Customer)
        .filter(
            Customer.id == customer_id,
            Customer.organization_id == employee.organization_id,
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    return customer


def get_customer_display_name(customer: Customer) -> str:
    """Safely resolve the customer's display name."""

    if customer.party and customer.party.display_name:
        return customer.party.display_name

    parts = [
        customer.party.first_name if customer.party else None,
        customer.party.last_name if customer.party else None,
    ]

    return " ".join(part for part in parts if part).strip() or customer.customer_code


def build_member_response(
    member: GroupMember,
) -> GroupMemberResponse:
    customer = member.customer

    return GroupMemberResponse(
        id=member.id,
        customer_id=customer.id,
        customer_code=customer.customer_code,
        display_name=get_customer_display_name(customer),
        email=customer.party.email if customer.party else None,
        phone=customer.party.mobile_number if customer.party else None,
        relationship_type=member.relationship_type,
        is_group_head=bool(member.is_group_head),
        is_primary=bool(member.is_primary),
        joined_on=member.joined_on,
        left_on=member.left_on,
        remarks=member.remarks,
    )


def build_group_response(
    db: Session,
    group: CustomerGroup,
) -> GroupResponse:
    """
    Build the API representation of a household.
    """

    members = (
        db.query(GroupMember)
        .filter(
            GroupMember.customer_group_id == group.id,
        )
        .all()
    )

    active_members = [
        member
        for member in members
        if member.left_on is None
    ]

    head_member = next(
        (
            member
            for member in active_members
            if member.is_group_head
        ),
        None,
    )

    head_customer_name = None

    if group.head_customer_id is not None:
        head_customer = (
            db.query(Customer)
            .filter(
                Customer.id == group.head_customer_id,
            )
            .first()
        )
        if head_customer:
            head_customer_name = get_customer_display_name(head_customer)

    if head_customer_name is None and head_member and head_member.customer:
        head_customer_name = get_customer_display_name(
            head_member.customer
        )

    return GroupResponse(
        id=group.id,
        organization_id=group.organization_id,
        group_code=group.group_code,
        group_name=group.group_name,
        group_type=group.group_type,
        head_customer_id=group.head_customer_id,
        primary_branch_id=group.primary_branch_id,
        primary_advisor_employee_id=group.primary_advisor_employee_id,
        risk_profile=group.risk_profile,
        investment_objective=group.investment_objective,
        remarks=group.remarks,
        is_active=bool(group.is_active),
        member_count=len(members),
        active_member_count=len(active_members),
        head_customer_name=head_customer_name,
        created_at=group.created_at,
        updated_at=group.updated_at or group.created_at,
    )


def ensure_active_group(
    group: CustomerGroup,
) -> None:
    if not group.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Household is inactive",
        )


# ============================================================
# LIST HOUSEHOLDS
# ============================================================

@router.get(
    "/",
    response_model=GroupListResponse,
)
def list_groups(
    group_type: Optional[str] = Query(
        None,
        description="Filter by household/group type",
    ),
    search: Optional[str] = Query(
        None,
        description="Search by household name or code",
    ),
    include_inactive: bool = Query(
        False,
        description="Include inactive households",
    ),
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """List households available to the current advisor."""

    employee = get_advisor_employee(db, advisor)

    query = (
        db.query(CustomerGroup)
        .filter(
            CustomerGroup.organization_id == employee.organization_id,
        )
    )

    # Assigned groups + organization-level groups.
    query = query.filter(
        (CustomerGroup.primary_advisor_employee_id == employee.id)
        | (CustomerGroup.primary_advisor_employee_id.is_(None))
    )

    if not include_inactive:
        query = query.filter(
            CustomerGroup.is_active.is_(True)
        )

    if group_type:
        query = query.filter(
            CustomerGroup.group_type == group_type
        )

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            CustomerGroup.group_name.ilike(search_value)
            | CustomerGroup.group_code.ilike(search_value)
        )

    groups = (
        query
        .order_by(CustomerGroup.created_at.desc())
        .all()
    )

    responses = [
        build_group_response(db, group)
        for group in groups
    ]

    return GroupListResponse(
        groups=responses,
        total=len(responses),
    )


# ============================================================
# CREATE HOUSEHOLD
# ============================================================

@router.post(
    "/",
    response_model=GroupResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_group(
    group_data: GroupCreate,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """
    Create a household.

    If head_customer_id is supplied, that client becomes:
    - household member
    - group head
    - primary household for that client
    """

    employee = get_advisor_employee(db, advisor)

    head_customer = None

    if group_data.head_customer_id is not None:
        head_customer = get_customer_for_advisor(
            db,
            group_data.head_customer_id,
            employee,
        )

        if head_customer.customer_status != "ACTIVE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive clients cannot be household heads",
            )

    # Generate organization-safe group code.
    last_group = (
        db.query(CustomerGroup)
        .filter(
            CustomerGroup.organization_id == employee.organization_id,
        )
        .order_by(CustomerGroup.id.desc())
        .first()
    )

    next_number = (last_group.id + 1) if last_group else 1

    group_code = f"G-{next_number:05d}"

    db_group = CustomerGroup(
        organization_id=employee.organization_id,
        group_code=group_code,
        group_name=group_data.group_name.strip(),
        group_type=group_data.group_type,
        primary_branch_id=employee.branch_id,
        primary_advisor_employee_id=employee.id,
        risk_profile=group_data.risk_profile,
        investment_objective=group_data.investment_objective,
        remarks=group_data.remarks,
        head_customer_id=head_customer.id if head_customer else None,
        is_active=True,
    )

    db.add(db_group)
    db.flush()

    # Add initial head/member if supplied.
    if head_customer:
        member = GroupMember(
            customer_group_id=db_group.id,
            customer_id=head_customer.id,
            relationship_type="SELF",
            is_group_head=True,
            is_primary=True,
            joined_on=date.today(),
            left_on=None,
        )

        db.add(member)

    db.commit()
    db.refresh(db_group)

    return build_group_response(db, db_group)


# ============================================================
# GET HOUSEHOLD
# ============================================================

@router.get(
    "/{group_id}",
    response_model=GroupResponse,
)
def get_group(
    group_id: int,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """Get household information."""

    employee = get_advisor_employee(db, advisor)

    group = get_group_for_advisor(
        db,
        group_id,
        employee,
    )

    return build_group_response(db, group)


# ============================================================
# GET MEMBERS
# ============================================================

@router.get(
    "/{group_id}/members",
    response_model=GroupMemberListResponse,
)
def list_group_members(
    group_id: int,
    include_history: bool = Query(
        False,
        description="Include members who have left the household",
    ),
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """List household members."""

    employee = get_advisor_employee(db, advisor)

    group = get_group_for_advisor(
        db,
        group_id,
        employee,
    )

    query = (
        db.query(GroupMember)
        .filter(
            GroupMember.customer_group_id == group.id,
        )
    )

    if not include_history:
        query = query.filter(
            GroupMember.left_on.is_(None)
        )

    members = (
        query
        .order_by(
            GroupMember.is_group_head.desc(),
            GroupMember.is_primary.desc(),
            GroupMember.joined_on.asc(),
            GroupMember.id.asc(),
        )
        .all()
    )

    responses = [
        build_member_response(member)
        for member in members
    ]

    return GroupMemberListResponse(
        group_id=group.id,
        members=responses,
        total=len(responses),
    )


# ============================================================
# UPDATE HOUSEHOLD
# ============================================================

@router.put(
    "/{group_id}",
    response_model=GroupResponse,
)
def update_group(
    group_id: int,
    group_data: GroupUpdate,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """Update household information."""

    employee = get_advisor_employee(db, advisor)

    group = get_group_for_advisor(
        db,
        group_id,
        employee,
    )

    ensure_active_group(group)

    update_data = group_data.model_dump(
        exclude_unset=True,
    )

    for field, value in update_data.items():
        if isinstance(value, str):
            value = value.strip()

        setattr(group, field, value)

    db.commit()
    db.refresh(group)

    return build_group_response(db, group)


# ============================================================
# ADD MEMBER
# ============================================================

@router.post(
    "/{group_id}/members",
    response_model=GroupMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_group_member(
    group_id: int,
    member_data: GroupMemberAdd,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """
    Add a client to a household.

    A client may belong to multiple active households.
    """

    employee = get_advisor_employee(db, advisor)

    group = get_group_for_advisor(
        db,
        group_id,
        employee,
    )

    ensure_active_group(group)

    customer = get_customer_for_advisor(
        db,
        member_data.customer_id,
        employee,
    )

    if customer.customer_status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive clients cannot be added to a household",
        )

    existing = (
        db.query(GroupMember)
        .filter(
            GroupMember.customer_group_id == group.id,
            GroupMember.customer_id == customer.id,
        )
        .first()
    )

    if existing:
        if existing.left_on is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Client is already an active member of this household",
            )

        # Existing historical membership.
        # Reactivate it instead of creating a duplicate because the
        # database currently has a unique group/customer constraint.
        existing.left_on = None
        existing.joined_on = date.today()
        existing.relationship_type = (
            member_data.relationship_type
        )
        existing.remarks = member_data.remarks

        if member_data.is_group_head:
            (
                db.query(GroupMember)
                .filter(
                    GroupMember.customer_group_id == group.id,
                    GroupMember.is_group_head.is_(True),
                    GroupMember.id != existing.id,
                    GroupMember.left_on.is_(None),
                )
                .update(
                    {GroupMember.is_group_head: False},
                    synchronize_session=False,
                )
            )

            existing.is_group_head = True
            group.head_customer_id = customer.id

        if member_data.is_primary:
            (
                db.query(GroupMember)
                .filter(
                    GroupMember.customer_id == customer.id,
                    GroupMember.is_primary.is_(True),
                    GroupMember.left_on.is_(None),
                    GroupMember.id != existing.id,
                )
                .update(
                    {GroupMember.is_primary: False},
                    synchronize_session=False,
                )
            )
            existing.is_primary = True

        db.commit()
        db.refresh(existing)

        return build_member_response(existing)

    if member_data.is_group_head:
        # Only one active head per group.
        (
            db.query(GroupMember)
            .filter(
                GroupMember.customer_group_id == group.id,
                GroupMember.is_group_head.is_(True),
                GroupMember.left_on.is_(None),
            )
            .update(
                {GroupMember.is_group_head: False},
                synchronize_session=False,
            )
        )

    if member_data.is_primary:
        # Only one primary household for a client.
        (
            db.query(GroupMember)
            .filter(
                GroupMember.customer_id == customer.id,
                GroupMember.is_primary.is_(True),
                GroupMember.left_on.is_(None),
            )
            .update(
                {GroupMember.is_primary: False},
                synchronize_session=False,
            )
        )

    member = GroupMember(
        customer_group_id=group.id,
        customer_id=customer.id,
        relationship_type=member_data.relationship_type,
        is_group_head=member_data.is_group_head,
        is_primary=member_data.is_primary,
        joined_on=date.today(),
        left_on=None,
        remarks=member_data.remarks,
    )

    db.add(member)

    if member_data.is_group_head:
        group.head_customer_id = customer.id

    db.commit()
    db.refresh(member)

    return build_member_response(member)


# ============================================================
# CHANGE HOUSEHOLD HEAD
# ============================================================

@router.put(
    "/{group_id}/head",
    response_model=GroupActionResponse,
)
def set_group_head(
    group_id: int,
    body: GroupHeadUpdate,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """
    Change household head.

    The previous head remains a normal household member.
    """

    employee = get_advisor_employee(db, advisor)

    group = get_group_for_advisor(
        db,
        group_id,
        employee,
    )

    ensure_active_group(group)

    customer = get_customer_for_advisor(
        db,
        body.customer_id,
        employee,
    )

    if customer.customer_status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive clients cannot become household heads",
        )

    member = (
        db.query(GroupMember)
        .filter(
            GroupMember.customer_group_id == group.id,
            GroupMember.customer_id == customer.id,
            GroupMember.left_on.is_(None),
        )
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client must be an active household member before becoming head",
        )

    # Remove head flag from previous head.
    (
        db.query(GroupMember)
        .filter(
            GroupMember.customer_group_id == group.id,
            GroupMember.is_group_head.is_(True),
            GroupMember.left_on.is_(None),
        )
        .update(
            {GroupMember.is_group_head: False},
            synchronize_session=False,
        )
    )

    member.is_group_head = True
    group.head_customer_id = customer.id

    db.commit()
    db.refresh(group)

    return GroupActionResponse(
        message=f"{get_customer_display_name(customer)} is now the household head",
        group=build_group_response(db, group),
    )


# ============================================================
# SET PRIMARY HOUSEHOLD
# ============================================================

@router.put(
    "/{group_id}/primary",
    response_model=GroupActionResponse,
)
def set_primary_group(
    group_id: int,
    body: GroupPrimaryUpdate,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """
    Make this household the client's primary household.

    The client may still remain an active member of other households.
    """

    employee = get_advisor_employee(db, advisor)

    group = get_group_for_advisor(
        db,
        group_id,
        employee,
    )

    ensure_active_group(group)

    customer = get_customer_for_advisor(
        db,
        body.customer_id,
        employee,
    )

    member = (
        db.query(GroupMember)
        .filter(
            GroupMember.customer_group_id == group.id,
            GroupMember.customer_id == customer.id,
            GroupMember.left_on.is_(None),
        )
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client must be an active member of this household",
        )

    # Clear primary flag from all other active memberships
    # for this client.
    (
        db.query(GroupMember)
        .filter(
            GroupMember.customer_id == customer.id,
            GroupMember.is_primary.is_(True),
            GroupMember.left_on.is_(None),
            GroupMember.id != member.id,
        )
        .update(
            {GroupMember.is_primary: False},
            synchronize_session=False,
        )
    )

    member.is_primary = True

    db.commit()
    db.refresh(group)

    return GroupActionResponse(
        message=f"{get_customer_display_name(customer)} now has this as their primary household",
        group=build_group_response(db, group),
    )


# ============================================================
# LEAVE / REMOVE MEMBER
# ============================================================

@router.delete(
    "/{group_id}/members/{customer_id}",
)
def remove_group_member(
    group_id: int,
    customer_id: int,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """
    Remove a client from a household.

    We preserve history by setting left_on instead of deleting
    the membership row.
    """

    employee = get_advisor_employee(db, advisor)

    group = get_group_for_advisor(
        db,
        group_id,
        employee,
    )

    ensure_active_group(group)

    member = (
        db.query(GroupMember)
        .filter(
            GroupMember.customer_group_id == group.id,
            GroupMember.customer_id == customer_id,
            GroupMember.left_on.is_(None),
        )
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client is not an active member of this household",
        )

    if member.is_group_head:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Household head cannot leave. Change the head first.",
        )

    member.left_on = date.today()
    member.is_primary = False
    member.is_group_head = False

    db.commit()

    return {
        "message": "Client removed from household successfully",
        "customer_id": customer_id,
        "left_on": member.left_on,
    }


# ============================================================
# DEACTIVATE HOUSEHOLD
# ============================================================

@router.post(
    "/{group_id}/deactivate",
    response_model=GroupActionResponse,
)
def deactivate_group(
    group_id: int,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """
    Deactivate a household without deleting its history.
    """

    employee = get_advisor_employee(db, advisor)

    group = get_group_for_advisor(
        db,
        group_id,
        employee,
    )

    if not group.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Household is already inactive",
        )

    group.is_active = False

    db.commit()
    db.refresh(group)

    return GroupActionResponse(
        message="Household deactivated successfully",
        group=build_group_response(db, group),
    )