from app.routers.advisors import router as advisors_router


def test_advisor_documents_route_is_not_legacy_stub():
    paths = [getattr(route, "path", None) for route in advisors_router.routes]
    assert "/advisors/documents" not in paths
