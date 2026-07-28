"""Group/Family management routes for advisors."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from ..database.session import get_db
from ..schemas.group import GroupCreate, GroupUpdate, GroupResponse, GroupListResponse, GroupMemberAction
from .advisors import get_current_advisor
from ..models.identity.auth import User

router = APIRouter(prefix="/advisors/groups", tags=["advisor-groups"])


@router.get("/", response_model=GroupListResponse)
def list_groups(
    group_type: Optional[str] = Query(None, description="Filter by group type"),
    search: Optional[str] = Query(None, description="Search by name"),
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """List all groups for the current advisor."""
    query = db.query(Group).filter(Group.advisor_id == advisor.id)

    if group_type:
        query = query.filter(Group.group_type == group_type)
    if search:
        query = query.filter(Group.name.ilike(f"%{search}%"))

    groups = query.order_by(Group.created_at.desc()).all()

    # Build response with client count and head client name
    group_responses = []
    for group in groups:
        client_count = db.query(Client).filter(Client.group_id == group.id).count()
        head_client_name = None
        if group.head_client_id:
            head_client = db.query(Client).filter(Client.id == group.head_client_id).first()
            if head_client:
                head_client_name = f"{head_client.first_name} {head_client.last_name}"

        group_responses.append(GroupResponse(
            id=group.id,
            advisor_id=group.advisor_id,
            name=group.name,
            group_type=group.group_type,
            description=group.description,
            email=group.email,
            phone=group.phone,
            address=group.address,
            city=group.city,
            state=group.state,
            head_client_id=group.head_client_id,
            is_active=group.is_active,
            total_investment=group.total_investment,
            client_count=client_count,
            head_client_name=head_client_name,
            created_at=group.created_at,
            updated_at=group.updated_at,
        ))

    return GroupListResponse(groups=group_responses, total=len(group_responses))


@router.post("/", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(
    group_data: GroupCreate,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """Create a new group/family."""
    # Validate head_client_id if provided
    if group_data.head_client_id:
        client = db.query(Client).filter(
            Client.id == group_data.head_client_id,
            Client.advisor_id == advisor.id
        ).first()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Head client not found or does not belong to you",
            )

    db_group = Group(
        advisor_id=advisor.id,
        **group_data.model_dump(),
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)

    # If head client is set, assign them to this group
    if group_data.head_client_id:
        client = db.query(Client).filter(Client.id == group_data.head_client_id).first()
        if client:
            client.group_id = db_group.id
            db.commit()

    client_count = db.query(Client).filter(Client.group_id == db_group.id).count()
    head_client_name = None
    if db_group.head_client_id:
        head_client = db.query(Client).filter(Client.id == db_group.head_client_id).first()
        if head_client:
            head_client_name = f"{head_client.first_name} {head_client.last_name}"

    return GroupResponse(
        id=db_group.id,
        advisor_id=db_group.advisor_id,
        name=db_group.name,
        group_type=db_group.group_type,
        description=db_group.description,
        email=db_group.email,
        phone=db_group.phone,
        address=db_group.address,
        city=db_group.city,
        state=db_group.state,
        head_client_id=db_group.head_client_id,
        is_active=db_group.is_active,
        total_investment=db_group.total_investment,
        client_count=client_count,
        head_client_name=head_client_name,
        created_at=db_group.created_at,
        updated_at=db_group.updated_at,
    )


@router.get("/{group_id}", response_model=GroupResponse)
def get_group(
    group_id: int,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """Get a single group with its member clients."""
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.advisor_id == advisor.id
    ).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    client_count = db.query(Client).filter(Client.group_id == group.id).count()
    head_client_name = None
    if group.head_client_id:
        head_client = db.query(Client).filter(Client.id == group.head_client_id).first()
        if head_client:
            head_client_name = f"{head_client.first_name} {head_client.last_name}"

    return GroupResponse(
        id=group.id,
        advisor_id=group.advisor_id,
        name=group.name,
        group_type=group.group_type,
        description=group.description,
        email=group.email,
        phone=group.phone,
        address=group.address,
        city=group.city,
        state=group.state,
        head_client_id=group.head_client_id,
        is_active=group.is_active,
        total_investment=group.total_investment,
        client_count=client_count,
        head_client_name=head_client_name,
        created_at=group.created_at,
        updated_at=group.updated_at,
    )


@router.put("/{group_id}", response_model=GroupResponse)
def update_group(
    group_id: int,
    group_data: GroupUpdate,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """Update a group's information."""
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.advisor_id == advisor.id
    ).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    # Validate head_client_id if provided
    if group_data.head_client_id is not None:
        client = db.query(Client).filter(
            Client.id == group_data.head_client_id,
            Client.advisor_id == advisor.id
        ).first()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Head client not found or does not belong to you",
            )

    update_data = group_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(group, field, value)

    db.commit()
    db.refresh(group)

    client_count = db.query(Client).filter(Client.group_id == group.id).count()
    head_client_name = None
    if group.head_client_id:
        head_client = db.query(Client).filter(Client.id == group.head_client_id).first()
        if head_client:
            head_client_name = f"{head_client.first_name} {head_client.last_name}"

    return GroupResponse(
        id=group.id,
        advisor_id=group.advisor_id,
        name=group.name,
        group_type=group.group_type,
        description=group.description,
        email=group.email,
        phone=group.phone,
        address=group.address,
        city=group.city,
        state=group.state,
        head_client_id=group.head_client_id,
        is_active=group.is_active,
        total_investment=group.total_investment,
        client_count=client_count,
        head_client_name=head_client_name,
        created_at=group.created_at,
        updated_at=group.updated_at,
    )


@router.delete("/{group_id}")
def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """Delete a group and unassign its clients."""
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.advisor_id == advisor.id
    ).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    # Unassign all clients from this group
    db.query(Client).filter(Client.group_id == group.id).update(
        {Client.group_id: None}
    )

    db.delete(group)
    db.commit()
    return {"message": "Group deleted successfully"}


@router.post("/{group_id}/clients")
def assign_client_to_group(
    group_id: int,
    body: GroupMemberAction,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """Assign a client to a group."""
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.advisor_id == advisor.id
    ).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    client = db.query(Client).filter(
        Client.id == body.client_id,
        Client.advisor_id == advisor.id
    ).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    client.group_id = group_id
    db.commit()
    return {"message": f"Client assigned to group '{group.name}' successfully"}


@router.delete("/{group_id}/clients/{client_id}")
def remove_client_from_group(
    group_id: int,
    client_id: int,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """Remove a client from a group."""
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.advisor_id == advisor.id
    ).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    client = db.query(Client).filter(
        Client.id == client_id,
        Client.advisor_id == advisor.id,
        Client.group_id == group_id
    ).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found in this group",
        )

    # Clear head of family if this client was the head
    if group.head_client_id == client_id:
        group.head_client_id = None

    client.group_id = None
    db.commit()
    return {"message": "Client removed from group successfully"}


@router.put("/{group_id}/head")
def set_group_head(
    group_id: int,
    body: GroupMemberAction,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """Set the head of family for a group."""
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.advisor_id == advisor.id
    ).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )

    client = db.query(Client).filter(
        Client.id == body.client_id,
        Client.advisor_id == advisor.id
    ).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    # Assign client to group if not already
    if client.group_id != group_id:
        client.group_id = group_id

    group.head_client_id = client_id
    db.commit()
    return {"message": f"Head of family set to {client.first_name} {client.last_name}"}