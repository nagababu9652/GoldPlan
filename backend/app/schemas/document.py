from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

DOCUMENT_TYPES = {"KYC", "PAN", "AADHAAR", "BANK", "INVESTMENT", "AGREEMENT", "TAX", "INSURANCE", "RISK_ASSESSMENT", "OTHER"}
DOCUMENT_STATUSES = {"ACTIVE", "PENDING", "ARCHIVED"}


class DocumentBase(BaseModel):
    model_config = ConfigDict(extra="forbid")
    document_type: str = "OTHER"

    document_name: str = Field(
        ...,
        min_length=1,
        max_length=250,
    )

    description: Optional[str] = None

    file_name: Optional[str] = Field(
        default=None,
        max_length=250,
    )

    file_url: Optional[str] = Field(
        default=None,
        max_length=1000,
    )

    file_type: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    file_size: Optional[int] = None

    status: str = "ACTIVE"

    notes: Optional[str] = None

    customer_id: Optional[int] = None

    customer_group_id: Optional[int] = None

    @field_validator("document_type")
    @classmethod
    def validate_type(cls, value):
        value = value.strip().upper()
        if value not in DOCUMENT_TYPES: raise ValueError(f"Unsupported document type: {value}")
        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        value = value.strip().upper()
        if value not in DOCUMENT_STATUSES: raise ValueError(f"Unsupported document status: {value}")
        return value

    @model_validator(mode="after")
    def validate_owner(self):
        if (self.customer_id is None) == (self.customer_group_id is None):
            raise ValueError("Exactly one document owner is required")
        return self


class DocumentCreate(DocumentBase):
    @field_validator("file_url")
    @classmethod
    def stored_file_url_is_server_owned(cls, value):
        if value is not None:
            raise ValueError("Upload a file to set its storage URL")
        return value


class DocumentUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    document_type: Optional[str] = None

    document_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=250,
    )

    description: Optional[str] = None

    file_name: Optional[str] = Field(
        default=None,
        max_length=250,
    )

    file_url: Optional[str] = Field(
        default=None,
        max_length=1000,
    )

    file_type: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    file_size: Optional[int] = None

    status: Optional[str] = None

    notes: Optional[str] = None

    customer_id: Optional[int] = None

    customer_group_id: Optional[int] = None

    @field_validator("file_url")
    @classmethod
    def stored_file_url_is_server_owned(cls, value):
        if value is not None:
            raise ValueError("A document's storage URL cannot be changed")
        return value

    @field_validator("document_type")
    @classmethod
    def validate_type(cls, value):
        if value is None: return value
        value = value.strip().upper()
        if value not in DOCUMENT_TYPES: raise ValueError(f"Unsupported document type: {value}")
        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        if value is None: return value
        value = value.strip().upper()
        if value not in DOCUMENT_STATUSES: raise ValueError(f"Unsupported document status: {value}")
        return value


class DocumentResponse(DocumentBase):
    id: int

    organization_id: int

    uploaded_by_employee_id: int

    customer_name: Optional[str] = None

    group_name: Optional[str] = None

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]

    total: int
