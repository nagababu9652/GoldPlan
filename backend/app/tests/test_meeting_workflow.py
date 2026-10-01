from datetime import datetime, timedelta

import pytest
from pydantic import ValidationError

from app.schemas.meeting import MeetingCreate


def meeting_payload(**updates):
    start = datetime(2026, 10, 1, 10, 0)
    payload = {
        "title": "Quarterly review",
        "meeting_type": "review",
        "scheduled_start": start,
        "scheduled_end": start + timedelta(hours=1),
        "status": "scheduled",
        "customer_id": 4,
    }
    payload.update(updates)
    return payload


def test_meeting_normalizes_valid_type_and_status():
    meeting = MeetingCreate(**meeting_payload())
    assert meeting.meeting_type == "REVIEW"
    assert meeting.status == "SCHEDULED"


def test_meeting_requires_owner_and_forward_time_range():
    with pytest.raises(ValidationError, match="customer or customer group"):
        MeetingCreate(**meeting_payload(customer_id=None))
    with pytest.raises(ValidationError, match="end time must be after"):
        start = datetime(2026, 10, 1, 10, 0)
        MeetingCreate(**meeting_payload(scheduled_start=start, scheduled_end=start))


def test_meeting_rejects_unknown_workflow_values():
    with pytest.raises(ValidationError, match="Unsupported meeting type"):
        MeetingCreate(**meeting_payload(meeting_type="UNKNOWN"))
    with pytest.raises(ValidationError, match="Unsupported meeting status"):
        MeetingCreate(**meeting_payload(status="UNKNOWN"))
