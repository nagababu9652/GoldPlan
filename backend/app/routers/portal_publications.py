from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.crm.customer import Customer
from ..models.crm.document import CrmDocument
from ..models.crm.portal_publication import PortalPublication
from ..models.crm.report_snapshot import ReportSnapshot
from ..models.identity.security import AuditLog
from ..services.access import AccessContext, require_employee

router = APIRouter(prefix="/advisors/clients/{customer_id}/portal-publications", tags=["portal-publications"])


class PublicationCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    resource_type: Literal["DOCUMENT", "REPORT"]
    resource_id: int


def customer_for_staff(customer_id: int, context: AccessContext, db: Session):
    customer = db.query(Customer).filter(Customer.id == customer_id,
        Customer.organization_id == context.organization_id,
        Customer.is_active.is_(True), Customer.deleted_at.is_(None)).first()
    if not customer:
        raise HTTPException(404, "Customer not found")
    context.check_customer(customer.id, customer.organization_id)
    return customer


def snapshot_contains_customer(snapshot: ReportSnapshot, customer_id: int) -> bool:
    clients = snapshot.payload.get("financial_summary", {}).get("clients", [])
    return any(isinstance(item, dict) and item.get("customer_id") is not None
        and int(item["customer_id"]) == customer_id for item in clients)


def result(row: PortalPublication):
    return {"id": row.id, "customer_id": row.customer_id,
        "resource_type": row.resource_type, "resource_id": row.resource_id,
        "published_at": row.published_at, "revoked_at": row.revoked_at,
        "status": "REVOKED" if row.revoked_at else "PUBLISHED"}


@router.get("")
def list_publications(customer_id: int, include_revoked: bool = False,
        context: AccessContext = Depends(require_employee), db: Session = Depends(get_db)):
    customer_for_staff(customer_id, context, db)
    allowed_types = []
    if "DOCUMENT.READ" in context.permissions and "DOCUMENT.READ" not in context.denied_permissions:
        allowed_types.append("DOCUMENT")
    if "REPORT.READ" in context.permissions and "REPORT.READ" not in context.denied_permissions:
        allowed_types.append("REPORT")
    if not allowed_types:
        raise HTTPException(403, "Publication read permission required")
    query = db.query(PortalPublication).filter(
        PortalPublication.organization_id == context.organization_id,
        PortalPublication.customer_id == customer_id,
        PortalPublication.resource_type.in_(allowed_types))
    if not include_revoked:
        query = query.filter(PortalPublication.revoked_at.is_(None))
    return [result(row) for row in query.order_by(PortalPublication.published_at.desc()).all()]


@router.post("", status_code=201)
def publish(customer_id: int, payload: PublicationCreate,
        context: AccessContext = Depends(require_employee), db: Session = Depends(get_db)):
    customer_for_staff(customer_id, context, db)
    context.check_permission("DOCUMENT.UPLOAD" if payload.resource_type == "DOCUMENT" else "REPORT.GENERATE")
    if payload.resource_type == "DOCUMENT":
        resource = db.query(CrmDocument).filter(CrmDocument.id == payload.resource_id,
            CrmDocument.organization_id == context.organization_id,
            CrmDocument.customer_id == customer_id, CrmDocument.status == "ACTIVE").first()
        if not resource or not resource.file_url:
            raise HTTPException(404, "Active customer document file not found")
    else:
        resource = db.query(ReportSnapshot).filter(ReportSnapshot.id == payload.resource_id,
            ReportSnapshot.organization_id == context.organization_id,
            ReportSnapshot.is_active.is_(True), ReportSnapshot.deleted_at.is_(None)).first()
        if not resource or not snapshot_contains_customer(resource, customer_id):
            raise HTTPException(404, "Report snapshot not found for customer")
    existing = db.query(PortalPublication).filter(
        PortalPublication.customer_id == customer_id,
        PortalPublication.resource_type == payload.resource_type,
        PortalPublication.resource_id == payload.resource_id,
        PortalPublication.revoked_at.is_(None)).first()
    if existing:
        return result(existing)
    row = PortalPublication(organization_id=context.organization_id, customer_id=customer_id,
        resource_type=payload.resource_type, resource_id=payload.resource_id,
        published_by_user_id=context.user_id)
    db.add(row); db.flush()
    db.add(AuditLog(organization_id=context.organization_id, user_id=context.user_id,
        module_name="CLIENT_PORTAL_ACCESS", table_name="portal_publications", record_id=row.id,
        action="PUBLISH", new_values={"customer_id": customer_id,
            "resource_type": row.resource_type, "resource_id": row.resource_id},
        session_id=context.session_id))
    db.commit(); db.refresh(row)
    return result(row)


@router.post("/{publication_id}/revoke")
def revoke(customer_id: int, publication_id: int,
        context: AccessContext = Depends(require_employee), db: Session = Depends(get_db)):
    customer_for_staff(customer_id, context, db)
    row = db.query(PortalPublication).filter(PortalPublication.id == publication_id,
        PortalPublication.organization_id == context.organization_id,
        PortalPublication.customer_id == customer_id).with_for_update().first()
    if not row:
        raise HTTPException(404, "Publication not found")
    context.check_permission("DOCUMENT.UPLOAD" if row.resource_type == "DOCUMENT" else "REPORT.GENERATE")
    if row.revoked_at is None:
        row.revoked_at = datetime.utcnow(); row.revoked_by_user_id = context.user_id
        db.add(AuditLog(organization_id=context.organization_id, user_id=context.user_id,
            module_name="CLIENT_PORTAL_ACCESS", table_name="portal_publications", record_id=row.id,
            action="REVOKE_PUBLICATION", new_values={"customer_id": customer_id,
                "resource_type": row.resource_type, "resource_id": row.resource_id},
            session_id=context.session_id))
        db.commit(); db.refresh(row)
    return result(row)
