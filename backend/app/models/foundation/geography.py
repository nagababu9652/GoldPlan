"""
Geography models: countries, states, cities.
"""
from sqlalchemy import Column, BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from ..base import Base, AuditMixin


class Country(AuditMixin, Base):
    __tablename__ = "countries"
    __table_args__ = {"schema": "foundation"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    country_code = Column(String(5), nullable=False, unique=True)
    iso2 = Column(String(2), nullable=False)
    iso3 = Column(String(3), nullable=True)
    country_name = Column(String(100), nullable=False, unique=True)
    nationality = Column(String(100), nullable=True)
    phone_code = Column(String(10), nullable=True)
    currency_code = Column(String(10), nullable=True)
    is_default = Column(Boolean, default=False)
    display_order = Column(Integer, default=1)
    remarks = Column(Text, nullable=True)

    states = relationship("State", back_populates="country", lazy="selectin")


class State(AuditMixin, Base):
    __tablename__ = "states"
    __table_args__ = {"schema": "foundation"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    country_id = Column(BigInteger, ForeignKey("foundation.countries.id"), nullable=False)
    state_code = Column(String(10), nullable=True)
    state_name = Column(String(100), nullable=False)
    gst_state_code = Column(String(5), nullable=True)
    display_order = Column(Integer, default=1)
    remarks = Column(Text, nullable=True)

    country = relationship("Country", back_populates="states", lazy="selectin")
    cities = relationship("City", back_populates="state", lazy="selectin")


class City(AuditMixin, Base):
    __tablename__ = "cities"
    __table_args__ = {"schema": "foundation"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    state_id = Column(BigInteger, ForeignKey("foundation.states.id"), nullable=False)
    city_name = Column(String(100), nullable=False)
    district_name = Column(String(100), nullable=True)
    pin_code = Column(String(10), nullable=True)
    latitude = Column(Numeric(10, 6), nullable=True)
    longitude = Column(Numeric(10, 6), nullable=True)
    display_order = Column(Integer, default=1)
    remarks = Column(Text, nullable=True)

    state = relationship("State", back_populates="cities", lazy="selectin")