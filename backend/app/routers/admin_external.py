from datetime import date
from hashlib import sha256
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.foundation.party import Party
from ..models.foundation.document import Document, DocumentFile, DocumentType
from ..models.identity.security import AuditLog
from ..models.organization.core import Branch
from ..models.organization.employee import Employee
from ..models.organization.external import Agency, Associate, ArnHolder, ArnStatusHistory
from ..models.crm.customer import Customer
from ..schemas.bulk_status import BulkStatusChange
from ..schemas.external_organization import (AgencyCreate, AgencyResponse, AgencyUpdate,
    ArnCreate, ArnResponse, ArnStatusChange, ArnStatusHistoryResponse, ArnUpdate, AssociateCreate,
    AssociateResponse, AssociateUpdate)
from ..services.access import AccessContext, require_head, require_permission
from ..services.party_profile import lookup_id
from ..services.idempotency import reserve_create, finish_create

router=APIRouter(prefix="/admin/organization",tags=["admin-external-organization"])
ARN_UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "uploads" / "arn"
ARN_DOCUMENT_TYPES = {"ARN_REGISTRATION", "ARN_RENEWAL", "ARN_SUPPORTING"}
ARN_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ARN_MAX_BYTES = 10 * 1024 * 1024
def deps(code):return [Depends(require_head),Depends(require_permission(code))]
def scoped(db,model,row_id,org):
    row=db.query(model).filter(model.id==row_id,model.organization_id==org,model.deleted_at.is_(None)).first()
    if not row:raise HTTPException(404,"Record not found")
    return row
def branch(db,row_id,org):
    if row_id is not None and not db.query(Branch.id).filter(Branch.id==row_id,Branch.organization_id==org,Branch.is_active.is_(True),Branch.deleted_at.is_(None)).first():raise HTTPException(422,"Active branch not found")
def audit(db,ctx,table,row_id,action,new=None):db.add(AuditLog(organization_id=ctx.organization_id,user_id=ctx.user_id,module_name="EXTERNAL_ORGANIZATION",table_name=table,record_id=row_id,action=action,new_values=new,session_id=ctx.session_id))
def organization_party(db,party_id,org,*,backfill=False):
    row=db.query(Party).filter(Party.id==party_id,Party.is_active.is_(True),Party.deleted_at.is_(None)).first()
    if not row:return None
    if row.organization_id==org:return row
    if row.organization_id is not None:return None
    linked=(db.query(Employee.id).filter(Employee.party_id==party_id,Employee.organization_id==org).first()
        or db.query(Customer.id).filter(Customer.party_id==party_id,Customer.organization_id==org).first()
        or db.query(Agency.id).filter(Agency.party_id==party_id,Agency.organization_id==org).first()
        or db.query(Associate.id).filter(Associate.party_id==party_id,Associate.organization_id==org).first())
    if not linked:return None
    if backfill:row.organization_id=org
    return row
def party(db,ctx,payload,kind,code):
    company=kind=="COMPANY";row=Party(organization_id=ctx.organization_id,party_code=f"{code}-{ctx.organization_id}",party_type_id=lookup_id(db,"PARTY_TYPE",kind),display_name=payload.name,legal_name=payload.legal_name,first_name=None if company else payload.name,pan_number=payload.pan,gst_number=getattr(payload,"gstin",None),email=str(payload.email) if payload.email else None,mobile_number=payload.mobile_number,created_by=ctx.user_id,updated_by=ctx.user_id);db.add(row);db.flush();return row
def agency_out(row):
    p=row.party
    if p is None or p.organization_id not in {None,row.organization_id} or p.deleted_at is not None:
        raise HTTPException(409,"Agency Party record is missing or belongs to another organization")
    return AgencyResponse.model_validate({**{c.name:getattr(row,c.name) for c in Agency.__table__.columns},"name":p.display_name,"legal_name":p.legal_name,"pan":p.pan_number,"gstin":p.gst_number,"email":p.email,"mobile_number":p.mobile_number})
def associate_out(row):
    p=row.party
    if p is None or p.organization_id not in {None,row.organization_id} or p.deleted_at is not None:
        raise HTTPException(409,"Associate Party record is missing or belongs to another organization")
    return AssociateResponse.model_validate({**{c.name:getattr(row,c.name) for c in Associate.__table__.columns},"name":p.display_name,"legal_name":p.legal_name,"pan":p.pan_number,"email":p.email,"mobile_number":p.mobile_number})
def arn_out(row):
    p=row.holder_party
    if p is None or p.organization_id not in {None,row.organization_id} or p.deleted_at is not None:
        raise HTTPException(409,"ARN holder Party record is missing or belongs to another organization")
    return ArnResponse.model_validate({**{c.name:getattr(row,c.name) for c in ArnHolder.__table__.columns},"holder_name":p.display_name})

@router.get("/agencies",response_model=list[AgencyResponse],dependencies=deps("ORG.AGENCY.READ"))
def agencies(include_inactive:bool=False,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):
    q=db.query(Agency).filter(Agency.organization_id==context.organization_id,Agency.deleted_at.is_(None));q=q if include_inactive else q.filter(Agency.is_active.is_(True));return [agency_out(x) for x in q.order_by(Agency.agency_code).all()]
@router.post("/agencies",response_model=AgencyResponse,status_code=201,dependencies=deps("ORG.AGENCY.CREATE"))
def create_agency(payload:AgencyCreate,context:AccessContext=Depends(require_head),db:Session=Depends(get_db),
                  idempotency_key:str|None=Header(default=None)):
    reservation=reserve_create(db,key=idempotency_key,operation="agency.create",
        actor_scope=f"org:{context.organization_id}:user:{context.user_id}",payload=payload.model_dump(mode="json"))
    if reservation and reservation.replay:return agency_out(scoped(db,Agency,reservation.resource_id,context.organization_id))
    code=payload.agency_code.strip().upper();branch(db,payload.branch_id,context.organization_id)
    if payload.primary_contact_party_id is not None and not organization_party(db,payload.primary_contact_party_id,context.organization_id,backfill=True):raise HTTPException(422,"Active primary contact Party not found")
    if db.query(Agency.id).filter(Agency.organization_id==context.organization_id,Agency.agency_code==code).first():raise HTTPException(409,"Agency code already exists")
    p=party(db,context,payload,"COMPANY",f"AGY-{code}");row=Agency(organization_id=context.organization_id,party_id=p.id,agency_code=code,registration_number=payload.registration_number,branch_id=payload.branch_id,primary_contact_party_id=payload.primary_contact_party_id,start_date=payload.start_date,status="ACTIVE",remarks=payload.remarks,created_by=context.user_id,updated_by=context.user_id);db.add(row);db.flush();audit(db,context,"agencies",row.id,"CREATE",{"agency_code":code});finish_create(db,reservation,row.id);db.commit();db.refresh(row);return agency_out(row)
@router.put("/agencies/{row_id}",response_model=AgencyResponse,dependencies=deps("ORG.AGENCY.UPDATE"))
def update_agency(row_id:int,payload:AgencyUpdate,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):
    row=scoped(db,Agency,row_id,context.organization_id);values=payload.model_dump(exclude_unset=True);branch(db,values.get("branch_id",row.branch_id),context.organization_id);p=row.party
    if values.get("primary_contact_party_id") is not None and not organization_party(db,values["primary_contact_party_id"],context.organization_id,backfill=True):raise HTTPException(422,"Active primary contact Party not found")
    for key,target in {"name":"display_name","legal_name":"legal_name","pan":"pan_number","gstin":"gst_number","email":"email","mobile_number":"mobile_number"}.items():
        if key in values:
            value=values.pop(key);setattr(p,target,str(value) if key=="email" and value else value)
    for key,value in values.items():setattr(row,key,value)
    row.updated_by=context.user_id;p.updated_by=context.user_id;audit(db,context,"agencies",row.id,"UPDATE",payload.model_dump(exclude_unset=True,mode="json"));db.commit();db.refresh(row);return agency_out(row)
def agency_active(row_id,active,context,db):
    row=scoped(db,Agency,row_id,context.organization_id);row.is_active=active;row.status="ACTIVE" if active else "INACTIVE";row.end_date=None if active else date.today();audit(db,context,"agencies",row.id,"REACTIVATE" if active else "DEACTIVATE");db.commit();db.refresh(row);return agency_out(row)
@router.post("/agencies/{row_id}/deactivate",response_model=AgencyResponse,dependencies=deps("ORG.AGENCY.DEACTIVATE"))
def deactivate_agency(row_id:int,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):return agency_active(row_id,False,context,db)
@router.post("/agencies/{row_id}/reactivate",response_model=AgencyResponse,dependencies=deps("ORG.AGENCY.UPDATE"))
def reactivate_agency(row_id:int,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):return agency_active(row_id,True,context,db)


def bulk_change_active(db: Session, context: AccessContext, model, ids: list[int], active: bool):
    rows = (db.query(model).filter(
        model.id.in_(ids), model.organization_id == context.organization_id,
        model.deleted_at.is_(None),
    ).with_for_update().all())
    if len(rows) != len(ids):
        raise HTTPException(404, "One or more records were not found in this organization")
    updated_ids = []
    for row in rows:
        if row.is_active == active:
            continue
        updated_ids.append(row.id)
        row.is_active = active
        row.status = "ACTIVE" if active else "INACTIVE"
        row.end_date = None if active else date.today()
        row.updated_by = context.user_id
        audit(db, context, model.__tablename__, row.id,
              "REACTIVATE" if active else "DEACTIVATE", {"is_active": active, "bulk": True})
    db.commit()
    return {"updated_ids": updated_ids}


@router.post("/agencies/bulk-deactivate", dependencies=deps("ORG.AGENCY.DEACTIVATE"))
def bulk_deactivate_agencies(payload: BulkStatusChange, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return bulk_change_active(db, context, Agency, payload.ids, False)


@router.post("/agencies/bulk-reactivate", dependencies=deps("ORG.AGENCY.UPDATE"))
def bulk_reactivate_agencies(payload: BulkStatusChange, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return bulk_change_active(db, context, Agency, payload.ids, True)

@router.get("/associates",response_model=list[AssociateResponse],dependencies=deps("ORG.ASSOCIATE.READ"))
def associates(include_inactive:bool=False,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):
    q=db.query(Associate).filter(Associate.organization_id==context.organization_id,Associate.deleted_at.is_(None));q=q if include_inactive else q.filter(Associate.is_active.is_(True));return [associate_out(x) for x in q.order_by(Associate.associate_code).all()]
@router.post("/associates",response_model=AssociateResponse,status_code=201,dependencies=deps("ORG.ASSOCIATE.CREATE"))
def create_associate(payload:AssociateCreate,context:AccessContext=Depends(require_head),db:Session=Depends(get_db),
                     idempotency_key:str|None=Header(default=None)):
    reservation=reserve_create(db,key=idempotency_key,operation="associate.create",
        actor_scope=f"org:{context.organization_id}:user:{context.user_id}",payload=payload.model_dump(mode="json"))
    if reservation and reservation.replay:return associate_out(scoped(db,Associate,reservation.resource_id,context.organization_id))
    code=payload.associate_code.strip().upper();branch(db,payload.branch_id,context.organization_id)
    if payload.agency_id is not None:scoped(db,Agency,payload.agency_id,context.organization_id)
    if db.query(Associate.id).filter(Associate.organization_id==context.organization_id,Associate.associate_code==code).first():raise HTTPException(409,"Associate code already exists")
    p=party(db,context,payload,"INDIVIDUAL",f"ASC-{code}");row=Associate(organization_id=context.organization_id,party_id=p.id,associate_code=code,associate_type=payload.associate_type.strip().upper(),branch_id=payload.branch_id,agency_id=payload.agency_id,joining_date=payload.joining_date,status="ACTIVE",referral_code=payload.referral_code,remarks=payload.remarks,created_by=context.user_id,updated_by=context.user_id);db.add(row);db.flush();audit(db,context,"associates",row.id,"CREATE",{"associate_code":code});finish_create(db,reservation,row.id);db.commit();db.refresh(row);return associate_out(row)
@router.put("/associates/{row_id}",response_model=AssociateResponse,dependencies=deps("ORG.ASSOCIATE.UPDATE"))
def update_associate(row_id:int,payload:AssociateUpdate,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):
    row=scoped(db,Associate,row_id,context.organization_id);values=payload.model_dump(exclude_unset=True);branch(db,values.get("branch_id",row.branch_id),context.organization_id)
    if values.get("agency_id") is not None:scoped(db,Agency,values["agency_id"],context.organization_id)
    p=row.party
    for key,target in {"name":"display_name","legal_name":"legal_name","pan":"pan_number","email":"email","mobile_number":"mobile_number"}.items():
        if key in values:
            value=values.pop(key);setattr(p,target,str(value) if key=="email" and value else value)
    for key,value in values.items():setattr(row,key,value.strip().upper() if key=="associate_type" else value)
    row.updated_by=context.user_id;p.updated_by=context.user_id;audit(db,context,"associates",row.id,"UPDATE",payload.model_dump(exclude_unset=True,mode="json"));db.commit();db.refresh(row);return associate_out(row)
def associate_active(row_id,active,context,db):
    row=scoped(db,Associate,row_id,context.organization_id);row.is_active=active;row.status="ACTIVE" if active else "INACTIVE";row.end_date=None if active else date.today();audit(db,context,"associates",row.id,"REACTIVATE" if active else "DEACTIVATE");db.commit();db.refresh(row);return associate_out(row)
@router.post("/associates/{row_id}/deactivate",response_model=AssociateResponse,dependencies=deps("ORG.ASSOCIATE.DEACTIVATE"))
def deactivate_associate(row_id:int,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):return associate_active(row_id,False,context,db)
@router.post("/associates/{row_id}/reactivate",response_model=AssociateResponse,dependencies=deps("ORG.ASSOCIATE.UPDATE"))
def reactivate_associate(row_id:int,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):return associate_active(row_id,True,context,db)


@router.post("/associates/bulk-deactivate", dependencies=deps("ORG.ASSOCIATE.DEACTIVATE"))
def bulk_deactivate_associates(payload: BulkStatusChange, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return bulk_change_active(db, context, Associate, payload.ids, False)


@router.post("/associates/bulk-reactivate", dependencies=deps("ORG.ASSOCIATE.UPDATE"))
def bulk_reactivate_associates(payload: BulkStatusChange, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return bulk_change_active(db, context, Associate, payload.ids, True)

def validate_arn(payload,ctx,db):
    branch(db,payload.branch_id,ctx.organization_id)
    linked_record=None
    for kind,model,row_id in (("EMPLOYEE",Employee,payload.employee_id),("ASSOCIATE",Associate,payload.associate_id),("AGENCY",Agency,payload.agency_id)):
        if row_id is not None:
            linked=scoped(db,model,row_id,ctx.organization_id)
            linked_record=linked
            if linked.party_id!=payload.holder_party_id:raise HTTPException(422,f"{kind.title()} Party does not match holder Party")
    holder=organization_party(db,payload.holder_party_id,ctx.organization_id,backfill=linked_record is not None)
    if not holder:raise HTTPException(422,"Active holder Party not found")
@router.get("/arn-holders",response_model=list[ArnResponse],dependencies=deps("ORG.ARN.READ"))
def arns(include_inactive:bool=False,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):
    q=db.query(ArnHolder).filter(ArnHolder.organization_id==context.organization_id,ArnHolder.deleted_at.is_(None));q=q if include_inactive else q.filter(ArnHolder.is_active.is_(True));return [arn_out(x) for x in q.order_by(ArnHolder.arn_number).all()]


@router.get("/arn-holders/{row_id}/history", response_model=list[ArnStatusHistoryResponse], dependencies=deps("ORG.ARN.READ"))
def arn_history(row_id: int, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    scoped(db, ArnHolder, row_id, context.organization_id)
    return (db.query(ArnStatusHistory)
            .filter(ArnStatusHistory.arn_holder_id == row_id)
            .order_by(ArnStatusHistory.changed_at.desc(), ArnStatusHistory.id.desc())
            .all())
@router.post("/arn-holders",response_model=ArnResponse,status_code=201,dependencies=deps("ORG.ARN.CREATE"))
def create_arn(payload:ArnCreate,context:AccessContext=Depends(require_head),db:Session=Depends(get_db),
               idempotency_key:str|None=Header(default=None)):
    reservation=reserve_create(db,key=idempotency_key,operation="arn.create",
        actor_scope=f"org:{context.organization_id}:user:{context.user_id}",payload=payload.model_dump(mode="json"))
    if reservation and reservation.replay:return arn_out(scoped(db,ArnHolder,reservation.resource_id,context.organization_id))
    number=payload.arn_number.strip().upper();validate_arn(payload,context,db)
    if db.query(ArnHolder.id).filter(ArnHolder.organization_id==context.organization_id,ArnHolder.arn_number==number).first():raise HTTPException(409,"ARN number already exists")
    row=ArnHolder(organization_id=context.organization_id,arn_number=number,**payload.model_dump(exclude={"arn_number"}),status="ACTIVE",created_by=context.user_id,updated_by=context.user_id);db.add(row);db.flush();db.add(ArnStatusHistory(arn_holder_id=row.id,new_status="ACTIVE",changed_by=context.user_id,reason="Created"));audit(db,context,"arn_holders",row.id,"CREATE",{"arn_number":number});finish_create(db,reservation,row.id);db.commit();db.refresh(row);return arn_out(row)
@router.put("/arn-holders/{row_id}",response_model=ArnResponse,dependencies=deps("ORG.ARN.UPDATE"))
def update_arn(row_id:int,payload:ArnUpdate,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):
    row=scoped(db,ArnHolder,row_id,context.organization_id);values=payload.model_dump(exclude_unset=True);branch(db,values.get("branch_id",row.branch_id),context.organization_id)
    start=values.get("valid_from",row.valid_from);end=values.get("valid_to",row.valid_to)
    if start and end and end<start:raise HTTPException(422,"valid_to cannot be before valid_from")
    for key,value in values.items():setattr(row,key,value)
    row.updated_by=context.user_id;audit(db,context,"arn_holders",row.id,"UPDATE",payload.model_dump(exclude_unset=True,mode="json"));db.commit();db.refresh(row);return arn_out(row)
@router.post("/arn-holders/{row_id}/status",response_model=ArnResponse,dependencies=deps("ORG.ARN.UPDATE"))
def arn_status(row_id:int,payload:ArnStatusChange,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):
    row=scoped(db,ArnHolder,row_id,context.organization_id);old=row.status;row.status=payload.status;row.is_active=payload.status!="INACTIVE";db.add(ArnStatusHistory(arn_holder_id=row.id,old_status=old,new_status=row.status,changed_by=context.user_id,reason=payload.reason));audit(db,context,"arn_holders",row.id,"STATUS_CHANGE",{"old":old,"new":row.status});db.commit();db.refresh(row);return arn_out(row)


def bulk_arn_status(db: Session, context: AccessContext, ids: list[int], active: bool):
    rows = (db.query(ArnHolder).filter(
        ArnHolder.id.in_(ids), ArnHolder.organization_id == context.organization_id,
        ArnHolder.deleted_at.is_(None),
    ).with_for_update().all())
    if len(rows) != len(ids):
        raise HTTPException(404, "One or more ARN holders were not found in this organization")
    updated = []
    for row in rows:
        status = "ACTIVE" if active else "INACTIVE"
        if row.status == status:
            continue
        old = row.status
        row.status = status
        row.is_active = active
        row.updated_by = context.user_id
        db.add(ArnStatusHistory(arn_holder_id=row.id, old_status=old,
                                new_status=status, changed_by=context.user_id,
                                reason="Bulk reactivation" if active else "Bulk deactivation"))
        audit(db, context, "arn_holders", row.id, "STATUS_CHANGE",
              {"old": old, "new": status, "bulk": True})
        updated.append(row.id)
    db.commit()
    return {"updated_ids": updated}


@router.post("/arn-holders/bulk-deactivate", dependencies=deps("ORG.ARN.DEACTIVATE"))
def bulk_deactivate_arns(payload: BulkStatusChange, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return bulk_arn_status(db, context, payload.ids, False)


@router.post("/arn-holders/bulk-reactivate", dependencies=deps("ORG.ARN.UPDATE"))
def bulk_reactivate_arns(payload: BulkStatusChange, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    return bulk_arn_status(db, context, payload.ids, True)


def arn_document_out(document: Document) -> dict:
    file = next((item for item in document.files if item.is_current), None)
    return {
        "id": document.id,
        "document_type": document.document_type_id,
        "file_name": file.original_file_name if file else None,
        "file_size": file.file_size_bytes if file else None,
        "uploaded_at": file.uploaded_at if file else document.created_at,
    }


@router.get("/arn-holders/{row_id}/documents", dependencies=deps("ORG.ARN.READ"))
def list_arn_documents(row_id: int, context: AccessContext = Depends(require_head), db: Session = Depends(get_db)):
    scoped(db, ArnHolder, row_id, context.organization_id)
    documents = db.query(Document).filter(
        Document.organization_id == context.organization_id,
        Document.entity_type == "ARN_HOLDER", Document.entity_id == row_id,
        Document.deleted_at.is_(None), Document.is_active.is_(True),
    ).order_by(Document.created_at.desc(), Document.id.desc()).all()
    return [arn_document_out(document) for document in documents]


@router.post("/arn-holders/{row_id}/documents", status_code=201, dependencies=deps("ORG.ARN.UPDATE"))
async def upload_arn_document(
    row_id: int, document_type: str = Form(...), file: UploadFile = File(...),
    context: AccessContext = Depends(require_head), db: Session = Depends(get_db),
):
    scoped(db, ArnHolder, row_id, context.organization_id)
    if document_type not in ARN_DOCUMENT_TYPES:
        raise HTTPException(422, "Unsupported ARN document type")
    doc_type = db.query(DocumentType).filter(
        DocumentType.type_code == document_type, DocumentType.is_active.is_(True),
    ).first()
    if doc_type is None:
        raise HTTPException(409, "ARN document types are not configured; run the latest migration")
    original_name = Path(file.filename or "").name
    suffix = Path(original_name).suffix.lower()
    if not original_name or suffix not in ARN_EXTENSIONS:
        raise HTTPException(400, "Upload a PDF, JPEG, or PNG file")
    content = await file.read(ARN_MAX_BYTES + 1)
    if not content or len(content) > ARN_MAX_BYTES:
        raise HTTPException(400, "File must be between 1 byte and 10 MB")
    signatures = {".pdf": content.startswith(b"%PDF-"),
                  ".jpg": content.startswith(b"\xff\xd8\xff"),
                  ".jpeg": content.startswith(b"\xff\xd8\xff"),
                  ".png": content.startswith(b"\x89PNG\r\n\x1a\n")}
    if not signatures[suffix]:
        raise HTTPException(400, "File content does not match its extension")
    folder = ARN_UPLOAD_ROOT / str(context.organization_id) / str(row_id)
    folder.mkdir(parents=True, exist_ok=True)
    saved = folder / f"{uuid4().hex}{suffix}"
    saved.write_bytes(content)
    try:
        document = Document(
            organization_id=context.organization_id, entity_type="ARN_HOLDER", entity_id=row_id,
            document_type_id=doc_type.id, created_by=context.user_id, updated_by=context.user_id,
        )
        db.add(document)
        db.flush()
        db.add(DocumentFile(
            document_id=document.id, version_no=1, original_file_name=original_name,
            stored_file_name=saved.name, file_extension=suffix,
            mime_type={".pdf":"application/pdf", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".png":"image/png"}[suffix],
            file_size_bytes=len(content), storage_provider="LOCAL", storage_path=str(saved),
            checksum_sha256=sha256(content).hexdigest(), uploaded_by=context.user_id, is_current=True,
        ))
        audit(db,context,"documents",document.id,"CREATE",{"entity_type":"ARN_HOLDER","entity_id":row_id})
        db.commit()
        db.refresh(document)
        return arn_document_out(document)
    except Exception:
        db.rollback()
        saved.unlink(missing_ok=True)
        raise


@router.get("/arn-holders/{row_id}/documents/{document_id}/download", dependencies=deps("ORG.ARN.READ"))
def download_arn_document(
    row_id: int, document_id: int,
    context: AccessContext = Depends(require_head), db: Session = Depends(get_db),
):
    scoped(db, ArnHolder, row_id, context.organization_id)
    document = db.query(Document).filter(
        Document.id == document_id, Document.organization_id == context.organization_id,
        Document.entity_type == "ARN_HOLDER", Document.entity_id == row_id,
        Document.deleted_at.is_(None), Document.is_active.is_(True),
    ).first()
    if document is None:
        raise HTTPException(404, "Document not found")
    file = next((item for item in document.files if item.is_current), None)
    if file is None or not file.storage_path:
        raise HTTPException(404, "Document file not found")
    path = Path(file.storage_path).resolve()
    allowed = (ARN_UPLOAD_ROOT / str(context.organization_id) / str(row_id)).resolve()
    if allowed not in path.parents or not path.is_file():
        raise HTTPException(404, "Document file not found")
    return FileResponse(path, media_type=file.mime_type, filename=file.original_file_name or path.name)
