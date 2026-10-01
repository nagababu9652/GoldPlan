from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from ..database.session import get_db
from ..models.crm.customer import Customer
from ..models.foundation.party import Party
from ..models.organization.employee import Employee
from ..services.access import AccessContext,require_employee,require_permission

router=APIRouter(prefix="/employee",tags=["employee-dashboard"])

@router.get("/dashboard")
def dashboard(context:AccessContext=Depends(require_employee),db:Session=Depends(get_db)):
    context.check_permission("PROFILE.READ")
    employee=db.query(Employee).filter(Employee.id==context.employee_id,Employee.organization_id==context.organization_id,Employee.is_active.is_(True),Employee.deleted_at.is_(None)).first()
    if not employee:raise HTTPException(404,"Active employee record not found")
    return {"employee_id":employee.id,"organization_id":context.organization_id,"actor_type":context.actor_type,"assigned_client_count":len(context.customer_ids),"permissions":sorted(context.permissions),"subscription_status":context.subscription_status}

@router.get("/clients",dependencies=[Depends(require_permission("CLIENT.READ"))])
def assigned_clients(context:AccessContext=Depends(require_employee),db:Session=Depends(get_db)):
    rows=db.query(Customer,Party).join(Party,Party.id==Customer.party_id).filter(Customer.organization_id==context.organization_id,Customer.id.in_(context.customer_ids),Customer.is_active.is_(True),Customer.deleted_at.is_(None)).order_by(Party.display_name).all() if context.customer_ids else []
    return [{"id":customer.id,"customer_code":customer.customer_code,"display_name":party.display_name,"email":party.email,"mobile_number":party.mobile_number,"status":customer.customer_status} for customer,party in rows]
