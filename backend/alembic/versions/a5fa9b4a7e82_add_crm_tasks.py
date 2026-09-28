"""add crm tasks

Revision ID: a5fa9b4a7e82
Revises: 96cc75cd9687
Create Date: 2026-09-27 15:55:00.461499
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a5fa9b4a7e82"
down_revision: Union[str, Sequence[str], None] = "96cc75cd9687"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "tasks",
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
            "assigned_employee_id",
            sa.BigInteger(),
            nullable=False,
        ),
        sa.Column(
            "task_type",
            sa.String(length=30),
            nullable=False,
        ),
        sa.Column(
            "title",
            sa.String(length=250),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "due_at",
            sa.DateTime(),
            nullable=False,
        ),
        sa.Column(
            "priority",
            sa.String(length=20),
            nullable=False,
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
            "completed_at",
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
            ["assigned_employee_id"],
            ["organization.employees.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        schema="crm",
    )


def downgrade() -> None:
    op.drop_table(
        "tasks",
        schema="crm",
    )