"""Client management routes for advisors."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional

from ..database.session import get_db
from ..models.client import Client
from ..models.group import Group
from ..schemas.client import ClientCreate, ClientUpdate, ClientResponse, ClientListResponse
from .advisors import get_current_advisor
from ..models.user import User

router = APIRouter(prefix="/advisors/clients", tags=["advisor-clients"])


@router.get("/", response_model=ClientListResponse)
def list_clients(
    search: Optional[str] = Query(None, description="Search by name, email, phone, or PAN"),
    group_id: Optional[int] = Query(None, description="Filter by group ID"),
    kyc_status: Optional[str] = Query(None, description="Filter by KYC status"),
    risk_profile: Optional[str] = Query(None, description="Filter by risk profile"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """List all clients for the current advisor with optional filtering."""
    query = db.query(Client).filter(Client.advisor_id == advisor.id)

    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Client.first_name.ilike(search_term),
                Client.last_name.ilike(search_term),
                Client.email.ilike(search_term),
                Client.phone.ilike(search_term),
                Client.pan_number.ilike(search_term),
            )
        )
    if group_id is not None:
        query = query.filter(Client.group_id == group_id)
    if kyc_status:
        query = query.filter(Client.kyc_status == kyc_status)
    if risk_profile:
        query = query.filter(Client.risk_profile == risk_profile)
    if is_active is not None:
        query = query.filter(Client.is_active == is_active)

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    clients = query.order_by(Client.created_at.desc()).offset(offset).limit(page_size).all()

    # Build response with group name
    client_responses = []
    for client in clients:
        group_name = None
        if client.group_id:
            group = db.query(Group).filter(Group.id == client.group_id).first()
            if group:
                group_name = group.name

        client_data = ClientResponse(
            id=client.id,
            advisor_id=client.advisor_id,
            first_name=client.first_name,
            last_name=client.last_name,
            email=client.email,
            phone=client.phone,
            alternate_phone=client.alternate_phone,
            date_of_birth=client.date_of_birth,
            age=client.age,
            gender=client.gender,
            marital_status=client.marital_status,
            occupation=client.occupation,
            pan_number=client.pan_number,
            aadhar_number=client.aadhar_number,
            address_line1=client.address_line1,
            address_line2=client.address_line2,
            city=client.city,
            state=client.state,
            pincode=client.pincode,
            country=client.country,
            annual_income=client.annual_income,
            net_worth=client.net_worth,
            risk_profile=client.risk_profile,
            investment_experience=client.investment_experience,
            financial_goals=client.financial_goals,
            nominee_name=client.nominee_name,
            nominee_relation=client.nominee_relation,
            nominee_contact=client.nominee_contact,
            bank_name=client.bank_name,
            account_number=client.account_number,
            ifsc_code=client.ifsc_code,
            account_type=client.account_type,
            kyc_status=client.kyc_status,
            kyc_document_url=client.kyc_document_url,
            notes=client.notes,
            group_id=client.group_id,
            is_active=client.is_active,
            assigned_date=client.assigned_date,
            created_at=client.created_at,
            updated_at=client.updated_at,
            group_name=group_name,
        )
        client_responses.append(client_data)

    return ClientListResponse(clients=client_responses, total=total, page=page, page_size=page_size)


@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    client_data: ClientCreate,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """Create a new client for the current advisor."""
    # Validate group_id if provided
    if client_data.group_id:
        group = db.query(Group).filter(
            Group.id == client_data.group_id,
            Group.advisor_id == advisor.id
        ).first()
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found or does not belong to you",
            )

    db_client = Client(
        advisor_id=advisor.id,
        **client_data.model_dump(),
    )
    db.add(db_client)
    db.commit()
    db.refresh(db_client)

    # Get group name
    group_name = None
    if db_client.group_id:
        group = db.query(Group).filter(Group.id == db_client.group_id).first()
        if group:
            group_name = group.name

    return ClientResponse(
        id=db_client.id,
        advisor_id=db_client.advisor_id,
        first_name=db_client.first_name,
        last_name=db_client.last_name,
        email=db_client.email,
        phone=db_client.phone,
        alternate_phone=db_client.alternate_phone,
        date_of_birth=db_client.date_of_birth,
        age=db_client.age,
        gender=db_client.gender,
        marital_status=db_client.marital_status,
        occupation=db_client.occupation,
        pan_number=db_client.pan_number,
        aadhar_number=db_client.aadhar_number,
        address_line1=db_client.address_line1,
        address_line2=db_client.address_line2,
        city=db_client.city,
        state=db_client.state,
        pincode=db_client.pincode,
        country=db_client.country,
        annual_income=db_client.annual_income,
        net_worth=db_client.net_worth,
        risk_profile=db_client.risk_profile,
        investment_experience=db_client.investment_experience,
        financial_goals=db_client.financial_goals,
        nominee_name=db_client.nominee_name,
        nominee_relation=db_client.nominee_relation,
        nominee_contact=db_client.nominee_contact,
        bank_name=db_client.bank_name,
        account_number=db_client.account_number,
        ifsc_code=db_client.ifsc_code,
        account_type=db_client.account_type,
        kyc_status=db_client.kyc_status,
        kyc_document_url=db_client.kyc_document_url,
        notes=db_client.notes,
        group_id=db_client.group_id,
        is_active=db_client.is_active,
        assigned_date=db_client.assigned_date,
        created_at=db_client.created_at,
        updated_at=db_client.updated_at,
        group_name=group_name,
    )


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """Get a single client by ID."""
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.advisor_id == advisor.id
    ).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    group_name = None
    if client.group_id:
        group = db.query(Group).filter(Group.id == client.group_id).first()
        if group:
            group_name = group.name

    return ClientResponse(
        id=client.id,
        advisor_id=client.advisor_id,
        first_name=client.first_name,
        last_name=client.last_name,
        email=client.email,
        phone=client.phone,
        alternate_phone=client.alternate_phone,
        date_of_birth=client.date_of_birth,
        age=client.age,
        gender=client.gender,
        marital_status=client.marital_status,
        occupation=client.occupation,
        pan_number=client.pan_number,
        aadhar_number=client.aadhar_number,
        address_line1=client.address_line1,
        address_line2=client.address_line2,
        city=client.city,
        state=client.state,
        pincode=client.pincode,
        country=client.country,
        annual_income=client.annual_income,
        net_worth=client.net_worth,
        risk_profile=client.risk_profile,
        investment_experience=client.investment_experience,
        financial_goals=client.financial_goals,
        nominee_name=client.nominee_name,
        nominee_relation=client.nominee_relation,
        nominee_contact=client.nominee_contact,
        bank_name=client.bank_name,
        account_number=client.account_number,
        ifsc_code=client.ifsc_code,
        account_type=client.account_type,
        kyc_status=client.kyc_status,
        kyc_document_url=client.kyc_document_url,
        notes=client.notes,
        group_id=client.group_id,
        is_active=client.is_active,
        assigned_date=client.assigned_date,
        created_at=client.created_at,
        updated_at=client.updated_at,
        group_name=group_name,
    )


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: int,
    client_data: ClientUpdate,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """Update a client's information."""
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.advisor_id == advisor.id
    ).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    # Validate group_id if provided
    if client_data.group_id is not None:
        group = db.query(Group).filter(
            Group.id == client_data.group_id,
            Group.advisor_id == advisor.id
        ).first()
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found or does not belong to you",
            )

    # Update only provided fields
    update_data = client_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)

    db.commit()
    db.refresh(client)

    group_name = None
    if client.group_id:
        group = db.query(Group).filter(Group.id == client.group_id).first()
        if group:
            group_name = group.name

    return ClientResponse(
        id=client.id,
        advisor_id=client.advisor_id,
        first_name=client.first_name,
        last_name=client.last_name,
        email=client.email,
        phone=client.phone,
        alternate_phone=client.alternate_phone,
        date_of_birth=client.date_of_birth,
        age=client.age,
        gender=client.gender,
        marital_status=client.marital_status,
        occupation=client.occupation,
        pan_number=client.pan_number,
        aadhar_number=client.aadhar_number,
        address_line1=client.address_line1,
        address_line2=client.address_line2,
        city=client.city,
        state=client.state,
        pincode=client.pincode,
        country=client.country,
        annual_income=client.annual_income,
        net_worth=client.net_worth,
        risk_profile=client.risk_profile,
        investment_experience=client.investment_experience,
        financial_goals=client.financial_goals,
        nominee_name=client.nominee_name,
        nominee_relation=client.nominee_relation,
        nominee_contact=client.nominee_contact,
        bank_name=client.bank_name,
        account_number=client.account_number,
        ifsc_code=client.ifsc_code,
        account_type=client.account_type,
        kyc_status=client.kyc_status,
        kyc_document_url=client.kyc_document_url,
        notes=client.notes,
        group_id=client.group_id,
        is_active=client.is_active,
        assigned_date=client.assigned_date,
        created_at=client.created_at,
        updated_at=client.updated_at,
        group_name=group_name,
    )


@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    """Soft-delete a client (set is_active to False)."""
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.advisor_id == advisor.id
    ).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    client.is_active = False
    db.commit()
    return {"message": "Client deactivated successfully"}