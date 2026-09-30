# Legacy cleanup

The active application uses the `foundation`, `identity`, `organization`, and
`crm` schemas. `public.alembic_version` is Alembic infrastructure and is retained.

Removed code includes the starter Items API/model/schema, unused public OTP model,
legacy user alias/schema/auth service, duplicate OTPRequest mapper, and six old
public-table migration/reset scripts. Current identity authentication, OTP delivery,
and CRM routes remain in place. Earlier Alembic revisions are retained.

## Database removal completed

`advisor.meetings` was the only unmapped business table. It had four rows; no active
code referenced it. The current meeting API uses `crm.meetings` (one row at review).
The two datasets have not been assumed equivalent or merged.

The `advisor` schema was backed up to:

`.local-backups/legacy-advisor-20260930-125551.dump` (relative to the repository root).

This custom-format PostgreSQL backup includes the legacy table definition, four
records, indexes, constraints, and owned sequence. The directory is Git-ignored.

Migration `7ed7c088b0a9` removes the old table and then the empty schema using
`RESTRICT`, never `CASCADE`. Its guard blocks deletion of nonempty data until
explicitly authorized. After approval, from `backend`:

```powershell
alembic -x drop_legacy_meetings=true upgrade head
```

Applied with user approval on 2026-09-30. Before removal, the archive checksum and
all four backed-up records were verified against the live table. After removal,
all 67 active tables retained their row counts and Alembic reported revision
`7ed7c088b0a9`. The four retired records remain in the local archive.

If new legacy writes occur before applying, take and verify another backup first.
No change is made to `crm.meetings` or client membership history.

## Restore

Use PostgreSQL `pg_restore` with the configured database connection and the archive
above to restore the retired `advisor` schema. Do not pass `--clean` against active
schemas. Once restoration is verified, `alembic stamp 9781f0b971a5` restores the
pre-cleanup revision marker (only when this cleanup is the latest applied revision).
The downgrade intentionally refuses to silently recreate an empty legacy table.
