"""add crm documents

Revision ID: xxxx_add_crm_documents
Revises: 57f6166c65e1
Create Date: 2026-09-27
"""

from alembic import op
import sqlalchemy as sa


revision: str = '1a1470864683'
down_revision = '57f6166c65e1'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "documents",
        sa.Column(
            "id",
            sa.BigInteger(),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "organization_id",
            sa.BigInteger(),
            nullable=False,
        ),
        sa.Column(
            "customer_id",
            sa.BigInteger(),
            nullable=True,
        ),
        sa.Column(
            "customer_group_id",
            sa.BigInteger(),
            nullable=True,
        ),
        sa.Column(
            "uploaded_by_employee_id",
            sa.BigInteger(),
            nullable=False,
        ),
        sa.Column(
            "document_type",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column(
            "document_name",
            sa.String(length=250),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "file_name",
            sa.String(length=250),
            nullable=True,
        ),
        sa.Column(
            "file_url",
            sa.String(length=1000),
            nullable=True,
        ),
        sa.Column(
            "file_type",
            sa.String(length=100),
            nullable=True,
        ),
        sa.Column(
            "file_size",
            sa.BigInteger(),
            nullable=True,
        ),
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
        ),
        sa.Column(
            "notes",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organization.organizations.id"],
        ),
        sa.ForeignKeyConstraint(
            ["customer_id"],
            ["crm.customers.id"],
        ),
        sa.ForeignKeyConstraint(
            ["customer_group_id"],
            ["crm.customer_groups.id"],
        ),
        sa.ForeignKeyConstraint(
            ["uploaded_by_employee_id"],
            ["organization.employees.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        schema="crm",
    )


def downgrade():
    op.drop_table(
        "documents",
        schema="crm",
    )