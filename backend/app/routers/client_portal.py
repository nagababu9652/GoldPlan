import csv
from io import StringIO
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.crm.customer import Customer, CustomerGroup, GroupMember
from ..models.crm.financial_account import FinancialAccount
from ..models.crm.goal import FinancialGoal
from ..models.crm.holding import Holding
from ..models.crm.document import CrmDocument
from ..models.crm.portal_publication import PortalPublication
from ..models.crm.report_snapshot import ReportSnapshot
from ..models.crm.transaction import Transaction
from ..models.crm.message import Message
from ..models.organization.employee import Employee
from ..models.foundation.party import Party
from ..services.access import AccessContext, require_client, require_permission

router = APIRouter(prefix="/client-portal", tags=["client-portal"])
DOCUMENT_ROOT = Path(__file__).resolve().parents[2] / "uploads" / "documents"


def current_customer(context: AccessContext, db: Session):
    row = db.query(Customer).filter(
        Customer.id == context.customer_id,
        Customer.organization_id == context.organization_id,
        Customer.is_active.is_(True), Customer.deleted_at.is_(None),
    ).first()
    if not row:
        raise HTTPException(404, "Active customer not found")
    return row


def customer_party(customer: Customer, db: Session):
    row = db.query(Party).filter(Party.id == customer.party_id,
        Party.deleted_at.is_(None)).first()
    if not row:
        raise HTTPException(409, "Customer Party record is missing")
    return row


@router.get("/dashboard", dependencies=[Depends(require_permission("PORTAL.PROFILE.READ"))])
def dashboard(context: AccessContext = Depends(require_client), db: Session = Depends(get_db)):
    customer = current_customer(context, db)
    party = customer_party(customer, db)
    goal_count = db.query(func.count(FinancialGoal.id)).filter(
        FinancialGoal.customer_id == customer.id, FinancialGoal.is_active.is_(True),
        FinancialGoal.deleted_at.is_(None)).scalar() or 0
    account_count = db.query(func.count(FinancialAccount.id)).filter(
        FinancialAccount.customer_id == customer.id, FinancialAccount.is_active.is_(True),
        FinancialAccount.deleted_at.is_(None)).scalar() or 0
    return {"customer_id": customer.id, "display_name": party.display_name,
        "customer_code": customer.customer_code, "email": party.email,
        "mobile_number": party.mobile_number, "goal_count": goal_count,
        "account_count": account_count}


@router.get("/profile", dependencies=[Depends(require_permission("PORTAL.PROFILE.READ"))])
def profile(context: AccessContext = Depends(require_client), db: Session = Depends(get_db)):
    customer = current_customer(context, db)
    party = customer_party(customer, db)
    return {"customer_id": customer.id, "customer_code": customer.customer_code,
        "display_name": party.display_name, "first_name": party.first_name,
        "middle_name": party.middle_name, "last_name": party.last_name,
        "email": party.email, "mobile_number": party.mobile_number,
        "date_of_birth": party.date_of_birth, "occupation": customer.occupation,
        "resident_status": customer.resident_status}


@router.get("/goals", dependencies=[Depends(require_permission("PORTAL.GOAL.READ"))])
def goals(context: AccessContext = Depends(require_client), db: Session = Depends(get_db)):
    customer = current_customer(context, db)
    rows = db.query(FinancialGoal).filter(
        FinancialGoal.customer_id == customer.id, FinancialGoal.is_active.is_(True),
        FinancialGoal.deleted_at.is_(None),
    ).order_by(FinancialGoal.priority, FinancialGoal.target_date).all()
    return [{"id": row.id, "title": row.title, "goal_type": row.goal_type,
        "target_amount": row.target_amount, "current_amount": row.current_amount,
        "target_date": row.target_date, "priority": row.priority, "status": row.status}
        for row in rows]


@router.get("/investments", dependencies=[Depends(require_permission("PORTAL.INVESTMENT.READ"))])
def investments(context: AccessContext = Depends(require_client), db: Session = Depends(get_db)):
    customer = current_customer(context, db)
    accounts = db.query(FinancialAccount).filter(
        FinancialAccount.customer_id == customer.id, FinancialAccount.is_active.is_(True),
        FinancialAccount.deleted_at.is_(None),
    ).order_by(FinancialAccount.account_name).all()
    account_ids = [row.id for row in accounts]
    holdings = db.query(Holding).filter(
        Holding.financial_account_id.in_(account_ids), Holding.is_active.is_(True),
        Holding.deleted_at.is_(None),
    ).order_by(Holding.security_name).all() if account_ids else []
    by_account = {}
    for row in holdings:
        by_account.setdefault(row.financial_account_id, []).append({
            "id": row.id, "security_type": row.security_type,
            "security_name": row.security_name, "symbol": row.symbol,
            "quantity": row.quantity, "average_cost": row.average_cost,
            "current_price": row.current_price, "valuation_as_of": row.valuation_as_of,
        })
    return [{"id": row.id, "account_type": row.account_type,
        "account_nature": row.account_nature, "account_name": row.account_name,
        "institution_name": row.institution_name,
        "account_number_masked": row.account_number_masked,
        "currency_code": row.currency_code, "current_balance": row.current_balance,
        "valuation_as_of": row.valuation_as_of, "status": row.status,
        "holdings": by_account.get(row.id, [])} for row in accounts]


@router.get("/transactions", dependencies=[Depends(require_permission("PORTAL.TRANSACTION.READ"))])
def transactions(context: AccessContext = Depends(require_client), db: Session = Depends(get_db)):
    customer = current_customer(context, db)
    rows = db.query(Transaction).filter(
        Transaction.customer_id == customer.id, Transaction.is_active.is_(True),
        Transaction.deleted_at.is_(None),
    ).order_by(Transaction.transaction_date.desc(), Transaction.id.desc()).limit(250).all()
    return [{"id": row.id, "transaction_date": row.transaction_date,
        "transaction_type": row.transaction_type, "amount": row.amount,
        "description": row.description, "status": row.status,
        "reference_number": row.reference_number} for row in rows]


@router.get("/household", dependencies=[Depends(require_permission("PORTAL.HOUSEHOLD.READ"))])
def household(context: AccessContext = Depends(require_client), db: Session = Depends(get_db)):
    customer = current_customer(context, db)
    membership = db.query(GroupMember).join(
        CustomerGroup, CustomerGroup.id == GroupMember.customer_group_id,
    ).filter(GroupMember.customer_id == customer.id, GroupMember.left_on.is_(None),
        CustomerGroup.organization_id == context.organization_id,
        CustomerGroup.group_type.in_(("HOUSEHOLD", "FAMILY")),
        CustomerGroup.is_active.is_(True), CustomerGroup.deleted_at.is_(None)).first()
    if not membership:
        return None
    group = membership.group
    rows = db.query(GroupMember, Customer, Party).join(
        Customer, Customer.id == GroupMember.customer_id,
    ).join(Party, Party.id == Customer.party_id).filter(
        GroupMember.customer_group_id == group.id, GroupMember.left_on.is_(None),
        Customer.is_active.is_(True), Customer.deleted_at.is_(None),
    ).order_by(GroupMember.is_group_head.desc(), Party.display_name).all()
    return {"id": group.id, "group_name": group.group_name, "group_type": group.group_type,
        "members": [{"customer_id": member.customer_id, "display_name": party.display_name,
            "relationship_type": member.relationship_type,
            "is_group_head": member.is_group_head} for member, _, party in rows]}


def active_publication(db: Session, context: AccessContext, resource_type: str, resource_id: int):
    row = db.query(PortalPublication).filter(
        PortalPublication.organization_id == context.organization_id,
        PortalPublication.customer_id == context.customer_id,
        PortalPublication.resource_type == resource_type,
        PortalPublication.resource_id == resource_id,
        PortalPublication.revoked_at.is_(None)).first()
    if not row:
        raise HTTPException(404, "Published resource not found")
    return row


@router.get("/documents", dependencies=[Depends(require_permission("PORTAL.DOCUMENT.READ"))])
def documents(context: AccessContext = Depends(require_client), db: Session = Depends(get_db)):
    rows = db.query(CrmDocument, PortalPublication).join(PortalPublication,
        (PortalPublication.resource_id == CrmDocument.id) &
        (PortalPublication.resource_type == "DOCUMENT")).filter(
        PortalPublication.organization_id == context.organization_id,
        PortalPublication.customer_id == context.customer_id,
        PortalPublication.revoked_at.is_(None),
        CrmDocument.organization_id == context.organization_id,
        CrmDocument.customer_id == context.customer_id,
        CrmDocument.status == "ACTIVE").order_by(PortalPublication.published_at.desc()).all()
    return [{"id": document.id, "publication_id": publication.id,
        "document_type": document.document_type, "document_name": document.document_name,
        "description": document.description, "file_name": document.file_name,
        "file_type": document.file_type, "file_size": document.file_size,
        "published_at": publication.published_at} for document, publication in rows]


@router.get("/documents/{document_id}/download", dependencies=[Depends(require_permission("PORTAL.DOCUMENT.READ"))])
def download_document(document_id: int, context: AccessContext = Depends(require_client), db: Session = Depends(get_db)):
    active_publication(db, context, "DOCUMENT", document_id)
    document = db.query(CrmDocument).filter(CrmDocument.id == document_id,
        CrmDocument.organization_id == context.organization_id,
        CrmDocument.customer_id == context.customer_id,
        CrmDocument.status == "ACTIVE").first()
    if not document or not document.file_url:
        raise HTTPException(404, "Document file not found")
    path = (DOCUMENT_ROOT / Path(document.file_url).name).resolve()
    if DOCUMENT_ROOT.resolve() not in path.parents or not path.is_file():
        raise HTTPException(404, "Document file not found")
    return FileResponse(path, media_type=document.file_type,
        filename=document.file_name or document.document_name)


def customer_report(snapshot: ReportSnapshot, customer_id: int):
    summary = snapshot.payload.get("financial_summary", {})
    client = next((item for item in summary.get("clients", []) if isinstance(item, dict)
        and item.get("customer_id") is not None and int(item["customer_id"]) == customer_id), None)
    if not client:
        raise HTTPException(404, "Published report not found")
    return {"id": snapshot.id, "title": snapshot.title, "report_type": snapshot.report_type,
        "report_date": snapshot.report_date, "period_start": snapshot.period_start,
        "period_end": snapshot.period_end, "created_at": snapshot.created_at,
        "assumptions": snapshot.assumptions, "client": client}


@router.get("/reports", dependencies=[Depends(require_permission("PORTAL.REPORT.READ"))])
def reports(context: AccessContext = Depends(require_client), db: Session = Depends(get_db)):
    rows = db.query(ReportSnapshot, PortalPublication).join(PortalPublication,
        (PortalPublication.resource_id == ReportSnapshot.id) &
        (PortalPublication.resource_type == "REPORT")).filter(
        PortalPublication.organization_id == context.organization_id,
        PortalPublication.customer_id == context.customer_id,
        PortalPublication.revoked_at.is_(None),
        ReportSnapshot.organization_id == context.organization_id,
        ReportSnapshot.is_active.is_(True), ReportSnapshot.deleted_at.is_(None),
    ).order_by(ReportSnapshot.report_date.desc(), PortalPublication.published_at.desc()).all()
    return [{**customer_report(snapshot, context.customer_id),
        "publication_id": publication.id, "published_at": publication.published_at}
        for snapshot, publication in rows]


@router.get("/reports/{report_id}", dependencies=[Depends(require_permission("PORTAL.REPORT.READ"))])
def report(report_id: int, context: AccessContext = Depends(require_client), db: Session = Depends(get_db)):
    active_publication(db, context, "REPORT", report_id)
    snapshot = db.query(ReportSnapshot).filter(ReportSnapshot.id == report_id,
        ReportSnapshot.organization_id == context.organization_id,
        ReportSnapshot.is_active.is_(True), ReportSnapshot.deleted_at.is_(None)).first()
    if not snapshot:
        raise HTTPException(404, "Published report not found")
    return customer_report(snapshot, context.customer_id)


@router.get("/reports/{report_id}/download", dependencies=[Depends(require_permission("PORTAL.REPORT.READ"))])
def download_report(report_id: int, context: AccessContext = Depends(require_client), db: Session = Depends(get_db)):
    active_publication(db, context, "REPORT", report_id)
    snapshot = db.query(ReportSnapshot).filter(ReportSnapshot.id == report_id,
        ReportSnapshot.organization_id == context.organization_id,
        ReportSnapshot.is_active.is_(True), ReportSnapshot.deleted_at.is_(None)).first()
    if not snapshot:
        raise HTTPException(404, "Published report not found")
    stored = customer_report(snapshot, context.customer_id)
    output = StringIO(); writer = csv.writer(output)
    writer.writerow([snapshot.title]); writer.writerow(["Report date", snapshot.report_date])
    writer.writerow(["Period", snapshot.period_start, snapshot.period_end]); writer.writerow([])
    writer.writerow(["Metric", "Amount"])
    client = stored["client"]
    for key in ("assets", "liabilities", "net_worth", "invested_value", "current_value",
                "unrealized_gain", "goal_funding", "goal_target"):
        writer.writerow([key.replace("_", " ").title(), client.get(key, 0)])
    writer.writerow([]); writer.writerow(["Calculation assumptions"])
    for key, value in snapshot.assumptions.items():
        writer.writerow([key.replace("_", " ").title(), ", ".join(value) if isinstance(value, list) else value])
    filename = f"financial-report-{snapshot.id}-{snapshot.report_date}.csv"
    return Response(output.getvalue(), media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@router.get("/messages", dependencies=[Depends(require_permission("PORTAL.MESSAGE.READ"))])
def messages(context: AccessContext = Depends(require_client), db: Session = Depends(get_db)):
    memberships = db.query(GroupMember.customer_group_id).join(
        CustomerGroup, CustomerGroup.id == GroupMember.customer_group_id,
    ).filter(GroupMember.customer_id == context.customer_id, GroupMember.left_on.is_(None),
        CustomerGroup.organization_id == context.organization_id,
        CustomerGroup.group_type.in_(("HOUSEHOLD", "FAMILY")),
        CustomerGroup.is_active.is_(True), CustomerGroup.deleted_at.is_(None)).all()
    group_ids = [row[0] for row in memberships]
    target = (Message.customer_id == context.customer_id)
    if group_ids:
        target = target | (Message.customer_group_id.in_(group_ids))
    rows = db.query(Message, Party).join(Employee,
        Employee.id == Message.sender_employee_id).join(Party,
        Party.id == Employee.party_id).filter(
        Message.organization_id == context.organization_id, target,
        Message.status.in_(("SENT", "READ")),
    ).order_by(Message.sent_at.desc()).limit(250).all()
    return [{"id": message.id, "message_type": message.message_type,
        "subject": message.subject, "body": message.body, "status": message.status,
        "sent_at": message.sent_at, "sender_name": party.display_name}
        for message, party in rows]
