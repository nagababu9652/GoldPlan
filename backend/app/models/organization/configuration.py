"""Immutable versions of organization application configuration."""
from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import JSONB

from ..base import Base


class ApplicationConfigurationVersion(Base):
    __tablename__ = "application_configuration_versions"
    __table_args__ = (
        UniqueConstraint("organization_id", "section", "version", name="uq_application_config_version"),
        {"schema": "organization"},
    )

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    section = Column(String(30), nullable=False)
    version = Column(Integer, nullable=False)
    values = Column(JSONB, nullable=False)
    created_by = Column(BigInteger, ForeignKey("identity.users.id"), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"))
