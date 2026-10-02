"""Transactional request-key reservation for create endpoints.

The reservation and the business record must be committed in the same Session.
PostgreSQL's unique key makes a concurrent retry wait for the first transaction.
"""
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import hashlib
import json
import re

from fastapi import HTTPException
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from ..models.identity.idempotency import IdempotencyKey


KEY_PATTERN = re.compile(r"^[A-Za-z0-9._:-]{16,128}$")


@dataclass(frozen=True)
class Reservation:
    key_hash: str
    replay: bool
    resource_id: int | None = None


def reserve_create(
    db: Session, *, key: str | None, operation: str, actor_scope: str, payload: dict,
) -> Reservation | None:
    # FastAPI's Header default is a descriptor when the endpoint is called
    # directly in unit tests. It represents an omitted header, not a key.
    if not isinstance(key, str):
        return None
    if not KEY_PATTERN.fullmatch(key):
        raise HTTPException(400, "Idempotency-Key must be 16–128 letters, digits, or ._:-")

    key_hash = hashlib.sha256(f"{operation}\0{actor_scope}\0{key}".encode()).hexdigest()
    request_hash = hashlib.sha256(
        json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str).encode()
    ).hexdigest()
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if int(key_hash[:2], 16) == 0:
        db.query(IdempotencyKey).filter(
            IdempotencyKey.expires_at < now - timedelta(days=7)
        ).delete(synchronize_session=False)
    statement = insert(IdempotencyKey).values(
        key_hash=key_hash, request_hash=request_hash, operation=operation,
        actor_scope=actor_scope, expires_at=now + timedelta(days=1),
    )
    statement = statement.on_conflict_do_update(
        index_elements=[IdempotencyKey.key_hash],
        set_={
            "request_hash": request_hash,
            "resource_id": None,
            "created_at": now,
            "expires_at": now + timedelta(days=1),
        },
        where=IdempotencyKey.expires_at <= now,
    ).returning(IdempotencyKey.key_hash)
    created = db.execute(statement).scalar_one_or_none()
    if created:
        return Reservation(key_hash=key_hash, replay=False)

    previous = db.get(IdempotencyKey, key_hash)
    if previous is None:
        raise HTTPException(409, "Request is already being processed")
    if previous.request_hash != request_hash:
        raise HTTPException(409, "Idempotency-Key was used with different data")
    if previous.resource_id is None:
        raise HTTPException(409, "Request is already being processed")
    return Reservation(key_hash=key_hash, replay=True, resource_id=previous.resource_id)


def finish_create(db: Session, reservation: Reservation | None, resource_id: int) -> None:
    if reservation is None:
        return
    record = db.get(IdempotencyKey, reservation.key_hash)
    if record is None or reservation.replay:
        raise RuntimeError("Missing active idempotency reservation")
    record.resource_id = resource_id
