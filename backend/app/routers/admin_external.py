from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.foundation.party import Party
from ..models.identity.security import AuditLog
from ..models.organization.core import Branch
from ..models.organization.employee import Employee
from ..models.organization.external import Agency, Associate, ArnHolder, ArnStatusHistory
from ..models.crm.customer import Customer
from ..schemas.external_organization import (AgencyCreate, AgencyResponse, AgencyUpdate,
    ArnCreate, ArnResponse, ArnStatusChange, ArnUpdate, AssociateCreate,
    AssociateResponse, AssociateUpdate)
from ..services.access import AccessContext, require_head, require_permission
from ..services.party_profile import lookup_id

router=APIRouter(prefix="/admin/organization",tags=["admin-external-organization"])
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
    if p is None:raise HTTPException(409,"Agency Party record is missing")
    return AgencyResponse.model_validate({**{c.name:getattr(row,c.name) for c in Agency.__table__.columns},"name":p.display_name,"legal_name":p.legal_name,"pan":p.pan_number,"gstin":p.gst_number,"email":p.email,"mobile_number":p.mobile_number})
def associate_out(row):
    p=row.party
    if p is None:raise HTTPException(409,"Associate Party record is missing")
    return AssociateResponse.model_validate({**{c.name:getattr(row,c.name) for c in Associate.__table__.columns},"name":p.display_name,"legal_name":p.legal_name,"pan":p.pan_number,"email":p.email,"mobile_number":p.mobile_number})
def arn_out(row):
    if row.holder_party is None:raise HTTPException(409,"ARN holder Party record is missing")
    return ArnResponse.model_validate({**{c.name:getattr(row,c.name) for c in ArnHolder.__table__.columns},"holder_name":row.holder_party.display_name})

@router.get("/agencies",response_model=list[AgencyResponse],dependencies=deps("ORG.AGENCY.READ"))
def agencies(include_inactive:bool=False,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):
    q=db.query(Agency).filter(Agency.organization_id==context.organization_id,Agency.deleted_at.is_(None));q=q if include_inactive else q.filter(Agency.is_active.is_(True));return [agency_out(x) for x in q.order_by(Agency.agency_code).all()]
@router.post("/agencies",response_model=AgencyResponse,status_code=201,dependencies=deps("ORG.AGENCY.CREATE"))
def create_agency(payload:AgencyCreate,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):
    code=payload.agency_code.strip().upper();branch(db,payload.branch_id,context.organization_id)
    if payload.primary_contact_party_id is not None and not organization_party(db,payload.primary_contact_party_id,context.organization_id,backfill=True):raise HTTPException(422,"Active primary contact Party not found")
    if db.query(Agency.id).filter(Agency.organization_id==context.organization_id,Agency.agency_code==code).first():raise HTTPException(409,"Agency code already exists")
    p=party(db,context,payload,"COMPANY",f"AGY-{code}");row=Agency(organization_id=context.organization_id,party_id=p.id,agency_code=code,registration_number=payload.registration_number,branch_id=payload.branch_id,primary_contact_party_id=payload.primary_contact_party_id,start_date=payload.start_date,status="ACTIVE",remarks=payload.remarks,created_by=context.user_id,updated_by=context.user_id);db.add(row);db.flush();audit(db,context,"agencies",row.id,"CREATE",{"agency_code":code});db.commit();db.refresh(row);return agency_out(row)
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

@router.get("/associates",response_model=list[AssociateResponse],dependencies=deps("ORG.ASSOCIATE.READ"))
def associates(include_inactive:bool=False,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):
    q=db.query(Associate).filter(Associate.organization_id==context.organization_id,Associate.deleted_at.is_(None));q=q if include_inactive else q.filter(Associate.is_active.is_(True));return [associate_out(x) for x in q.order_by(Associate.associate_code).all()]
@router.post("/associates",response_model=AssociateResponse,status_code=201,dependencies=deps("ORG.ASSOCIATE.CREATE"))
def create_associate(payload:AssociateCreate,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):
    code=payload.associate_code.strip().upper();branch(db,payload.branch_id,context.organization_id)
    if payload.agency_id is not None:scoped(db,Agency,payload.agency_id,context.organization_id)
    if db.query(Associate.id).filter(Associate.organization_id==context.organization_id,Associate.associate_code==code).first():raise HTTPException(409,"Associate code already exists")
    p=party(db,context,payload,"INDIVIDUAL",f"ASC-{code}");row=Associate(organization_id=context.organization_id,party_id=p.id,associate_code=code,associate_type=payload.associate_type.strip().upper(),branch_id=payload.branch_id,agency_id=payload.agency_id,joining_date=payload.joining_date,status="ACTIVE",referral_code=payload.referral_code,remarks=payload.remarks,created_by=context.user_id,updated_by=context.user_id);db.add(row);db.flush();audit(db,context,"associates",row.id,"CREATE",{"associate_code":code});db.commit();db.refresh(row);return associate_out(row)
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
@router.post("/arn-holders",response_model=ArnResponse,status_code=201,dependencies=deps("ORG.ARN.CREATE"))
def create_arn(payload:ArnCreate,context:AccessContext=Depends(require_head),db:Session=Depends(get_db)):
    number=payload.arn_number.strip().upper();validate_arn(payload,context,db)
    if db.query(ArnHolder.id).filter(ArnHolder.organization_id==context.organization_id,ArnHolder.arn_number==number).first():raise HTTPException(409,"ARN number already exists")
    row=ArnHolder(organization_id=context.organization_id,arn_number=number,**payload.model_dump(exclude={"arn_number"}),status="ACTIVE",created_by=context.user_id,updated_by=context.user_id);db.add(row);db.flush();db.add(ArnStatusHistory(arn_holder_id=row.id,new_status="ACTIVE",changed_by=context.user_id,reason="Created"));audit(db,context,"arn_holders",row.id,"CREATE",{"arn_number":number});db.commit();db.refresh(row);return arn_out(row)
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
