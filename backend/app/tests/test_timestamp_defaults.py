"""Audit default checks; opt in to PostgreSQL checks with FINPLAN_DB_TESTS=1."""

import importlib.util
import os
from pathlib import Path

import pytest
from sqlalchemy import Column, DateTime, MetaData, Table, text

import app.models
from app.models.base import Base


def migration_module():
    path = Path(__file__).resolve().parents[2] / "alembic/versions/9781f0b971a5_set_database_current_timestamp_defaults.py"
    spec = importlib.util.spec_from_file_location("timestamp_defaults_migration", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_audit_columns_have_database_defaults():
    for table in Base.metadata.tables.values():
        for column in table.columns:
            if column.name in {"created_at", "updated_at"}:
                assert column.server_default is not None, str(column)
                assert str(column.server_default.arg) == "CURRENT_TIMESTAMP", str(column)


def test_optional_and_scheduled_timestamps_have_no_implicit_event():
    names = {
        "deleted_at", "read_at", "completed_at", "verified_at", "revoked_at",
        "expires_at", "due_at", "scheduled_start", "scheduled_end", "logout_time",
        "effective_to", "locked_at", "unlock_at", "last_login_at",
    }
    for table in Base.metadata.tables.values():
        for column in table.columns:
            if column.name in names:
                assert column.server_default is None, str(column)


def test_migration_matches_current_models():
    rows = migration_module().TIMESTAMP_DEFAULTS
    assert len(rows) == len({row[:3] for row in rows})
    for schema, table, name, _old in rows:
        column = Base.metadata.tables[f"{schema}.{table}"].c[name]
        assert isinstance(column.type, DateTime)
        assert str(column.server_default.arg) == "CURRENT_TIMESTAMP"


@pytest.mark.skipif(os.getenv("FINPLAN_DB_TESTS") != "1", reason="Requires configured PostgreSQL")
def test_postgres_defaults_apply_to_raw_inserts():
    from app.database.session import engine

    with engine.connect() as conn:
        transaction = conn.begin()
        try:
            actual = {
                (r.table_schema, r.table_name, r.column_name): r.column_default
                for r in conn.execute(text("""
                    SELECT table_schema, table_name, column_name, column_default
                    FROM information_schema.columns
                    WHERE table_schema IN ('crm','foundation','identity','organization')
                """)).mappings()
            }
            defaults = []
            for schema, table, name, _old in migration_module().TIMESTAMP_DEFAULTS:
                default = actual[(schema, table, name)]
                assert default == "CURRENT_TIMESTAMP", (schema, table, name, default)
                defaults.append(default)

            # Exercise the live defaults without inserting any application records.
            probe = Table(
                "finplan_timestamp_default_probe", MetaData(),
                *(Column(f"stamp_{i}", DateTime, server_default=text(value))
                  for i, value in enumerate(defaults)),
                prefixes=["TEMPORARY"], postgresql_on_commit="DROP",
            )
            probe.create(conn)
            row = conn.execute(probe.insert().returning(*probe.c)).one()
            expected = conn.scalar(text("SELECT CURRENT_TIMESTAMP::timestamp"))
            assert all(value == expected for value in row)
        finally:
            transaction.rollback()
