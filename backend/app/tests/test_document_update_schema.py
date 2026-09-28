from app.schemas.document import DocumentUpdate


def test_document_update_accepts_customer_and_group_targets():
    payload = DocumentUpdate(
        document_type="KYC",
        description="Updated description",
        customer_id=42,
        customer_group_id=None,
        notes="Updated note",
    )

    assert payload.customer_id == 42
    assert payload.customer_group_id is None
    assert payload.document_type == "KYC"
    assert payload.description == "Updated description"
    assert payload.notes == "Updated note"
