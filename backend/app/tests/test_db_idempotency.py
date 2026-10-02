"""Opt-in PostgreSQL tests for retry-safe create reservations."""
import os
from concurrent.futures import ThreadPoolExecutor
from threading import Event
from time import sleep
from uuid import uuid4

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.identity.idempotency import IdempotencyKey
from app.services.idempotency import finish_create, reserve_create


pytestmark = pytest.mark.skipif(
    os.getenv("FINPLAN_SECURITY_TEST_DB") != "1",
    reason="Requires isolated finplan_security_test PostgreSQL database",
)


@pytest.fixture
def engine():
    url = make_url(settings.database_url).set(database="finplan_security_test")
    assert url.database == "finplan_security_test"
    db_engine = create_engine(url)
    try:
        yield db_engine
    finally:
        db_engine.dispose()


def test_same_key_replays_resource_and_rejects_changed_payload(engine):
    key = uuid4().hex
    payload = {"name": "First"}
    key_hash = None
    try:
        with Session(engine) as db:
            reservation = reserve_create(db, key=key, operation="client.create", actor_scope="user:1", payload=payload)
            assert reservation and not reservation.replay
            key_hash = reservation.key_hash
            finish_create(db, reservation, 42)
            db.commit()

        with Session(engine) as db:
            replay = reserve_create(db, key=key, operation="client.create", actor_scope="user:1", payload=payload)
            assert replay and replay.replay and replay.resource_id == 42
            with pytest.raises(HTTPException) as error:
                reserve_create(db, key=key, operation="client.create", actor_scope="user:1",
                               payload={"name": "Changed"})
            assert error.value.status_code == 409
    finally:
        if key_hash:
            with Session(engine) as db:
                db.query(IdempotencyKey).filter(IdempotencyKey.key_hash == key_hash).delete()
                db.commit()


def test_concurrent_retry_waits_for_first_commit(engine):
    key = uuid4().hex
    ready = Event()
    retry_started = Event()
    release = Event()
    key_hash = None

    def first():
        with Session(engine) as db:
            reservation = reserve_create(db, key=key, operation="group.create",
                                         actor_scope="user:2", payload={"name": "Household"})
            ready.set()
            assert release.wait(timeout=10)
            finish_create(db, reservation, 81)
            db.commit()
            return reservation

    def second():
        assert ready.wait(timeout=10)
        with Session(engine) as db:
            retry_started.set()
            return reserve_create(db, key=key, operation="group.create",
                                  actor_scope="user:2", payload={"name": "Household"})

    try:
        with ThreadPoolExecutor(max_workers=2) as pool:
            original = pool.submit(first)
            retry = pool.submit(second)
            assert retry_started.wait(timeout=10)
            sleep(0.1)
            assert not retry.done()
            release.set()
            first_result = original.result(timeout=10)
            retry_result = retry.result(timeout=10)
        key_hash = first_result.key_hash
        assert first_result.replay is False
        assert retry_result.replay is True
        assert retry_result.resource_id == 81
    finally:
        release.set()
        if key_hash:
            with Session(engine) as db:
                db.query(IdempotencyKey).filter(IdempotencyKey.key_hash == key_hash).delete()
                db.commit()


def test_failed_create_rolls_back_key_so_it_can_be_retried(engine):
    key = uuid4().hex
    with Session(engine) as db:
        first = reserve_create(db, key=key, operation="employee.create",
                               actor_scope="user:3", payload={"code": "E1"})
        assert first and not first.replay
        db.rollback()

    try:
        with Session(engine) as db:
            retry = reserve_create(db, key=key, operation="employee.create",
                                   actor_scope="user:3", payload={"code": "E1"})
            assert retry and not retry.replay
            finish_create(db, retry, 12)
            db.commit()
    finally:
        with Session(engine) as db:
            db.query(IdempotencyKey).filter(IdempotencyKey.key_hash == first.key_hash).delete()
            db.commit()
