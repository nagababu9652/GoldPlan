"""add crm meetings

Revision ID: 96cc75cd9687
Revises: 9691d15cda8f
Create Date: 2026-09-27 13:10:23.526555

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "96cc75cd9687"
down_revision: Union[str, Sequence[str], None] = "9691d15cda8f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "meetings",
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
            "advisor_employee_id",
            sa.BigInteger(),
            nullable=False,
        ),
        sa.Column(
            "meeting_type",
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
            "scheduled_start",
            sa.DateTime(),
            nullable=False,
        ),
        sa.Column(
            "scheduled_end",
            sa.DateTime(),
            nullable=False,
        ),
        sa.Column(
            "location",
            sa.String(length=250),
            nullable=True,
        ),
        sa.Column(
            "meeting_link",
            sa.String(length=500),
            nullable=True,
        ),
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
        ),
        sa.Column(
            "outcome",
            sa.Text(),
            nullable=True,
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
            ["advisor_employee_id"],
            ["organization.employees.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        schema="crm",
    )


def downgrade() -> None:
    op.drop_table("meetings", schema="crm")