"""Client management routes for advisors."""

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..schemas.client import (
    ClientCreate,
    ClientUpdate,
    ClientResponse,
    ClientListResponse,
)
from .advisors import get_current_advisor
from ..models.identity.auth import User
from ..models.crm.customer import Customer
from ..models.foundation.party import Party
from ..models.organization.employee import Employee
from ..models.organization.assignment import EmployeeAssignment
from ..models.foundation.lookup import LookupValue
from ..models.foundation.party import PartyAddress
from ..models.foundation.geography import City, State
from ..models.crm.customer import CustomerGroup, GroupMember

router = APIRouter(
    prefix="/advisors/clients",
    tags=["advisor-clients"],
)


def _blank_to_none(value):
    """Store empty/whitespace-only strings as NULL.

    The UI form submits "" for fields the user left blank. Writing "" to
    unique columns (e.g. foundation.parties.uq_party_pan) makes every
    blank record collide with the next one.
    """
    if isinstance(value, str):
        stripped = value.strip()
        return stripped or None

    return value


def _duplicate_conflict(exc: IntegrityError) -> HTTPException:
    """Map a unique-constraint violation to a friendly 409 response."""
    constraint = (
        getattr(getattr(exc.orig, "diag", None), "constraint_name", "")
        or ""
    )

    if "pan" in constraint:
        detail = "A client with this PAN number already exists."
    else:
        detail = "A client with these details already exists."

    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=detail,
    )


def get_advisor_employee(
    advisor: User,
    db: Session,
) -> Employee:
    employee = (
        db.query(Employee)
        .filter(
            Employee.party_id == advisor.party_id,
            Employee.is_active.is_(True),
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advisor employee record not found",
        )

    return employee


def get_advisor_customer_ids(
    advisor: User,
    db: Session,
) -> list[int]:
    employee = get_advisor_employee(advisor, db)

    today = date.today()

    assignments = (
        db.query(EmployeeAssignment.entity_id)
        .filter(
            EmployeeAssignment.employee_id == employee.id,
            EmployeeAssignment.assignment_type == "ADVISOR",
            EmployeeAssignment.entity_type == "CUSTOMER",
            EmployeeAssignment.effective_from <= today,
            (
                (EmployeeAssignment.effective_to.is_(None))
                | (EmployeeAssignment.effective_to >= today)
            ),
            EmployeeAssignment.is_active.is_(True),
        )
        .all()
    )

    return [row.entity_id for row in assignments]


def build_client_response(
    customer: Customer,
    advisor: User,
) -> ClientResponse:
    party = customer.party

    primary_address = next(
        (
            address
            for address in party.addresses
            if address.is_primary and address.deleted_at is None
        ),
        None,
    )
    latest_risk_profile = None

    if customer.risk_profiles:
        latest_risk_profile = max(
            customer.risk_profiles,
            key=lambda profile: (
                profile.assessed_on
                or date.min
            ),
        )

    group_member = None

    if customer.group_members:
        group_member = next(
            (
                member
                for member in customer.group_members
                if member.left_on is None
            ),
            None,
        )

    group = group_member.group if group_member else None

    return ClientResponse(
        id=customer.id,
        advisor_id=advisor.id,

        # Party information
        first_name=party.first_name or "",
        last_name=party.last_name or "",
        email=party.email,
        phone=next(
            (
                contact.contact_value
                for contact in party.contacts
                if contact.contact_type_id == 14
                and contact.is_primary
                and contact.deleted_at is None
            ),
            party.mobile_number,
        ),
        alternate_phone=party.alternate_mobile,
        date_of_birth=party.date_of_birth,
        age=(
            date.today().year
            - party.date_of_birth.year
            - (
                (date.today().month, date.today().day)
                < (party.date_of_birth.month, party.date_of_birth.day)
            )
            if party.date_of_birth
            else None
        ),
        gender=(
            party.gender.value_name
            if party.gender
            else None
        ),
        marital_status=(
            party.marital_status.value_name
            if party.marital_status
            else None
        ),

        # Customer information
        occupation=customer.occupation,
        annual_income=customer.annual_income,
        net_worth=customer.net_worth,
        risk_profile=(
            latest_risk_profile.risk_profile
            if latest_risk_profile
            else customer.risk_profile
        ),
        investment_experience=None,
        financial_goals=None,

        # Identity
        pan_number=party.pan_number,
        aadhar_number=party.aadhaar_number,

        # Address
        address_line1=(
            primary_address.address_line1
            if primary_address
            else None
        ),
        address_line2=(
            primary_address.address_line2
            if primary_address
            else None
        ),
        city=(
            primary_address.city.city_name
            if primary_address and primary_address.city
            else None
        ),
        state=(
            primary_address.state.state_name
            if primary_address and primary_address.state
            else None
        ),
        pincode=(
            primary_address.postal_code
            if primary_address
            else None
        ),
        country="India",

        # Nominee
        nominee_name=None,
        nominee_relation=None,
        nominee_contact=None,

        # Bank
        bank_name=(
            customer.party.bank_accounts[0].bank_name
            if customer.party.bank_accounts
            else None
        ),
        account_number=(
            customer.party.bank_accounts[0].account_number
            if customer.party.bank_accounts
            else None
        ),
        ifsc_code=(
            customer.party.bank_accounts[0].ifsc_code
            if customer.party.bank_accounts
            else None
        ),
        account_type=None,

        # KYC
        kyc_status=(
            customer.kyc.kyc_status
            if customer.kyc
            else None
        ),
        kyc_verified_date=(
            customer.kyc.kyc_verified_date
            if customer.kyc
            else None
        ),
        kyc_document_url=None,

        # CRM
        notes=customer.remarks,
        group_id=group.id if group else None,
        group_name=group.group_name if group else None,

        # Actual customer fields
        customer_code=customer.customer_code,
        status=customer.customer_status,
        resident_status=customer.resident_status,
        onboarding_date=customer.onboarding_date,

        # Audit
        is_active=customer.is_active,
        assigned_date=None,
        created_at=customer.created_at,
        updated_at=customer.updated_at,
    )


@router.get(
    "",
    response_model=ClientListResponse,
)
def list_clients(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    advisor: User = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    customer_ids = get_advisor_customer_ids(advisor, db)

    if not customer_ids:
        return ClientListResponse(
            clients=[],
            total=0,
            page=page,
            page_size=page_size,
        )

    query = (
        db.query(Customer)
        .join(
            Party,
            Customer.party_id == Party.id,
        )
        .filter(
            Customer.id.in_(customer_ids),
            Customer.is_active.is_(True),
        )
    )

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                Party.first_name.ilike(search_value),
                Party.last_name.ilike(search_value),
                Party.display_name.ilike(search_value),
                Party.email.ilike(search_value),
                Party.mobile_number.ilike(search_value),
                Customer.customer_code.ilike(search_value),
            )
        )

    total = query.count()

    customers = (
        query
        .order_by(Customer.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    clients = [
        build_client_response(
            customer=customer,
            advisor=advisor,
        )
        for customer in customers
    ]

    return ClientListResponse(
        clients=clients,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post(
    "",
    response_model=ClientResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_client(
    client_data: ClientCreate,
    advisor: User = Depends(get_current_advisor),
    db: Session = Depends(get_db),
):
    employee = get_advisor_employee(advisor, db)

    # Create Party
    # Resolve lookup values
    gender_id = None
    if client_data.gender:
        gender_id = (
            db.query(LookupValue.id)
            .filter(
                LookupValue.category_id == 1,
                LookupValue.value_code == client_data.gender.upper(),
            )
            .scalar()
        )

    marital_status_id = None
    if client_data.marital_status:
        marital_status_id = (
            db.query(LookupValue.id)
            .filter(
                LookupValue.category_id == 2,
                LookupValue.value_code == client_data.marital_status.upper(),
            )
            .scalar()
        )

    # Create Party
    party = Party(
        organization_id=employee.organization_id,
        party_code=(
            f"P-{advisor.party_id}-"
            f"{db.query(Party).count() + 1:05d}"
        ),
        party_type_id=19,  # INDIVIDUAL
        first_name=client_data.first_name,
        last_name=client_data.last_name,
        display_name=(
            f"{client_data.first_name} "
            f"{client_data.last_name}"
        ).strip(),
        date_of_birth=client_data.date_of_birth,
        gender_id=gender_id,
        marital_status_id=marital_status_id,
        pan_number=_blank_to_none(client_data.pan_number),
        aadhaar_number=_blank_to_none(client_data.aadhar_number),
        email=_blank_to_none(client_data.email),
        mobile_number=_blank_to_none(client_data.phone),
        alternate_mobile=_blank_to_none(client_data.alternate_phone),
        remarks=_blank_to_none(client_data.notes),
    )

    db.add(party)

    try:
        db.flush()
    except IntegrityError as exc:
        db.rollback()
        raise _duplicate_conflict(exc) from exc

    # Create Customer
    customer = Customer(
        organization_id=employee.organization_id,
        party_id=party.id,
        customer_code=(
            f"C-{db.query(Customer).count() + 1:05d}"
        ),
        occupation=_blank_to_none(client_data.occupation),
        annual_income=client_data.annual_income,
        net_worth=client_data.net_worth,
        risk_profile=_blank_to_none(client_data.risk_profile),
        onboarding_date=date.today(),
        customer_status="ACTIVE",
        remarks=_blank_to_none(client_data.notes),
    )

    db.add(customer)
    db.flush()

    # Create primary address
    if client_data.address_line1:
        city_id = None

        if client_data.city:
            city_id = (
                db.query(City.id)
                .filter(City.city_name.ilike(client_data.city))
                .scalar()
            )

        state_id = None

        if client_data.state:
            state_id = (
                db.query(State.id)
                .filter(State.state_name.ilike(client_data.state))
                .scalar()
            )

        if city_id and state_id:
            address = PartyAddress(
                party_id=party.id,
                address_type_id=8,  # HOME / Residential
                address_line1=client_data.address_line1,
                address_line2=client_data.address_line2,
                city_id=city_id,
                state_id=state_id,
                country_id=1,  # India
                postal_code=client_data.pincode,
                is_primary=True,
                remarks="Created during client onboarding",
            )

            db.add(address)

            
    # Assign customer to advisor
    assignment = EmployeeAssignment(
        employee_id=employee.id,
        assignment_type="ADVISOR",
        entity_type="CUSTOMER",
        entity_id=customer.id,
        effective_from=date.today(),
        is_primary=True,
        is_active=True,
    )

    db.add(assignment)

    # Create initial household/group
    customer_group = CustomerGroup(
        organization_id=employee.organization_id,
        group_code=f"G-{customer.id:05d}",
        group_name=(
            f"{party.display_name} Household"
        ),
        group_type="INDIVIDUAL",
        head_customer_id=customer.id,
        primary_branch_id=employee.branch_id,
        primary_advisor_employee_id=employee.id,
        risk_profile=customer.risk_profile,
    )

    db.add(customer_group)
    db.flush()

    # Add the new client as the primary household member
    group_member = GroupMember(
        customer_group_id=customer_group.id,
        customer_id=customer.id,
        relationship_type="SELF",
        is_group_head=True,
        is_primary=True,
        joined_on=date.today(),
    )

    db.add(group_member)

    try:
        db.commit()

    
    except IntegrityError as exc:
        db.rollback()
        raise _duplicate_conflict(exc) from exc

    db.refresh(customer)

    return build_client_response(
        customer=customer,
        advisor=advisor,
    )


@router.get(
    "/{client_id}",
    response_model=ClientResponse,
)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    customer_ids = get_advisor_customer_ids(
        advisor,
        db,
    )

    customer = (
        db.query(Customer)
        .join(
            Party,
            Customer.party_id == Party.id,
        )
        .filter(
            Customer.id == client_id,
            Customer.id.in_(customer_ids),
            Customer.is_active.is_(True),
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    return build_client_response(
        customer=customer,
        advisor=advisor,
    )


@router.put(
    "/{client_id}",
    response_model=ClientResponse,
)
def update_client(
    client_id: int,
    client_data: ClientUpdate,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    customer_ids = get_advisor_customer_ids(
        advisor,
        db,
    )

    customer = (
        db.query(Customer)
        .join(
            Party,
            Customer.party_id == Party.id,
        )
        .filter(
            Customer.id == client_id,
            Customer.id.in_(customer_ids),
            Customer.is_active.is_(True),
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    party = customer.party

    primary_address = next(
    (
        address
        for address in party.addresses
        if address.is_primary and address.deleted_at is None
    ),
    None,
)

    update_data = client_data.model_dump(
        exclude_unset=True
    )

    # The UI submits "" for cleared fields; keep NULL in the database so
    # blank unique columns (pan_number) never collide with each other.
    for field in (
        "email",
        "phone",
        "alternate_phone",
        "pan_number",
        "aadhar_number",
        "notes",
        "occupation",
        "risk_profile",
        "gender",
        "marital_status",
    ):
        if field in update_data:
            update_data[field] = _blank_to_none(
                update_data[field]
            )

    # Party fields
    party_fields = {
        "first_name",
        "last_name",
        "email",
        "phone",
        "alternate_phone",
        "date_of_birth",
        "gender",
        "marital_status",
        "pan_number",
        "aadhar_number",
        "notes",
    }

    # Customer fields
    customer_fields = {
        "occupation",
        "annual_income",
        "net_worth",
        "risk_profile",
        "is_active",
    }

    for field, value in update_data.items():

        if field in party_fields:
            if field == "phone":
                setattr(party, "mobile_number", value)

            elif field == "alternate_phone":
                setattr(party, "alternate_mobile", value)

            elif field == "aadhar_number":
                setattr(party, "aadhaar_number", value)

            elif field == "gender":
                party.gender_id = (
                    db.query(LookupValue.id)
                    .filter(
                        LookupValue.category_id == 1,
                        LookupValue.value_code == value.upper(),
                    )
                    .scalar()
                    if value
                    else None
                )

            elif field == "marital_status":
                party.marital_status_id = (
                    db.query(LookupValue.id)
                    .filter(
                        LookupValue.category_id == 2,
                        LookupValue.value_code == value.upper(),
                    )
                    .scalar()
                    if value
                    else None
                )

            elif field == "notes":
                setattr(party, "remarks", value)
                customer.remarks = value

            elif field == "first_name":
                party.first_name = value

            elif field == "last_name":
                party.last_name = value

            else:
                setattr(party, field, value)

        elif field in customer_fields:
            setattr(customer, field, value)

    # Keep display name synchronized
    if (
        "first_name" in update_data
        or "last_name" in update_data
    ):
        customer.party.display_name = (
            f"{party.first_name or ''} "
            f"{party.last_name or ''}"
        ).strip()

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise _duplicate_conflict(exc) from exc

    db.refresh(customer)
    db.refresh(party)

    return build_client_response(
        customer=customer,
        advisor=advisor,
    )


@router.delete(
    "/{client_id}",
)
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    advisor: User = Depends(get_current_advisor),
):
    customer_ids = get_advisor_customer_ids(
        advisor,
        db,
    )

    customer = (
        db.query(Customer)
        .filter(
            Customer.id == client_id,
            Customer.id.in_(customer_ids),
            Customer.is_active.is_(True),
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    customer.is_active = False

    db.commit()

    return {
        "message": "Client deactivated successfully"
    }