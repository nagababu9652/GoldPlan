from datetime import datetime, date, time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
from sqlalchemy import or_
from sqlalchemy.orm import Session
from pathlib import Path
from uuid import uuid4
from ...database.session import get_db
from app.models.crm.customer import Customer, CustomerGroup
from app.models.crm.document import CrmDocument
from app.models.organization.employee import Employee
from app.models.organization.assignment import EmployeeAssignment
from ...routers.advisors import get_current_advisor as get_current_user
from app.schemas.document import (
    DocumentCreate,
    DocumentListResponse,
    DocumentResponse,
    DocumentUpdate,
)


router = APIRouter(
    prefix="/documents",
    tags=["Advisor Documents"],
)

UPLOAD_ROOT = Path(__file__).resolve().parents[3] / "uploads" / "documents"

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".csv",
    ".txt",
}

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB


def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def validate_upload_file(filename: str) -> None:
    extension = get_file_extension(filename)

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type '{extension}'. "
                f"Allowed types: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            ),
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
            detail="Active advisor employee record not found.",
        )

    return employee


def validate_document_target(
    db: Session,
    employee: Employee,
    customer_id: Optional[int],
    customer_group_id: Optional[int],
):
    if (customer_id is None) == (customer_group_id is None):
        raise HTTPException(
            status_code=400,
            detail="Exactly one document owner is required.",
        )

    if customer_id:
        customer = (
            db.query(Customer)
            .filter(
                Customer.id == customer_id,
                Customer.organization_id == employee.organization_id,
            )
            .first()
        )
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found.")
        today = date.today()
        group_ids = [row.customer_group_id for row in customer.group_members if row.left_on is None]
        groups = db.query(CustomerGroup).filter(CustomerGroup.id.in_(group_ids)).all() if group_ids else []
        branch_ids = [group.primary_branch_id for group in groups if group.primary_branch_id is not None]
        assignment = db.query(EmployeeAssignment).filter(
            EmployeeAssignment.employee_id == employee.id,
            EmployeeAssignment.assignment_type == "ADVISOR",
            or_(
                (EmployeeAssignment.entity_type == "CUSTOMER") & (EmployeeAssignment.entity_id == customer_id),
                (EmployeeAssignment.entity_type == "CUSTOMER_GROUP") & (EmployeeAssignment.entity_id.in_(group_ids or [-1])),
                (EmployeeAssignment.entity_type == "BRANCH") & (EmployeeAssignment.entity_id.in_(branch_ids or [-1])),
            ),
            EmployeeAssignment.effective_from <= today,
            (EmployeeAssignment.effective_to.is_(None) | (EmployeeAssignment.effective_to >= today)),
            EmployeeAssignment.is_active.is_(True),
        ).first()
        if not assignment:
            raise HTTPException(
                status_code=404,
                detail="Customer not found.",
            )

    if customer_group_id:
        group = (
            db.query(CustomerGroup)
            .filter(
                CustomerGroup.id == customer_group_id,
                CustomerGroup.organization_id == employee.organization_id,
            )
            .first()
        )

        if not group:
            raise HTTPException(
                status_code=404,
                detail="Customer group not found.",
            )
        today = date.today()
        assignment = db.query(EmployeeAssignment).filter(
            EmployeeAssignment.employee_id == employee.id,
            EmployeeAssignment.assignment_type == "ADVISOR",
            or_(
                (EmployeeAssignment.entity_type == "CUSTOMER_GROUP") & (EmployeeAssignment.entity_id == group.id),
                (EmployeeAssignment.entity_type == "BRANCH") & (EmployeeAssignment.entity_id == group.primary_branch_id),
            ),
            EmployeeAssignment.effective_from <= today,
            (EmployeeAssignment.effective_to.is_(None) | (EmployeeAssignment.effective_to >= today)),
            EmployeeAssignment.is_active.is_(True),
        ).first()
        if not assignment:
            raise HTTPException(404, "Customer group not found.")


def build_document_response(
    document: CrmDocument,
) -> DocumentResponse:
    customer_name = None
    group_name = None

    if document.customer and document.customer.party:
        customer_name = (
            document.customer.party.display_name
            or " ".join(
                part
                for part in [
                    document.customer.party.first_name,
                    document.customer.party.middle_name,
                    document.customer.party.last_name,
                ]
                if part
            ).strip()
            or None
        )

    if document.customer_group:
        group_name = document.customer_group.group_name

    return DocumentResponse(
        id=document.id,
        organization_id=document.organization_id,
        uploaded_by_employee_id=document.uploaded_by_employee_id,
        document_type=document.document_type,
        document_name=document.document_name,
        description=document.description,
        file_name=document.file_name,
        file_url=f"/advisors/documents/{document.id}/download" if document.file_url else None,
        file_type=document.file_type,
        file_size=document.file_size,
        status=document.status,
        notes=document.notes,
        customer_id=document.customer_id,
        customer_group_id=document.customer_group_id,
        customer_name=customer_name,
        group_name=group_name,
        created_at=document.created_at,
        updated_at=document.updated_at,
    )


@router.get(
    "/",
    response_model=DocumentListResponse,
)
def list_documents(
    search: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    document_type: Optional[str] = Query(default=None),
    customer_id: Optional[int] = Query(default=None),
    customer_group_id: Optional[int] = Query(default=None),
    from_date: Optional[date] = Query(default=None),
    to_date: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(db, current_user)

    query = (
        db.query(CrmDocument)
        .filter(
            CrmDocument.organization_id == employee.organization_id,
        )
    )

    if search:
        value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                CrmDocument.document_name.ilike(value),
                CrmDocument.document_type.ilike(value),
                CrmDocument.description.ilike(value),
                CrmDocument.file_name.ilike(value),
                CrmDocument.notes.ilike(value),
            )
        )

    if status:
        query = query.filter(
            CrmDocument.status == status
        )

    if document_type:
        query = query.filter(
            CrmDocument.document_type == document_type
        )

    if customer_id:
        query = query.filter(
            CrmDocument.customer_id == customer_id
        )

    if customer_group_id:
        query = query.filter(
            CrmDocument.customer_group_id == customer_group_id
        )

    if from_date:
        from_datetime = datetime.combine(
            from_date,
            time.min,
        )

        query = query.filter(
            CrmDocument.created_at >= from_datetime
        )

    if to_date:
        to_datetime = datetime.combine(
            to_date,
            time.max,
        )

        query = query.filter(
            CrmDocument.created_at <= to_datetime
        )

    documents = (
        query
        .order_by(CrmDocument.created_at.desc())
        .all()
    )

    accessible = []
    for document in documents:
        try:
            validate_document_target(db, employee, document.customer_id, document.customer_group_id)
            accessible.append(document)
        except HTTPException:
            continue
    return DocumentListResponse(
        documents=[
            build_document_response(document)
            for document in accessible
        ],
        total=len(accessible),
    )


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    request: Request,
    customer_id: Optional[int] = Form(None),
    customer_group_id: Optional[int] = Form(None),
    document_type: str = Form(...),
    description: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(db, current_user)

    validate_document_target(db, employee, customer_id, customer_group_id)

    customer = None
    customer_group = None

    if customer_id:
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
                status_code=404,
                detail="Customer not found.",
            )

    if customer_group_id:
        customer_group = (
            db.query(CustomerGroup)
            .filter(
                CustomerGroup.id == customer_group_id,
                CustomerGroup.organization_id == employee.organization_id,
            )
            .first()
        )

        if not customer_group:
            raise HTTPException(
                status_code=404,
                detail="Customer group not found.",
            )

    # ---------------------------------------------------------
    # Validate filename
    # ---------------------------------------------------------
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must have a filename.",
        )

    validate_upload_file(file.filename)

    # ---------------------------------------------------------
    # Read file
    # ---------------------------------------------------------
    file_content = await file.read()

    if not file_content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size cannot exceed 25 MB.",
        )

    # ---------------------------------------------------------
    # Create storage directory
    # ---------------------------------------------------------
    today = datetime.utcnow()

    storage_dir = (
        UPLOAD_ROOT
        
    )

    storage_dir.mkdir(parents=True, exist_ok=True)

    # ---------------------------------------------------------
    # Generate unique stored filename
    # ---------------------------------------------------------
    extension = get_file_extension(file.filename)
    stored_filename = f"{uuid4().hex}{extension}"

    stored_path = storage_dir / stored_filename

    # ---------------------------------------------------------
    # Save file
    # ---------------------------------------------------------
    stored_path.write_bytes(file_content)

    # URL exposed by FastAPI StaticFiles
    relative_file_path = stored_path.relative_to(UPLOAD_ROOT.parent)
    file_url = "/uploads/" + relative_file_path.as_posix()


    # ---------------------------------------------------------
    # Create database record
    # ---------------------------------------------------------
    document = CrmDocument(
        organization_id=employee.organization_id,
        customer_id=customer_id,
        customer_group_id=customer_group_id,
        uploaded_by_employee_id=employee.id,
        document_type=document_type,
        document_name=file.filename,
        description=description,
        file_name=file.filename,
        file_url=file_url,
        file_type=file.content_type,
        file_size=len(file_content),
        status="ACTIVE",
        notes=notes,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    # ---------------------------------------------------------
    # Build response
    # ---------------------------------------------------------
    return build_document_response(document)

@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(db, current_user)

    document = (
        db.query(CrmDocument)
        .filter(
            CrmDocument.id == document_id,
            CrmDocument.organization_id == employee.organization_id,
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )
    validate_document_target(db, employee, document.customer_id, document.customer_group_id)

    return build_document_response(document)


@router.get("/{document_id}/download")
def download_document(document_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    employee = get_advisor_employee(db, current_user)
    document = db.query(CrmDocument).filter(
        CrmDocument.id == document_id,
        CrmDocument.organization_id == employee.organization_id,
    ).first()
    if not document or not document.file_url:
        raise HTTPException(404, "Document not found.")
    validate_document_target(db, employee, document.customer_id, document.customer_group_id)
    path = (UPLOAD_ROOT / Path(document.file_url).name).resolve()
    if UPLOAD_ROOT.resolve() not in path.parents or not path.is_file():
        raise HTTPException(404, "Document file not found.")
    return FileResponse(path, media_type=document.file_type, filename=document.file_name or document.document_name)


@router.post(
    "/",
    response_model=DocumentResponse,
)
def create_document(
    payload: DocumentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(db, current_user)

    validate_document_target(
        db=db,
        employee=employee,
        customer_id=payload.customer_id,
        customer_group_id=payload.customer_group_id,
    )

    document = CrmDocument(
        organization_id=employee.organization_id,
        uploaded_by_employee_id=employee.id,
        document_type=payload.document_type,
        document_name=payload.document_name,
        description=payload.description,
        file_name=payload.file_name,
        file_url=payload.file_url,
        file_type=payload.file_type,
        file_size=payload.file_size,
        status=payload.status,
        notes=payload.notes,
        customer_id=payload.customer_id,
        customer_group_id=payload.customer_group_id,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return build_document_response(document)


@router.put(
    "/{document_id}",
    response_model=DocumentResponse,
)
def update_document(
    document_id: int,
    payload: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(db, current_user)

    document = (
        db.query(CrmDocument)
        .filter(
            CrmDocument.id == document_id,
            CrmDocument.organization_id == employee.organization_id,
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )
    validate_document_target(db, employee, document.customer_id, document.customer_group_id)

    update_data = payload.model_dump(
        exclude_unset=True
    )

    new_customer_id = update_data.get("customer_id")
    new_group_id = update_data.get("customer_group_id")

    effective_customer_id = update_data.get("customer_id", document.customer_id)
    effective_group_id = update_data.get("customer_group_id", document.customer_group_id)
    validate_document_target(db, employee, effective_customer_id, effective_group_id)

    if (
        new_customer_id is not None
        and new_group_id is not None
    ):
        raise HTTPException(
            status_code=400,
            detail="Provide either customer_id or customer_group_id, not both.",
        )

    if new_customer_id is not None:
        customer = (
            db.query(Customer)
            .filter(
                Customer.id == new_customer_id,
                Customer.organization_id == employee.organization_id,
            )
            .first()
        )

        if not customer:
            raise HTTPException(
                status_code=404,
                detail="Customer not found.",
            )

    if new_group_id is not None:
        group = (
            db.query(CustomerGroup)
            .filter(
                CustomerGroup.id == new_group_id,
                CustomerGroup.organization_id == employee.organization_id,
            )
            .first()
        )

        if not group:
            raise HTTPException(
                status_code=404,
                detail="Customer group not found.",
            )

    for field, value in update_data.items():
        setattr(document, field, value)

    db.commit()
    db.refresh(document)

    return build_document_response(document)


@router.post(
    "/{document_id}/archive",
    response_model=DocumentResponse,
)
def archive_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    employee = get_advisor_employee(db, current_user)

    document = (
        db.query(CrmDocument)
        .filter(
            CrmDocument.id == document_id,
            CrmDocument.organization_id == employee.organization_id,
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )
    validate_document_target(db, employee, document.customer_id, document.customer_group_id)

    document.status = "ARCHIVED"

    db.commit()
    db.refresh(document)

    return build_document_response(document)
