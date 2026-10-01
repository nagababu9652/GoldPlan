from pydantic import BaseModel, Field


class OrganizationBootstrap(BaseModel):
    organization_name: str = Field(min_length=2, max_length=250)
    branch_name: str = Field(default="Head Office", min_length=2, max_length=200)


class OrganizationBootstrapResponse(BaseModel):
    organization_id: int
    branch_id: int
    employee_id: int
    role: str
    organization_code: str
    branch_code: str

