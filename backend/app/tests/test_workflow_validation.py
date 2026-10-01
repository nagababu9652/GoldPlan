from datetime import datetime, timedelta
import pytest
from pydantic import ValidationError

from app.schemas.compliance import KYCUpdate, ServiceTeamCreate
from app.schemas.document import DocumentCreate
from app.schemas.message import MessageCreate
from app.schemas.task import TaskCreate


def test_task_workflow_values_and_owner_are_validated():
    task = TaskCreate(
        title="Call client", task_type="call", priority="high", status="pending",
        due_at=datetime.now() + timedelta(days=1), customer_id=4,
    )
    assert (task.task_type, task.priority, task.status) == ("CALL", "HIGH", "PENDING")
    with pytest.raises(ValidationError, match="customer or customer group"):
        TaskCreate(title="No owner", due_at=datetime.now())


def test_document_and_message_contracts_validate_values():
    document = DocumentCreate(document_name="PAN", document_type="pan", customer_id=4)
    message = MessageCreate(body="Review reminder", message_type="follow_up", customer_id=4)
    assert document.document_type == "PAN"
    assert message.message_type == "FOLLOW_UP"
    with pytest.raises(ValidationError, match="Exactly one document owner"):
        DocumentCreate(document_name="Invalid", customer_id=4, customer_group_id=2)


def test_compliance_and_service_roles_are_bounded():
    assert KYCUpdate(kyc_status="verified").kyc_status == "VERIFIED"
    assert ServiceTeamCreate(employee_id=2, role="compliance").role == "COMPLIANCE"
    with pytest.raises(ValidationError, match="Unsupported service role"):
        ServiceTeamCreate(employee_id=2, role="OWNER")
