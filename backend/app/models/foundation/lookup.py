"""
Lookup models: lookup_categories and lookup_values.
"""
from sqlalchemy import Column, BigInteger, Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from ..base import Base, AuditMixin


class LookupCategory(AuditMixin, Base):
    __tablename__ = "lookup_categories"
    __table_args__ = {"schema": "foundation"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    category_code = Column(String(50), nullable=False, unique=True)
    category_name = Column(String(150), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=1)
    is_system = Column(Boolean, default=False, nullable=False)

    values = relationship("LookupValue", back_populates="category", lazy="selectin")


class LookupValue(AuditMixin, Base):
    __tablename__ = "lookup_values"
    __table_args__ = {"schema": "foundation"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    category_id = Column(BigInteger, ForeignKey("foundation.lookup_categories.id"), nullable=False)
    value_code = Column(String(50), nullable=False)
    value_name = Column(String(150), nullable=False)
    short_name = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=1)
    color_code = Column(String(20), nullable=True)
    icon_name = Column(String(100), nullable=True)
    is_default = Column(Boolean, default=False)
    is_system = Column(Boolean, default=False)

    category = relationship("LookupCategory", back_populates="values", lazy="selectin")