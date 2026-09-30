"""Validated writes to shared Foundation party records.

Geography is resolved within its parent, never by an arbitrary first row.
Blank optional form sections are ignored; incomplete sections fail explicitly.
"""
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import func, or_

from ..models.foundation.geography import City, Country, State
from ..models.foundation.lookup import LookupCategory, LookupValue
from ..models.foundation.party import PartyAddress, PartyBankAccount


def clean(value):
    return (value.strip() or None) if isinstance(value, str) else value


def lookup_id(db, category, value):
    value = clean(value)
    if value is None:
        return None
    rows = db.query(LookupValue.id).join(LookupCategory).filter(
        LookupCategory.category_code == category,
        LookupCategory.is_active.is_(True),
        LookupCategory.deleted_at.is_(None),
        LookupValue.is_active.is_(True),
        LookupValue.deleted_at.is_(None),
        or_(func.lower(LookupValue.value_code) == value.lower(),
            func.lower(LookupValue.value_name) == value.lower()),
    ).all()
    if len(rows) != 1:
        raise HTTPException(422, f"Unsupported {category.lower().replace('_', ' ')}: {value}")
    return rows[0].id


def resolve_geography(db, city, state, country="India"):
    def resolve(model, name_column, value, *scope):
        if not clean(value):
            raise HTTPException(422, "Address requires a city, state, and country")
        rows = db.query(model.id).filter(
            func.lower(name_column) == value.strip().lower(),
            model.is_active.is_(True), model.deleted_at.is_(None), *scope,
        ).all()
        if len(rows) != 1:
            raise HTTPException(422, f"Unknown or ambiguous {name_column.key}: {value}. Check the address geography.")
        return rows[0].id

    country_id = resolve(Country, Country.country_name, country)
    state_id = resolve(State, State.state_name, state, State.country_id == country_id)
    city_id = resolve(City, City.city_name, city, City.state_id == state_id)
    return dict(country_id=country_id, state_id=state_id, city_id=city_id)


def primary_record(records):
    active = [row for row in records if row.deleted_at is None and row.is_active]
    return next((row for row in active if row.is_primary), None)


ADDRESS_FIELDS = {"address_line1", "address_line2", "city", "state", "country", "pincode"}
BANK_FIELDS = {"bank_name", "account_number", "ifsc_code", "account_type"}


def save_address(db, party, data):
    if not ADDRESS_FIELDS.intersection(data):
        return
    address = primary_record(party.addresses)
    values = dict(
        address_line1=address.address_line1 if address else None,
        address_line2=address.address_line2 if address else None,
        city=address.city.city_name if address else None,
        state=address.state.state_name if address else None,
        country=address.country.country_name if address else "India",
        pincode=address.postal_code if address else None,
    )
    values.update({key: clean(data[key]) for key in ADDRESS_FIELDS.intersection(data)})
    # A default country alone is not an address. Clearing the section retires it.
    if not any(values[key] for key in ADDRESS_FIELDS - {"country"}):
        if address:
            address.deleted_at = datetime.utcnow()
            address.is_active = False
            address.is_primary = False
        return
    if not values["address_line1"]:
        raise HTTPException(422, "Address line 1 is required when providing an address")
    ids = resolve_geography(db, values["city"], values["state"], values["country"])
    if address is None:
        address = PartyAddress(
            party=party, address_type_id=lookup_id(db, "ADDRESS_TYPE", "HOME"),
            is_primary=True,
        )
        db.add(address)
    for key, value in ids.items():
        setattr(address, key, value)
    address.address_line1 = values["address_line1"]
    address.address_line2 = values["address_line2"]
    address.postal_code = values["pincode"]


def save_bank_account(db, party, data):
    if not BANK_FIELDS.intersection(data):
        return
    # Older data may have no primary flag. Use a deterministic existing account.
    active = sorted((row for row in party.bank_accounts
                     if row.deleted_at is None and row.is_active), key=lambda row: row.id)
    bank = primary_record(active) or next(iter(active), None)
    values = {key: getattr(bank, key, None) for key in BANK_FIELDS - {"account_type"}}
    values.update({key: clean(data[key]) for key in BANK_FIELDS.intersection(data)})
    account_type_id = bank.account_type_id if bank else None
    if "account_type" in data:
        account_type_id = lookup_id(db, "BANK_ACCOUNT_TYPE", values["account_type"])
    if not any(values.values()) and account_type_id is None:
        if bank:
            bank.deleted_at = datetime.utcnow()
            bank.is_active = False
            bank.is_primary = False
        return
    if not values["bank_name"] or not values["account_number"]:
        raise HTTPException(422, "Bank name and account number are required when providing bank details")
    if bank is None:
        bank = PartyBankAccount(party=party, is_primary=True)
        db.add(bank)
    for key in BANK_FIELDS - {"account_type"}:
        setattr(bank, key, values[key])
    bank.account_type_id = account_type_id
