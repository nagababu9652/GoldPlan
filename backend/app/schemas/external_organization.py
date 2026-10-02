from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

Status = Literal["ACTIVE", "INACTIVE"]
ArnStatus = Literal["ACTIVE", "EXPIRED", "SUSPENDED", "INACTIVE"]
HolderType = Literal["ORGANIZATION", "EMPLOYEE", "ASSOCIATE", "AGENCY", "OTHER"]


class PartyInput(BaseModel):
    name: str = Field(min_length=1, max_length=250)
    legal_name: str | None = Field(None, max_length=250)
    pan: str | None = Field(None, max_length=20)
    gstin: str | None = Field(None, max_length=20)
    email: EmailStr | None = None
    mobile_number: str | None = Field(None, max_length=20)


class AgencyCreate(PartyInput):
    agency_code: str = Field(min_length=1, max_length=30)
    registration_number: str | None = Field(None, max_length=100)
    branch_id: int | None = None
    primary_contact_party_id: int | None = None
    start_date: date
    remarks: str | None = None


class AgencyUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=250)
    legal_name: str | None = Field(None, max_length=250)
    pan: str | None = Field(None, max_length=20)
    gstin: str | None = Field(None, max_length=20)
    email: EmailStr | None = None
    mobile_number: str | None = Field(None, max_length=20)
    registration_number: str | None = Field(None, max_length=100)
    branch_id: int | None = None
    primary_contact_party_id: int | None = None
    start_date: date | None = None
    remarks: str | None = None


class AgencyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:int; organization_id:int; party_id:int; agency_code:str; name:str
    legal_name:str|None; pan:str|None; gstin:str|None; email:str|None; mobile_number:str|None
    registration_number:str|None; branch_id:int|None; primary_contact_party_id:int|None
    start_date:date; end_date:date|None; status:str; remarks:str|None; is_active:bool; created_at:datetime


class AssociateCreate(PartyInput):
    associate_code: str = Field(min_length=1, max_length=30)
    associate_type: str = Field(min_length=1, max_length=30)
    branch_id: int | None = None
    agency_id: int | None = None
    joining_date: date
    referral_code: str | None = Field(None, max_length=50)
    remarks: str | None = None


class AssociateUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=250)
    legal_name: str | None = Field(None, max_length=250)
    pan: str | None = Field(None, max_length=20)
    email: EmailStr | None = None
    mobile_number: str | None = Field(None, max_length=20)
    associate_type: str | None = Field(None, min_length=1, max_length=30)
    branch_id: int | None = None
    agency_id: int | None = None
    joining_date: date | None = None
    referral_code: str | None = Field(None, max_length=50)
    remarks: str | None = None


class AssociateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:int; organization_id:int; party_id:int; associate_code:str; associate_type:str; name:str
    legal_name:str|None; pan:str|None; email:str|None; mobile_number:str|None
    branch_id:int|None; agency_id:int|None; joining_date:date; end_date:date|None
    status:str; referral_code:str|None; remarks:str|None; is_active:bool; created_at:datetime


class ArnCreate(BaseModel):
    arn_number:str=Field(min_length=1,max_length=50); holder_party_id:int; holder_type:HolderType
    branch_id:int|None=None; employee_id:int|None=None; associate_id:int|None=None; agency_id:int|None=None
    registration_date:date|None=None; valid_from:date|None=None; valid_to:date|None=None
    remarks:str|None=None
    @model_validator(mode="after")
    def linkage(self):
        links={"EMPLOYEE":self.employee_id,"ASSOCIATE":self.associate_id,"AGENCY":self.agency_id}
        expected=links.get(self.holder_type); supplied=sum(value is not None for value in links.values())
        if (self.holder_type in links and (expected is None or supplied != 1)) or (self.holder_type not in links and supplied):
            raise ValueError("Holder type must match exactly one linked employee, associate, or agency")
        if self.valid_from and self.valid_to and self.valid_to < self.valid_from:
            raise ValueError("valid_to cannot be before valid_from")
        return self


class ArnUpdate(BaseModel):
    branch_id:int|None=None; registration_date:date|None=None; valid_from:date|None=None; valid_to:date|None=None; remarks:str|None=None


class ArnStatusChange(BaseModel):
    status:ArnStatus; reason:str|None=None


class ArnResponse(BaseModel):
    model_config=ConfigDict(from_attributes=True)
    id:int;organization_id:int;arn_number:str;holder_party_id:int;holder_name:str;holder_type:str
    branch_id:int|None;employee_id:int|None;associate_id:int|None;agency_id:int|None
    registration_date:date|None;valid_from:date|None;valid_to:date|None;status:str;remarks:str|None;is_active:bool;created_at:datetime


class ArnStatusHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    arn_holder_id: int
    old_status: str | None
    new_status: str
    changed_at: datetime
    changed_by: int
    reason: str | None
