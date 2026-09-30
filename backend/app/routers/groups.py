"""
Add a client to a household/group.

A client may have only one active HOUSEHOLD/FAMILY
membership, but may belong to multiple active
BUSINESS/INVESTMENT/TRUST/HUF/OTHER groups.
"""

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
    MoveHouseholdRequest,
    GroupResponse,
    GroupUpdate,
)
from .advisors import get_current_advisor
from ..schemas.group_options import GROUP_RELATIONSHIPS


router = APIRouter(
    prefix="/advisors/groups",
    tags=["advisor-groups"],
)

HOUSEHOLD_GROUP_TYPES = {
    "HOUSEHOLD",
    "FAMILY",
}

def is_household_group_type(
    group_type: str | None,
) -> bool:
    return (
        (group_type or "").strip().upper()
        in HOUSEHOLD_GROUP_TYPES
    )
    
# ============================================================
# HELPERS
# ============================================================

def validate_group_relationship(group_type: str, value: str | None, default: str) -> str:
    relationship = (value or default).strip().upper()
    allowed = GROUP_RELATIONSHIPS.get(group_type.strip().upper())
    if allowed is None or relationship not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid relationship for {group_type}. Allowed: {', '.join(allowed or ())}",
        )
    return relationship


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

    active_members = (
        db.query(GroupMember)
        .filter(
            GroupMember.customer_group_id == group.id,
            GroupMember.left_on.is_(None),
        )
        .all()
    )

    # A stored head reference is valid only while its membership is active.
    head_member = next(
        (
            member
            for member in active_members
            if member.customer_id == group.head_customer_id
        ),
        None,
    )

    if head_member is None:
        head_member = next(
            (member for member in active_members if member.is_group_head),
            None,
        )

    head_customer_name = None
    if head_member and head_member.customer:
        head_customer_name = get_customer_display_name(
            head_member.customer
        )

    return GroupResponse(
        id=group.id,
        organization_id=group.organization_id,
        group_code=group.group_code,
        group_name=group.group_name,
        group_type=group.group_type,
        head_customer_id=head_member.customer_id if head_member else None,
        primary_branch_id=group.primary_branch_id,
        primary_advisor_employee_id=group.primary_advisor_employee_id,
        risk_profile=group.risk_profile,
        investment_objective=group.investment_objective,
        remarks=group.remarks,
        is_active=bool(group.is_active),
        member_count=len(active_members),
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

    normalized_group_type = (
        group_data.group_type or "HOUSEHOLD"
    ).strip().upper()

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
                detail="Inactive clients cannot be group heads",
            )

        # A client may have only one active HOUSEHOLD/FAMILY.
        if is_household_group_type(normalized_group_type):
            existing_active_household = (
                db.query(GroupMember)
                .join(
                    CustomerGroup,
                    GroupMember.customer_group_id == CustomerGroup.id,
                )
                .filter(
                    GroupMember.customer_id == head_customer.id,
                    GroupMember.left_on.is_(None),
                    CustomerGroup.group_type.in_(
                        HOUSEHOLD_GROUP_TYPES
                    ),
                    CustomerGroup.is_active.is_(True),
                )
                .first()
            )

            if existing_active_household:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Client already belongs to an active household. "
                        "Use the move household operation instead."
                    ),
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
        group_type=normalized_group_type,
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
            relationship_type="SELF" if is_household_group_type(normalized_group_type) else "MEMBER",
            is_group_head=True,
            is_primary=is_household_group_type(
                normalized_group_type
            ),
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
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """List current active members. See /members/history for all periods."""

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
            GroupMember.left_on.is_(None),
        )
    )

    members = (
        query
        .order_by(
            GroupMember.is_group_head.desc(),
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
# MEMBERSHIP HISTORY
# ============================================================

@router.get(
    "/{group_id}/members/history",
    response_model=GroupMemberListResponse,
)
def list_group_membership_history(
    group_id: int,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """List every membership period, including active and ended periods."""
    employee = get_advisor_employee(db, advisor)
    group = get_group_for_advisor(db, group_id, employee)

    members = (
        db.query(GroupMember)
        .filter(GroupMember.customer_group_id == group.id)
        .order_by(
            GroupMember.joined_on.desc(),
            GroupMember.id.desc(),
        )
        .all()
    )

    return GroupMemberListResponse(
        group_id=group.id,
        members=[build_member_response(member) for member in members],
        total=len(members),
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
        exclude_unset=True
    )

    if "group_type" in update_data:
        requested_group_type = (
            update_data["group_type"] or ""
        ).strip().upper()

        current_group_type = (
            group.group_type or ""
        ).strip().upper()

        if requested_group_type != current_group_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Group type cannot be changed after creation."
                ),
            )
        update_data["group_type"] = current_group_type

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
    Add a client to a group.

    Rules:
    - A client may have only one active HOUSEHOLD/FAMILY membership.
    - A client may belong to multiple active BUSINESS,
      INVESTMENT, TRUST, HUF, and OTHER groups.
    - HOUSEHOLD/FAMILY membership is automatically primary.
    - Non-household memberships are never primary.
    """

    employee = get_advisor_employee(
        db,
        advisor,
    )

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
            detail="Inactive clients cannot be added to a group",
        )

    is_household = is_household_group_type(
        group.group_type
    )
    relationship_type = validate_group_relationship(
        group.group_type, member_data.relationship_type, "MEMBER"
    )

    # --------------------------------------------------------
    # HOUSEHOLD / FAMILY RULE
    # --------------------------------------------------------

    if is_household:
        existing_active_household = (
            db.query(GroupMember)
            .join(
                CustomerGroup,
                GroupMember.customer_group_id
                == CustomerGroup.id,
            )
            .filter(
                GroupMember.customer_id
                == customer.id,
                GroupMember.left_on.is_(None),
                CustomerGroup.id != group.id,
                CustomerGroup.group_type.in_(
                    HOUSEHOLD_GROUP_TYPES
                ),
                CustomerGroup.is_active.is_(True),
            )
            .first()
        )

        if existing_active_household:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Client already belongs to an active household. "
                    "Use the move household operation instead."
                ),
            )

    # --------------------------------------------------------
    # CHECK EXISTING / HISTORICAL MEMBERSHIP
    # --------------------------------------------------------
    existing_active = (
        db.query(GroupMember)
        .filter(
            GroupMember.customer_group_id
            == group.id,
            GroupMember.customer_id
            == customer.id,
            GroupMember.left_on.is_(None),
        )
        .first()
    )

    if existing_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Client is already an active member of this group",
        )

    # --------------------------------------------------------
    # NEW MEMBERSHIP
    # --------------------------------------------------------

    if member_data.is_group_head:
        # Only one active head is allowed per group.
        (
            db.query(GroupMember)
            .filter(
                GroupMember.customer_group_id
                == group.id,
                GroupMember.is_group_head.is_(True),
                GroupMember.left_on.is_(None),
            )
            .update(
                {
                    GroupMember.is_group_head: False
                },
                synchronize_session=False,
            )
        )

    member = GroupMember(
        customer_group_id=group.id,
        customer_id=customer.id,
        relationship_type=relationship_type,
        is_group_head=member_data.is_group_head,
        is_primary=is_household,
        joined_on=date.today(),
        left_on=None,
        remarks=member_data.remarks,
    )

    db.add(member)

    if member_data.is_group_head:
        group.head_customer_id = customer.id

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

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

    remaining_active_member = (
        db.query(GroupMember)
        .filter(
            GroupMember.customer_group_id == group.id,
            GroupMember.customer_id != customer_id,
            GroupMember.left_on.is_(None),
        )
        .first()
    )
    is_head = member.is_group_head or group.head_customer_id == customer_id
    is_household = is_household_group_type(group.group_type)

    if is_head and (remaining_active_member is not None or not is_household):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Household head cannot leave. Change the head first.",
        )

    member.left_on = date.today()
    member.is_primary = False
    member.is_group_head = False

    # If this is a HOUSEHOLD/FAMILY and no active members
    # remain after removal, deactivate the group.
    if is_household and remaining_active_member is None:
        group.head_customer_id = None
        group.is_active = False

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

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
    Deactivate a group without deleting its history.

    HOUSEHOLD/FAMILY groups must be empty before
    they can be deactivated.
    """

    employee = get_advisor_employee(
        db,
        advisor,
    )

    group = get_group_for_advisor(
        db,
        group_id,
        employee,
    )

    if not group.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group is already inactive",
        )

    active_memberships = (
        db.query(GroupMember)
        .filter(
            GroupMember.customer_group_id == group.id,
            GroupMember.left_on.is_(None),
        )
        .all()
    )

    # HOUSEHOLD/FAMILY groups cannot be deactivated
    # while clients are still active members.
    if (
        is_household_group_type(group.group_type)
        and active_memberships
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Household still has active members. "
                "Move or remove all members before "
                "deactivating it."
            ),
        )

    # Non-household groups may be deactivated while
    # members are still present. Close those memberships.
    for membership in active_memberships:
        membership.left_on = date.today()
        membership.is_primary = False
        membership.is_group_head = False

    group.head_customer_id = None
    group.is_active = False

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(group)

    return GroupActionResponse(
        message="Group deactivated successfully",
        group=build_group_response(
            db,
            group,
        ),
    )


@router.post("/{group_id}/move-client")
def move_client_to_household(
    group_id: int,
    payload: MoveHouseholdRequest,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    employee = get_advisor_employee(
        db,
        advisor,
    )

    target_group = get_group_for_advisor(
        db,
        group_id,
        employee,
    )

    ensure_active_group(target_group)

    if not is_household_group_type(
        target_group.group_type
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Client can only be moved to a "
                "HOUSEHOLD or FAMILY group"
            ),
        )

    customer = get_customer_for_advisor(
        db,
        payload.customer_id,
        employee,
    )

    if customer.customer_status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive clients cannot be moved",
        )

    # --------------------------------------------------------
    # CHECK TARGET MEMBERSHIP
    # --------------------------------------------------------

    relationship_type = validate_group_relationship(
        target_group.group_type, payload.relationship_type, "SELF"
    )

    target_membership = (
        db.query(GroupMember)
        .filter(
            GroupMember.customer_group_id
            == target_group.id,
            GroupMember.customer_id
            == customer.id,
            GroupMember.left_on.is_(None),
        )
        .first()
    )

    if target_membership:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Client already belongs to this household"
            ),
        )

    # --------------------------------------------------------
    # CURRENT ACTIVE HOUSEHOLD/FAMILY MEMBERSHIPS
    # --------------------------------------------------------

    current_memberships = (
        db.query(GroupMember)
        .join(
            CustomerGroup,
            GroupMember.customer_group_id
            == CustomerGroup.id,
        )
        .filter(
            GroupMember.customer_id
            == customer.id,
            GroupMember.left_on.is_(None),
            CustomerGroup.group_type.in_(
                HOUSEHOLD_GROUP_TYPES
            ),
            CustomerGroup.is_active.is_(True),
            CustomerGroup.id != target_group.id,
        )
        .all()
    )

    # --------------------------------------------------------
    # HANDLE CURRENT HOUSEHOLD HEAD
    # --------------------------------------------------------

    try:
        for membership in current_memberships:
            current_group = membership.group

            if not current_group:
                continue

            remaining_members = (
                db.query(GroupMember)
                .filter(
                    GroupMember.customer_group_id
                    == current_group.id,
                    GroupMember.customer_id
                    != customer.id,
                    GroupMember.left_on.is_(None),
                )
                .all()
            )

            if not remaining_members:
                current_group.head_customer_id = None
                current_group.is_active = False
                continue

            if not (
                membership.is_group_head
                or current_group.head_customer_id == customer.id
            ):
                continue

            # Other members remain, therefore a new head
            # must be selected.
            if remaining_members:
                if (
                    payload.new_head_customer_id
                    is None
                ):
                    raise HTTPException(
                        status_code=(
                            status.HTTP_400_BAD_REQUEST
                        ),
                        detail=(
                            "Client is the current household "
                            "head. Select a new head before "
                            "moving this client."
                        ),
                    )

                new_head_membership = next(
                    (
                        member
                        for member in remaining_members
                        if member.customer_id
                        == payload.new_head_customer_id
                    ),
                    None,
                )

                if new_head_membership is None:
                    raise HTTPException(
                        status_code=(
                            status.HTTP_400_BAD_REQUEST
                        ),
                        detail=(
                            "New household head must be an "
                            "active member of the current "
                            "household."
                        ),
                    )

                # Remove any existing head flag.
                for member in remaining_members:
                    member.is_group_head = False

                # Release the unique active-head slot before assigning its successor.
                membership.is_group_head = False
                db.flush()
                new_head_membership.is_group_head = True

                current_group.head_customer_id = (
                    new_head_membership.customer_id
                )

        # --------------------------------------------------------
        # CLOSE OLD HOUSEHOLD MEMBERSHIPS
        # --------------------------------------------------------

        for membership in current_memberships:
            membership.left_on = date.today()
            membership.is_primary = False
            membership.is_group_head = False

        # Close the old primary membership before inserting a new active one.
        db.flush()

        # --------------------------------------------------------
        # CREATE TARGET HOUSEHOLD MEMBERSHIP
        # --------------------------------------------------------

        new_membership = GroupMember(
            customer_group_id=target_group.id,
            customer_id=customer.id,
            relationship_type=relationship_type,
            is_group_head=False,
            is_primary=True,
            joined_on=date.today(),
            left_on=None,
        )

        db.add(new_membership)

        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(new_membership)

    return {
        "message": (
            "Client moved to household successfully"
        ),
        "customer_id": customer.id,
        "group_id": target_group.id,
        "group_name": target_group.group_name,
    }
