"""
Party models: parties, party_addresses, party_contacts, party_bank_accounts.
"""
from sqlalchemy import Column, BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from ..base import Base, AuditMixin


class Party(AuditMixin, Base):
    __tablename__ = "parties"
    __table_args__ = {"schema": "foundation"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = Column(BigInteger, nullable=True)
    party_code = Column(String(30), nullable=False)
    party_type_id = Column(BigInteger, ForeignKey("foundation.lookup_values.id"), nullable=False)
    title = Column(String(20), nullable=True)
    first_name = Column(String(100), nullable=True)
    middle_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    display_name = Column(String(250), nullable=False)
    legal_name = Column(String(250), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    date_of_incorporation = Column(Date, nullable=True)
    gender_id = Column(BigInteger, ForeignKey("foundation.lookup_values.id"), nullable=True)
    marital_status_id = Column(BigInteger, ForeignKey("foundation.lookup_values.id"), nullable=True)
    pan_number = Column(String(20), nullable=True)
    aadhaar_number = Column(String(20), nullable=True)
    gst_number = Column(String(20), nullable=True)
    cin_number = Column(String(30), nullable=True)
    email = Column(String(150), nullable=True)
    mobile_number = Column(String(20), nullable=True)
    alternate_mobile = Column(String(20), nullable=True)
    website = Column(String(250), nullable=True)
    photo_url = Column(String, nullable=True)
    remarks = Column(Text, nullable=True)

    addresses = relationship("PartyAddress", back_populates="party", lazy="selectin")
    contacts = relationship("PartyContact", back_populates="party", lazy="selectin")
    bank_accounts = relationship("PartyBankAccount", back_populates="party", lazy="selectin")


class PartyAddress(AuditMixin, Base):
    __tablename__ = "party_addresses"
    __table_args__ = {"schema": "foundation"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    party_id = Column(BigInteger, ForeignKey("foundation.parties.id"), nullable=False)
    address_type_id = Column(BigInteger, ForeignKey("foundation.lookup_values.id"), nullable=False)
    address_line1 = Column(String(250), nullable=False)
    address_line2 = Column(String(250), nullable=True)
    landmark = Column(String(150), nullable=True)
    city_id = Column(BigInteger, ForeignKey("foundation.cities.id"), nullable=False)
    state_id = Column(BigInteger, ForeignKey("foundation.states.id"), nullable=False)
    country_id = Column(BigInteger, ForeignKey("foundation.countries.id"), nullable=False)
    postal_code = Column(String(15), nullable=True)
    latitude = Column(Numeric(10, 6), nullable=True)
    longitude = Column(Numeric(10, 6), nullable=True)
    is_primary = Column(Boolean, default=False)
    remarks = Column(Text, nullable=True)

    party = relationship("Party", back_populates="addresses", lazy="selectin")


class PartyContact(AuditMixin, Base):
    __tablename__ = "party_contacts"
    __table_args__ = {"schema": "foundation"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    party_id = Column(BigInteger, ForeignKey("foundation.parties.id"), nullable=False)
    contact_type_id = Column(BigInteger, ForeignKey("foundation.lookup_values.id"), nullable=False)
    contact_value = Column(String(200), nullable=False)
    is_primary = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime, nullable=True)
    remarks = Column(Text, nullable=True)

    party = relationship("Party", back_populates="contacts", lazy="selectin")


class PartyBankAccount(AuditMixin, Base):
    __tablename__ = "party_bank_accounts"
    __table_args__ = {"schema": "foundation"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    party_id = Column(BigInteger, ForeignKey("foundation.parties.id"), nullable=False)
    bank_name = Column(String(200), nullable=False)
    branch_name = Column(String(200), nullable=True)
    account_holder_name = Column(String(200), nullable=True)
    account_number = Column(String(50), nullable=False)
    ifsc_code = Column(String(20), nullable=True)
    micr_code = Column(String(20), nullable=True)
    account_type_id = Column(BigInteger, ForeignKey("foundation.lookup_values.id"), nullable=True)
    upi_id = Column(String(100), nullable=True)
    is_primary = Column(Boolean, default=False)
    remarks = Column(Text, nullable=True)

    party = relationship("Party", back_populates="bank_accounts", lazy="selectin")