"""set database current timestamp defaults

Revision ID: 9781f0b971a5
Revises: 6dd5e4eec71c
Create Date: 2026-09-30 12:49:52.570447

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9781f0b971a5'
down_revision: Union[str, Sequence[str], None] = '6dd5e4eec71c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Frozen list of mapped columns and their previous database defaults.
# No historical values, nullability, or timestamp types are changed.
TIMESTAMP_DEFAULTS = (
    ('crm', 'customer_communication_preferences', 'updated_at', None),
    ('crm', 'customer_groups', 'created_at', 'CURRENT_TIMESTAMP'),
    ('crm', 'customer_groups', 'updated_at', None),
    ('crm', 'customer_kyc', 'created_at', 'CURRENT_TIMESTAMP'),
    ('crm', 'customer_kyc', 'updated_at', None),
    ('crm', 'customer_kyc_history', 'reviewed_on', 'CURRENT_TIMESTAMP'),
    ('crm', 'customer_merge_history', 'merged_at', 'CURRENT_TIMESTAMP'),
    ('crm', 'customer_relationships', 'created_at', 'CURRENT_TIMESTAMP'),
    ('crm', 'customer_status_history', 'changed_on', 'CURRENT_TIMESTAMP'),
    ('crm', 'customers', 'created_at', 'CURRENT_TIMESTAMP'),
    ('crm', 'customers', 'updated_at', None),
    ('crm', 'documents', 'created_at', None),
    ('crm', 'documents', 'updated_at', None),
    ('crm', 'group_merge_history', 'merged_at', 'CURRENT_TIMESTAMP'),
    ('crm', 'group_split_history', 'split_at', 'CURRENT_TIMESTAMP'),
    ('crm', 'meetings', 'created_at', None),
    ('crm', 'meetings', 'updated_at', None),
    ('crm', 'messages', 'created_at', None),
    ('crm', 'messages', 'sent_at', None),
    ('crm', 'messages', 'updated_at', None),
    ('crm', 'tasks', 'created_at', None),
    ('crm', 'tasks', 'updated_at', None),
    ('crm', 'transaction_history', 'changed_at', None),
    ('crm', 'transactions', 'created_at', None),
    ('crm', 'transactions', 'updated_at', None),
    ('foundation', 'cities', 'created_at', 'CURRENT_TIMESTAMP'),
    ('foundation', 'cities', 'updated_at', None),
    ('foundation', 'countries', 'created_at', 'CURRENT_TIMESTAMP'),
    ('foundation', 'countries', 'updated_at', None),
    ('foundation', 'currencies', 'created_at', 'CURRENT_TIMESTAMP'),
    ('foundation', 'currencies', 'updated_at', None),
    ('foundation', 'document_categories', 'created_at', 'CURRENT_TIMESTAMP'),
    ('foundation', 'document_categories', 'updated_at', None),
    ('foundation', 'document_files', 'uploaded_at', 'CURRENT_TIMESTAMP'),
    ('foundation', 'document_types', 'created_at', 'CURRENT_TIMESTAMP'),
    ('foundation', 'document_types', 'updated_at', None),
    ('foundation', 'documents', 'created_at', 'CURRENT_TIMESTAMP'),
    ('foundation', 'documents', 'updated_at', None),
    ('foundation', 'financial_years', 'created_at', 'CURRENT_TIMESTAMP'),
    ('foundation', 'financial_years', 'updated_at', None),
    ('foundation', 'lookup_categories', 'created_at', 'CURRENT_TIMESTAMP'),
    ('foundation', 'lookup_categories', 'updated_at', None),
    ('foundation', 'lookup_values', 'created_at', 'CURRENT_TIMESTAMP'),
    ('foundation', 'lookup_values', 'updated_at', None),
    ('foundation', 'parties', 'created_at', 'CURRENT_TIMESTAMP'),
    ('foundation', 'parties', 'updated_at', None),
    ('foundation', 'party_addresses', 'created_at', 'CURRENT_TIMESTAMP'),
    ('foundation', 'party_addresses', 'updated_at', None),
    ('foundation', 'party_bank_accounts', 'created_at', 'CURRENT_TIMESTAMP'),
    ('foundation', 'party_bank_accounts', 'updated_at', None),
    ('foundation', 'party_contacts', 'created_at', 'CURRENT_TIMESTAMP'),
    ('foundation', 'party_contacts', 'updated_at', None),
    ('foundation', 'states', 'created_at', 'CURRENT_TIMESTAMP'),
    ('foundation', 'states', 'updated_at', None),
    ('identity', 'account_lockouts', 'created_at', 'CURRENT_TIMESTAMP'),
    ('identity', 'audit_logs', 'created_at', 'CURRENT_TIMESTAMP'),
    ('identity', 'authentication_methods', 'created_at', 'CURRENT_TIMESTAMP'),
    ('identity', 'authentication_methods', 'updated_at', None),
    ('identity', 'devices', 'created_at', 'CURRENT_TIMESTAMP'),
    ('identity', 'login_history', 'login_timestamp', 'CURRENT_TIMESTAMP'),
    ('identity', 'otp_requests', 'created_at', 'CURRENT_TIMESTAMP'),
    ('identity', 'password_history', 'changed_at', 'CURRENT_TIMESTAMP'),
    ('identity', 'permission_profiles', 'created_at', 'CURRENT_TIMESTAMP'),
    ('identity', 'permission_profiles', 'updated_at', None),
    ('identity', 'permissions', 'created_at', 'CURRENT_TIMESTAMP'),
    ('identity', 'permissions', 'updated_at', None),
    ('identity', 'profile_permissions', 'created_at', 'CURRENT_TIMESTAMP'),
    ('identity', 'refresh_tokens', 'created_at', 'CURRENT_TIMESTAMP'),
    ('identity', 'role_permission_profiles', 'assigned_at', 'CURRENT_TIMESTAMP'),
    ('identity', 'roles', 'created_at', 'CURRENT_TIMESTAMP'),
    ('identity', 'roles', 'updated_at', None),
    ('identity', 'security_events', 'event_timestamp', 'CURRENT_TIMESTAMP'),
    ('identity', 'user_devices', 'created_at', 'CURRENT_TIMESTAMP'),
    ('identity', 'user_roles', 'assigned_at', 'CURRENT_TIMESTAMP'),
    ('identity', 'user_roles', 'effective_from', 'CURRENT_TIMESTAMP'),
    ('identity', 'user_sessions', 'login_time', 'CURRENT_TIMESTAMP'),
    ('identity', 'users', 'created_at', 'CURRENT_TIMESTAMP'),
    ('identity', 'users', 'updated_at', None),
    ('organization', 'branches', 'created_at', 'CURRENT_TIMESTAMP'),
    ('organization', 'branches', 'updated_at', None),
    ('organization', 'departments', 'created_at', 'CURRENT_TIMESTAMP'),
    ('organization', 'departments', 'updated_at', None),
    ('organization', 'designations', 'created_at', 'CURRENT_TIMESTAMP'),
    ('organization', 'designations', 'updated_at', None),
    ('organization', 'employee_assignments', 'created_at', 'CURRENT_TIMESTAMP'),
    ('organization', 'employee_assignments', 'updated_at', None),
    ('organization', 'employee_certifications', 'created_at', 'CURRENT_TIMESTAMP'),
    ('organization', 'employee_roles', 'assigned_at', 'CURRENT_TIMESTAMP'),
    ('organization', 'employee_skills', 'created_at', 'CURRENT_TIMESTAMP'),
    ('organization', 'employees', 'created_at', 'CURRENT_TIMESTAMP'),
    ('organization', 'employees', 'updated_at', None),
    ('organization', 'organization_holidays', 'created_at', 'CURRENT_TIMESTAMP'),
    ('organization', 'organization_settings', 'created_at', 'CURRENT_TIMESTAMP'),
    ('organization', 'organization_settings', 'updated_at', None),
    ('organization', 'organizations', 'created_at', 'CURRENT_TIMESTAMP'),
    ('organization', 'organizations', 'updated_at', None),
)


def upgrade() -> None:
    for schema, table, column, _previous_default in TIMESTAMP_DEFAULTS:
        op.alter_column(
            table, column, schema=schema,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        )


def downgrade() -> None:
    for schema, table, column, previous_default in reversed(TIMESTAMP_DEFAULTS):
        op.alter_column(
            table, column, schema=schema,
            server_default=sa.text(previous_default) if previous_default else None,
        )
