"""Client management routes for advisors."""

from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
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
from ..schemas.compliance import (
    EmployeeOptionResponse, KYCHistoryResponse, KYCResponse, KYCUpdate,
    ServiceTeamCreate, ServiceTeamMemberResponse,
)
from .advisors import get_report_customer_ids, get_report_employee
from ..models.crm.customer import Customer
from ..models.foundation.party import Party
from ..models.organization.employee import Employee
from ..models.organization.assignment import EmployeeAssignment
from ..models.foundation.lookup import LookupValue
from ..models.crm.kyc import CustomerKYC, CustomerKYCHistory
from ..services.party_profile import save_address, save_bank_account, primary_record, lookup_id
from ..services.access import AccessContext, require_employee, require_permission
from ..services.idempotency import reserve_create, finish_create
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
    advisor: AccessContext,
    db: Session,
) -> Employee:
    return get_report_employee(advisor, db)


def get_advisor_customer_ids(
    advisor: AccessContext,
    db: Session,
) -> list[int]:
    return get_report_customer_ids(advisor, db)


def get_assigned_customer(advisor: AccessContext, db: Session, client_id: int) -> tuple[Employee, Customer]:
    employee = get_advisor_employee(advisor, db)
    if client_id not in get_advisor_customer_ids(advisor, db):
        raise HTTPException(404, "Client not found")
    customer = db.query(Customer).filter(
        Customer.id == client_id,
        Customer.organization_id == employee.organization_id,
        Customer.is_active.is_(True),
        Customer.deleted_at.is_(None),
        Customer.customer_status == "ACTIVE",
    ).first()
    if not customer:
        raise HTTPException(404, "Client not found")
    return employee, customer


def save_client_profile(db, customer, party, data):
    save_address(db, party, data)
    save_bank_account(db, party, data)
    if "kyc_status" in data:
        value = _blank_to_none(data["kyc_status"])
        if not value:
            raise HTTPException(422, "KYC status cannot be empty")
        kyc = customer.kyc
        previous = kyc.kyc_status if kyc else None
        if kyc is None:
            kyc = CustomerKYC(customer=customer, kyc_status=value)
            db.add(kyc)
        else:
            kyc.kyc_status = value
        if previous != value:
            db.add(CustomerKYCHistory(customer_id=customer.id, previous_status=previous, new_status=value))


def build_client_response(
    customer: Customer,
    advisor: AccessContext,
) -> ClientResponse:
    party = customer.party

    primary_address = primary_record(party.addresses)
    active_banks = sorted(
        (bank for bank in party.bank_accounts if bank.is_active and bank.deleted_at is None),
        key=lambda bank: bank.id,
    )
    bank = primary_record(active_banks) or next(iter(active_banks), None)

    group_member = None

    if customer.group_members:
        # First preference: the client's primary active household.
        group_member = next(
            (
                member
                for member in customer.group_members
                if (
                    member.left_on is None
                    and member.is_primary
                    and member.group
                    and member.group.group_type in {
                        "HOUSEHOLD",
                        "FAMILY",
                    }
                )
            ),
            None,
        )

        # Fallback: an active HOUSEHOLD/FAMILY membership.
        if group_member is None:
            group_member = next(
                (
                    member
                    for member in customer.group_members
                    if (
                        member.left_on is None
                        and member.group
                        and member.group.group_type in {
                            "HOUSEHOLD",
                            "FAMILY",
                        }
                    )
                ),
                None,
            )

    group = group_member.group if group_member else None

    return ClientResponse(
        id=customer.id,
        advisor_id=advisor.user_id,

        # Party information
        first_name=party.first_name or "",
        last_name=party.last_name or "",
        email=party.email,
        phone=party.mobile_number,
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
        risk_profile=customer.risk_profile,
        investment_experience=None,

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
        country=primary_address.country.country_name if primary_address else None,

        # Nominee
        nominee_name=None,
        nominee_relation=None,
        nominee_contact=None,

        # Bank
        bank_name=bank.bank_name if bank else None,
        account_number=bank.account_number if bank else None,
        ifsc_code=bank.ifsc_code if bank else None,
        account_type=bank.account_type.value_code if bank and bank.account_type else None,

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
    dependencies=[Depends(require_permission("CLIENT.READ"))],
)
def list_clients(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    customer_status: Optional[str] = Query(None),
    risk_profile: Optional[str] = Query(None),
    advisor: AccessContext = Depends(require_employee),
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

    if customer_status:
        query = query.filter(Customer.customer_status == customer_status.strip().upper())

    if risk_profile:
        query = query.filter(Customer.risk_profile == risk_profile.strip().upper())

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
    dependencies=[Depends(require_permission("CLIENT.CREATE"))],
)
def create_client(
    client_data: ClientCreate,
    advisor: AccessContext = Depends(require_employee),
    db: Session = Depends(get_db),
    idempotency_key: str | None = Header(default=None),
):
    employee = get_advisor_employee(advisor, db)
    if employee.organization_id != advisor.organization_id:
        raise HTTPException(status_code=403, detail="Organization access mismatch")
    reservation = reserve_create(
        db, key=idempotency_key, operation="client.create",
        actor_scope=f"org:{advisor.organization_id}:user:{advisor.user_id}",
        payload=client_data.model_dump(mode="json"),
    )
    if reservation and reservation.replay:
        customer = db.query(Customer).filter(
            Customer.id == reservation.resource_id,
            Customer.organization_id == advisor.organization_id,
            Customer.deleted_at.is_(None),
        ).first()
        if customer is None:
            raise HTTPException(404, "Client not found")
        advisor.check_customer(customer.id, customer.organization_id)
        return build_client_response(customer=customer, advisor=advisor)
    active_client_count = db.query(Customer).filter(
        Customer.organization_id == advisor.organization_id,
        Customer.customer_status == "ACTIVE",
        Customer.is_active.is_(True),
        Customer.deleted_at.is_(None),
    ).count()
    advisor.check_limit("LIMIT.CLIENTS", active_client_count)

    gender_id = lookup_id(db, "GENDER", client_data.gender)
    marital_status_id = lookup_id(db, "MARITAL_STATUS", client_data.marital_status)

    try:
        # Create Party
        party = Party(
            organization_id=employee.organization_id,
            party_code=(
                f"P-{advisor.party_id}-"
                f"{db.query(Party).count() + 1:05d}"
            ),
            party_type_id=lookup_id(db, "PARTY_TYPE", "INDIVIDUAL"),
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

        save_client_profile(db, customer, party, client_data.model_dump())

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
            group_type="HOUSEHOLD",
            head_customer_id=customer.id,
            primary_branch_id=employee.branch_id,
            primary_advisor_employee_id=employee.id,
            risk_profile=customer.risk_profile,
        )

        db.add(customer_group)
        db.flush()

        db.add(EmployeeAssignment(
            employee_id=employee.id,
            assignment_type="ADVISOR",
            entity_type="CUSTOMER_GROUP",
            entity_id=customer_group.id,
            effective_from=date.today(),
            is_active=True,
            created_by=advisor.user_id,
        ))

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
        finish_create(db, reservation, customer.id)

        try:
            db.commit()

    
        except IntegrityError as exc:
            db.rollback()
            raise _duplicate_conflict(exc) from exc

        db.expire_all()
        db.refresh(customer)

        return build_client_response(
            customer=customer,
            advisor=advisor,
        )
    except Exception:
        db.rollback()
        raise


@router.get(
    "/{client_id}",
    response_model=ClientResponse,
    dependencies=[Depends(require_permission("CLIENT.READ"))],
)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    advisor: AccessContext = Depends(require_employee),
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
            Customer.organization_id == advisor.organization_id,
            Customer.is_active.is_(True),
            Customer.deleted_at.is_(None),
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
    dependencies=[Depends(require_permission("CLIENT.UPDATE"))],
)
def update_client(
    client_id: int,
    client_data: ClientUpdate,
    db: Session = Depends(get_db),
    advisor: AccessContext = Depends(require_employee),
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
            Customer.organization_id == advisor.organization_id,
            Customer.is_active.is_(True),
            Customer.deleted_at.is_(None),
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found",
        )

    party = customer.party

    update_data = client_data.model_dump(
        exclude_unset=True
    )

    try:
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
                    party.gender_id = lookup_id(db, "GENDER", value)

                elif field == "marital_status":
                    party.marital_status_id = lookup_id(db, "MARITAL_STATUS", value)

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

        save_client_profile(db, customer, party, update_data)

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

        db.expire_all()
        db.refresh(customer)
        db.refresh(party)

        return build_client_response(
            customer=customer,
            advisor=advisor,
        )
    except Exception:
        db.rollback()
        raise


@router.delete(
    "/{client_id}",
    dependencies=[Depends(require_permission("CLIENT.DEACTIVATE"))],
)
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    advisor: AccessContext = Depends(require_employee),
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
            Customer.organization_id == advisor.organization_id,
            Customer.is_active.is_(True),
            Customer.deleted_at.is_(None),
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


@router.get("/{client_id}/kyc", response_model=KYCResponse,
            dependencies=[Depends(require_permission("CLIENT.READ"))])
def get_client_kyc(client_id: int, advisor: AccessContext = Depends(require_employee), db: Session = Depends(get_db)):
    _, customer = get_assigned_customer(advisor, db, client_id)
    kyc = customer.kyc
    return KYCResponse(
        customer_id=customer.id, kyc_status=kyc.kyc_status if kyc else "PENDING",
        kyc_verified_date=kyc.kyc_verified_date if kyc else None,
        kyc_expiry_date=kyc.kyc_expiry_date if kyc else None,
        verification_method=kyc.verification_method if kyc else None,
        verification_reference=kyc.verification_reference if kyc else None,
        politically_exposed_person=bool(kyc and kyc.politically_exposed_person),
        remarks=kyc.remarks if kyc else None,
    )


@router.put("/{client_id}/kyc", response_model=KYCResponse,
            dependencies=[Depends(require_permission("CLIENT.UPDATE"))])
def update_client_kyc(client_id: int, payload: KYCUpdate, advisor: AccessContext = Depends(require_employee), db: Session = Depends(get_db)):
    employee, customer = get_assigned_customer(advisor, db, client_id)
    kyc, previous = customer.kyc, customer.kyc.kyc_status if customer.kyc else None
    if kyc is None:
        kyc = CustomerKYC(customer_id=customer.id, kyc_status=payload.kyc_status)
        db.add(kyc)
    for field, value in payload.model_dump(exclude={"review_reason"}).items():
        setattr(kyc, field, value)
    kyc.updated_at = datetime.utcnow()
    if previous != payload.kyc_status:
        db.add(CustomerKYCHistory(
            customer_id=customer.id, previous_status=previous, new_status=payload.kyc_status,
            reviewed_by=employee.id, review_reason=payload.review_reason,
        ))
    db.commit()
    db.refresh(kyc)
    return get_client_kyc(client_id, advisor, db)


@router.get("/{client_id}/kyc/history", response_model=list[KYCHistoryResponse],
            dependencies=[Depends(require_permission("CLIENT.READ"))])
def get_client_kyc_history(client_id: int, advisor: AccessContext = Depends(require_employee), db: Session = Depends(get_db)):
    get_assigned_customer(advisor, db, client_id)
    return db.query(CustomerKYCHistory).filter(
        CustomerKYCHistory.customer_id == client_id,
    ).order_by(CustomerKYCHistory.reviewed_on.desc(), CustomerKYCHistory.id.desc()).all()


@router.get("/{client_id}/service-team/employees", response_model=list[EmployeeOptionResponse],
            dependencies=[Depends(require_permission("CLIENT.READ"))])
def list_service_team_employees(client_id: int, advisor: AccessContext = Depends(require_employee), db: Session = Depends(get_db)):
    employee = get_advisor_employee(advisor, db)
    get_assigned_customer(advisor, db, client_id)
    employees = db.query(Employee).filter(
        Employee.organization_id == employee.organization_id, Employee.is_active.is_(True),
        Employee.employment_status == "ACTIVE", Employee.deleted_at.is_(None),
    ).order_by(Employee.employee_code.asc()).all()
    party_ids = [item.party_id for item in employees]
    parties = {party.id: party for party in db.query(Party).filter(Party.id.in_(party_ids)).all()} if party_ids else {}
    return [
        EmployeeOptionResponse(
            id=item.id,
            display_name=parties[item.party_id].display_name if item.party_id in parties else item.employee_code,
            employee_code=item.employee_code,
        ) for item in employees
    ]


@router.get("/{client_id}/service-team", response_model=list[ServiceTeamMemberResponse],
            dependencies=[Depends(require_permission("CLIENT.READ"))])
def get_client_service_team(client_id: int, advisor: AccessContext = Depends(require_employee), db: Session = Depends(get_db)):
    _, customer = get_assigned_customer(advisor, db, client_id)
    assignments = db.query(EmployeeAssignment).filter(
        EmployeeAssignment.entity_type == "CUSTOMER", EmployeeAssignment.entity_id == customer.id,
        EmployeeAssignment.is_active.is_(True), EmployeeAssignment.deleted_at.is_(None),
        EmployeeAssignment.effective_from <= date.today(),
        or_(EmployeeAssignment.effective_to.is_(None), EmployeeAssignment.effective_to >= date.today()),
    ).all()
    employees = {item.id: item for item in db.query(Employee).filter(
        Employee.id.in_([a.employee_id for a in assignments]),
        Employee.organization_id == advisor.organization_id,
        Employee.is_active.is_(True), Employee.employment_status == "ACTIVE",
        Employee.deleted_at.is_(None),
    ).all()} if assignments else {}
    assignments = [assignment for assignment in assignments if assignment.employee_id in employees]
    party_ids = [item.party_id for item in employees.values()]
    parties = {party.id: party for party in db.query(Party).filter(Party.id.in_(party_ids)).all()} if party_ids else {}
    return [
        ServiceTeamMemberResponse(
            assignment_id=a.id, employee_id=a.employee_id,
            employee_name=parties[employees[a.employee_id].party_id].display_name if a.employee_id in employees and employees[a.employee_id].party_id in parties else str(a.employee_id),
            role=a.assignment_type, effective_from=a.effective_from, remarks=a.remarks,
        ) for a in assignments
    ]


@router.post("/{client_id}/service-team", response_model=ServiceTeamMemberResponse, status_code=201,
             dependencies=[Depends(require_permission("CLIENT.UPDATE"))])
def add_client_service_team_member(client_id: int, payload: ServiceTeamCreate, advisor: AccessContext = Depends(require_employee), db: Session = Depends(get_db)):
    employee, customer = get_assigned_customer(advisor, db, client_id)
    member = db.query(Employee).filter(
        Employee.id == payload.employee_id, Employee.organization_id == employee.organization_id,
        Employee.is_active.is_(True), Employee.employment_status == "ACTIVE",
        Employee.deleted_at.is_(None),
    ).first()
    if not member:
        raise HTTPException(404, "Employee not found")
    existing = db.query(EmployeeAssignment).filter(
        EmployeeAssignment.employee_id == member.id, EmployeeAssignment.entity_type == "CUSTOMER",
        EmployeeAssignment.entity_id == customer.id, EmployeeAssignment.assignment_type == payload.role,
        EmployeeAssignment.is_active.is_(True), EmployeeAssignment.deleted_at.is_(None),
        EmployeeAssignment.effective_from <= date.today(),
        or_(EmployeeAssignment.effective_to.is_(None), EmployeeAssignment.effective_to >= date.today()),
    ).first()
    if existing:
        raise HTTPException(409, "Employee already has this service role")
    assignment = EmployeeAssignment(
        employee_id=member.id, entity_type="CUSTOMER", entity_id=customer.id,
        assignment_type=payload.role, effective_from=date.today(), remarks=payload.remarks,
        created_by=advisor.user_id,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return next(item for item in get_client_service_team(client_id, advisor, db) if item.assignment_id == assignment.id)


@router.delete("/{client_id}/service-team/{assignment_id}", status_code=204,
               dependencies=[Depends(require_permission("CLIENT.UPDATE"))])
def remove_client_service_team_member(client_id: int, assignment_id: int, advisor: AccessContext = Depends(require_employee), db: Session = Depends(get_db)):
    _, customer = get_assigned_customer(advisor, db, client_id)
    assignment = db.query(EmployeeAssignment).filter(
        EmployeeAssignment.id == assignment_id, EmployeeAssignment.entity_type == "CUSTOMER",
        EmployeeAssignment.entity_id == customer.id, EmployeeAssignment.is_active.is_(True),
        EmployeeAssignment.deleted_at.is_(None),
    ).first()
    if not assignment:
        raise HTTPException(404, "Service-team assignment not found")
    if assignment.assignment_type == "ADVISOR":
        raise HTTPException(409, "The primary advisor assignment cannot be removed here")
    assignment.is_active = False
    assignment.effective_to = date.today()
    assignment.deleted_at = datetime.utcnow()
    assignment.deleted_by = advisor.user_id
    db.commit()
    return None
