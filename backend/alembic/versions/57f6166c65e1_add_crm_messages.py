"""add crm messages

Revision ID: 57f6166c65e1
Revises: a5fa9b4a7e82
Create Date: 2026-09-27 17:18:57.150577
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "57f6166c65e1"
down_revision: Union[str, Sequence[str], None] = "a5fa9b4a7e82"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "messages",
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
            "sender_employee_id",
            sa.BigInteger(),
            nullable=False,
        ),
        sa.Column(
            "message_type",
            sa.String(length=30),
            nullable=False,
        ),
        sa.Column(
            "subject",
            sa.String(length=250),
            nullable=True,
        ),
        sa.Column(
            "body",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
        ),
        sa.Column(
            "sent_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.Column(
            "read_at",
            sa.DateTime(),
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
            ["sender_employee_id"],
            ["organization.employees.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        schema="crm",
    )


def downgrade() -> None:
    op.drop_table(
        "messages",
        schema="crm",
    )