from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class InvitationCreate(BaseModel):
    employee_id:int
    expires_in_hours:int=Field(72,ge=1,le=168)
class ClientInvitationCreate(BaseModel):
    customer_id:int
    expires_in_hours:int=Field(72,ge=1,le=168)
class InvitationResponse(BaseModel):
    id:int;employee_id:int|None;customer_id:int|None;invitation_type:str;email:str;status:str;expires_at:datetime;created_at:datetime;invitation_url:str|None=None
class InvitationAccept(BaseModel):
    token:str=Field(min_length=32);password:str=Field(min_length=10,max_length=72)
class InvitationPreview(BaseModel):
    email:str;display_name:str;invitation_type:str;organization_id:int;expires_at:datetime
class InvitationAcceptResponse(BaseModel):
    message:str;email:str
