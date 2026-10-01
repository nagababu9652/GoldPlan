import importlib.util
from pathlib import Path

from app.services.permission_catalog import (
    ADVISOR_PERMISSIONS,
    PERMISSION_CODES,
    PROFILE_DEFINITIONS,
)


def load_seed_migration():
    path = Path(__file__).parents[2] / "alembic" / "versions" / "91ad7e60c2b4_seed_authorization_catalog.py"
    spec = importlib.util.spec_from_file_location("permission_seed_migration", path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def test_runtime_and_migration_catalogs_cannot_drift():
    migration = load_seed_migration()
    assert set(migration.PERMISSIONS) == set(PERMISSION_CODES)
    assert set(migration.ADVISOR_PERMISSIONS) == set(ADVISOR_PERMISSIONS)


def test_default_profiles_follow_least_privilege_boundary():
    head = PROFILE_DEFINITIONS["HEAD_FULL"][1]
    advisor = PROFILE_DEFINITIONS["FINANCIAL_ADVISOR_STANDARD"][1]
    assert head == frozenset(PERMISSION_CODES)
    assert advisor == ADVISOR_PERMISSIONS
    assert "PROFILE.READ" in advisor
    assert "ORG.PERMISSION.MANAGE" not in advisor
    assert "ORG.EMPLOYEE.ACCESS_MANAGE" not in advisor
    assert "CLIENT.DEACTIVATE" not in advisor
    assert advisor < head

