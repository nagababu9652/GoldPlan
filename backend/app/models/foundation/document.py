"""
Document models: document_categories, document_types, documents, document_files.
"""
from datetime import datetime
from sqlalchemy import Column, BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from ..base import Base


class DocumentCategory(Base):
    __tablename__ = "document_categories"
    __table_args__ = {"schema": "foundation"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    category_code = Column(String(30), nullable=False, unique=True)
    category_name = Column(String(150), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=1)
    is_system = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(BigInteger, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    updated_by = Column(BigInteger, nullable=True)
    version_no = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)

    document_types = relationship("DocumentType", back_populates="category", lazy="selectin")


class DocumentType(Base):
    __tablename__ = "document_types"
    __table_args__ = {"schema": "foundation"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    category_id = Column(BigInteger, ForeignKey("foundation.document_categories.id"), nullable=False)
    type_code = Column(String(30), nullable=False, unique=True)
    type_name = Column(String(150), nullable=False)
    allowed_extensions = Column(String(200), nullable=True)
    max_file_size_mb = Column(Integer, default=10)
    requires_expiry = Column(Boolean, default=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(BigInteger, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    updated_by = Column(BigInteger, nullable=True)
    version_no = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)

    category = relationship("DocumentCategory", back_populates="document_types", lazy="selectin")


class Document(Base):
    __tablename__ = "documents"
    __table_args__ = {"schema": "foundation"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(BigInteger, nullable=False)
    document_type_id = Column(BigInteger, ForeignKey("foundation.document_types.id"), nullable=False)
    document_number = Column(String(100), nullable=True)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    issued_by = Column(String(200), nullable=True)
    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime, nullable=True)
    verified_by = Column(BigInteger, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(BigInteger, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    updated_by = Column(BigInteger, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    deleted_by = Column(BigInteger, nullable=True)
    version_no = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)

    files = relationship("DocumentFile", back_populates="document", lazy="selectin")


class DocumentFile(Base):
    __tablename__ = "document_files"
    __table_args__ = {"schema": "foundation"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    document_id = Column(BigInteger, ForeignKey("foundation.documents.id"), nullable=False)
    version_no = Column(Integer, nullable=False)
    original_file_name = Column(String(300), nullable=True)
    stored_file_name = Column(String(300), nullable=True)
    file_extension = Column(String(20), nullable=True)
    mime_type = Column(String(100), nullable=True)
    file_size_bytes = Column(BigInteger, nullable=True)
    storage_provider = Column(String(50), nullable=True)
    storage_path = Column(Text, nullable=True)
    checksum_sha256 = Column(String(64), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    uploaded_by = Column(BigInteger, nullable=True)
    is_current = Column(Boolean, default=True)

    document = relationship("Document", back_populates="files", lazy="selectin")