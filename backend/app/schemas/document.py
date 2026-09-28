from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class DocumentBase(BaseModel):
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


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
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


class DocumentResponse(DocumentBase):
    id: int

    organization_id: int

    uploaded_by_employee_id: int

    customer_name: Optional[str] = None

    group_name: Optional[str] = None

    created_at: datetime

    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]

    total: int