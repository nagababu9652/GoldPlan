"""PostgreSQL regression test for single-use OTP verification under concurrency."""
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from threading import Barrier
from uuid import uuid4

import pytest
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.identity.auth import OTPRequest
from app.services.otp_service import hash_otp, verify_otp


@pytest.mark.skipif(os.getenv("FINPLAN_SECURITY_TEST_DB") != "1",
                    reason="Requires isolated finplan_security_test PostgreSQL database")
def test_same_otp_cannot_be_verified_twice_concurrently():
    url = make_url(settings.database_url).set(database="finplan_security_test")
    assert url.database == "finplan_security_test"
    engine = create_engine(url)
    destination = f"otp-race-{uuid4().hex}@example.com"
    code = "123456"
    otp_id = None
    try:
        with Session(engine) as setup:
            record = OTPRequest(
                destination=destination, purpose="password_reset",
                otp_code_hash=hash_otp(code),
                expires_at=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=10),
            )
            setup.add(record)
            setup.commit()
            otp_id = record.id

        start = Barrier(2)

        def attempt():
            with Session(engine) as session:
                start.wait(timeout=10)
                return verify_otp(session, destination, code, "password_reset")

        with ThreadPoolExecutor(max_workers=2) as pool:
            assert sorted(pool.map(lambda _: attempt(), range(2))) == [False, True]

        with Session(engine) as verify:
            record = verify.get(OTPRequest, otp_id)
            assert record.is_used is True
            assert record.verified_at is not None
    finally:
        if otp_id is not None:
            with Session(engine) as cleanup:
                cleanup.query(OTPRequest).filter(OTPRequest.id == otp_id).delete()
                cleanup.commit()
        engine.dispose()
