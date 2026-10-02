"""Seed document category and types for ARN registrations.

Revision ID: 7eac361b92d0
Revises: f19a7c52b604
"""
from alembic import op
import sqlalchemy as sa

revision = "7eac361b92d0"
down_revision = "f19a7c52b604"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(sa.text("""
        INSERT INTO foundation.document_categories (category_code, category_name, description, is_system)
        VALUES ('ARN', 'ARN documents', 'ARN registration and renewal records', true)
        ON CONFLICT (category_code) DO NOTHING
    """))
    op.execute(sa.text("""
        INSERT INTO foundation.document_types
            (category_id, type_code, type_name, allowed_extensions, max_file_size_mb)
        SELECT c.id, v.code, v.name, 'pdf,jpg,jpeg,png', 10
        FROM foundation.document_categories c
        CROSS JOIN (VALUES
            ('ARN_REGISTRATION', 'ARN registration certificate'),
            ('ARN_RENEWAL', 'ARN renewal certificate'),
            ('ARN_SUPPORTING', 'ARN supporting document')
        ) AS v(code, name)
        WHERE c.category_code = 'ARN'
        ON CONFLICT (type_code) DO NOTHING
    """))


def downgrade() -> None:
    op.execute(sa.text("""
        DELETE FROM foundation.document_types
        WHERE type_code IN ('ARN_REGISTRATION', 'ARN_RENEWAL', 'ARN_SUPPORTING')
          AND NOT EXISTS (
              SELECT 1 FROM foundation.documents d
              WHERE d.document_type_id = document_types.id
          )
    """))
    op.execute(sa.text("""
        DELETE FROM foundation.document_categories
        WHERE category_code = 'ARN'
          AND NOT EXISTS (
              SELECT 1 FROM foundation.document_types t
              WHERE t.category_id = document_categories.id
          )
    """))
