from datetime import datetime

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Index, String, text

from ..base import Base


class PortalPublication(Base):
    __tablename__ = "portal_publications"
    __table_args__ = (
        Index("uq_portal_publication_active", "customer_id", "resource_type", "resource_id",
            unique=True, postgresql_where=text("revoked_at IS NULL")),
        Index("ix_portal_publication_customer", "customer_id", "published_at"),
        {"schema": "crm"},
    )

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    customer_id = Column(BigInteger, ForeignKey("crm.customers.id"), nullable=False)
    resource_type = Column(String(20), nullable=False)
    resource_id = Column(BigInteger, nullable=False)
    published_by_user_id = Column(BigInteger, ForeignKey("identity.users.id"), nullable=False)
    published_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=text("CURRENT_TIMESTAMP"))
    revoked_by_user_id = Column(BigInteger, ForeignKey("identity.users.id"), nullable=True)
    revoked_at = Column(DateTime, nullable=True)

