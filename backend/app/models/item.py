from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Index

from ..database.base import Base


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(String(1000), nullable=True)
    completed = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Composite indexes for common query patterns
    __table_args__ = (
        Index('idx_item_completed_created', 'completed', 'created_at'),
        Index('idx_item_title_completed', 'title', 'completed'),
    )