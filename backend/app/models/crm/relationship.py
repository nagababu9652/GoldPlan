"""
CRM relationship and operation models: customer_relationships, group_merge/split_history,
customer_merge_history, group_member_order.
"""
from datetime import datetime
from sqlalchemy import Column, BigInteger, Date, DateTime, ForeignKey, Integer, String, Text, PrimaryKeyConstraint
from sqlalchemy.orm import relationship

from ..base import Base


class CustomerRelationship(Base):
    __tablename__ = "customer_relationships"
    __table_args__ = {"schema": "crm"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    customer_group_id = Column(BigInteger, ForeignKey("crm.customer_groups.id"), nullable=False)
    customer_id = Column(BigInteger, ForeignKey("crm.customers.id"), nullable=False)
    related_customer_id = Column(BigInteger, ForeignKey("crm.customers.id"), nullable=False)
    relationship_type = Column(String(50), nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("CustomerGroup", lazy="selectin")
    customer = relationship("Customer", foreign_keys=[customer_id], lazy="selectin")
    related_customer = relationship("Customer", foreign_keys=[related_customer_id], lazy="selectin")


class GroupMergeHistory(Base):
    __tablename__ = "group_merge_history"
    __table_args__ = {"schema": "crm"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    source_group_id = Column(BigInteger, ForeignKey("crm.customer_groups.id"), nullable=False)
    target_group_id = Column(BigInteger, ForeignKey("crm.customer_groups.id"), nullable=False)
    merged_by = Column(BigInteger, nullable=True)
    merged_at = Column(DateTime, default=datetime.utcnow)
    merge_reason = Column(Text, nullable=True)
    remarks = Column(Text, nullable=True)

    source_group = relationship("CustomerGroup", foreign_keys=[source_group_id], lazy="selectin")
    target_group = relationship("CustomerGroup", foreign_keys=[target_group_id], lazy="selectin")


class GroupSplitHistory(Base):
    __tablename__ = "group_split_history"
    __table_args__ = {"schema": "crm"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    original_group_id = Column(BigInteger, ForeignKey("crm.customer_groups.id"), nullable=False)
    new_group_id = Column(BigInteger, ForeignKey("crm.customer_groups.id"), nullable=False)
    split_by = Column(BigInteger, nullable=True)
    split_at = Column(DateTime, default=datetime.utcnow)
    split_reason = Column(Text, nullable=True)
    remarks = Column(Text, nullable=True)

    original_group = relationship("CustomerGroup", foreign_keys=[original_group_id], lazy="selectin")
    new_group = relationship("CustomerGroup", foreign_keys=[new_group_id], lazy="selectin")


class CustomerMergeHistory(Base):
    __tablename__ = "customer_merge_history"
    __table_args__ = {"schema": "crm"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    source_customer_id = Column(BigInteger, ForeignKey("crm.customers.id"), nullable=False)
    target_customer_id = Column(BigInteger, ForeignKey("crm.customers.id"), nullable=False)
    merged_by = Column(BigInteger, nullable=True)
    merged_at = Column(DateTime, default=datetime.utcnow)
    merge_reason = Column(Text, nullable=True)
    remarks = Column(Text, nullable=True)

    source_customer = relationship("Customer", foreign_keys=[source_customer_id], lazy="selectin")
    target_customer = relationship("Customer", foreign_keys=[target_customer_id], lazy="selectin")


class GroupMemberOrder(Base):
    __tablename__ = "group_member_order"
    __table_args__ = {"schema": "crm"}

    customer_group_id = Column(BigInteger, ForeignKey("crm.customer_groups.id"), primary_key=True)
    customer_id = Column(BigInteger, ForeignKey("crm.customers.id"), primary_key=True)
    display_order = Column(Integer, nullable=False)

    group = relationship("CustomerGroup", lazy="selectin")
    customer = relationship("Customer", lazy="selectin")