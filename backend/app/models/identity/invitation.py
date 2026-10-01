from datetime import datetime
from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, String, text
from ..base import Base


class AccessInvitation(Base):
    __tablename__ = "access_invitations"
    __table_args__ = {"schema": "identity"}
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, ForeignKey("organization.organizations.id"), nullable=False)
    party_id = Column(BigInteger, ForeignKey("foundation.parties.id"), nullable=False)
    employee_id = Column(BigInteger, ForeignKey("organization.employees.id"), nullable=True)
    customer_id = Column(BigInteger, ForeignKey("crm.customers.id"), nullable=True)
    invitation_type = Column(String(30), nullable=False)
    target_role = Column(String(30), nullable=False)
    email = Column(String(150), nullable=False)
    token_hash = Column(String(64), nullable=False, unique=True)
    expires_at = Column(DateTime, nullable=False)
    accepted_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    invited_by_user_id = Column(BigInteger, ForeignKey("identity.users.id"), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP"), default=datetime.utcnow)

