"""sync organization audit columns

Revision ID: 70786ed5eae1
Revises: 044bfde6bd51
Create Date: 2026-09-25 18:19:53.238603

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "70786ed5eae1"
down_revision: Union[str, Sequence[str], None] = "044bfde6bd51"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Synchronize organization audit columns."""

    # departments
    op.add_column(
        "departments",
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        schema="organization",
    )
    op.add_column(
        "departments",
        sa.Column("deleted_by", sa.BigInteger(), nullable=True),
        schema="organization",
    )

    # designations
    op.add_column(
        "designations",
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        schema="organization",
    )
    op.add_column(
        "designations",
        sa.Column("deleted_by", sa.BigInteger(), nullable=True),
        schema="organization",
    )

    # organization_settings
    op.add_column(
        "organization_settings",
        sa.Column("created_by", sa.BigInteger(), nullable=True),
        schema="organization",
    )
    op.add_column(
        "organization_settings",
        sa.Column("updated_by", sa.BigInteger(), nullable=True),
        schema="organization",
    )
    op.add_column(
        "organization_settings",
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        schema="organization",
    )
    op.add_column(
        "organization_settings",
        sa.Column("deleted_by", sa.BigInteger(), nullable=True),
        schema="organization",
    )
    op.add_column(
        "organization_settings",
        sa.Column(
            "version_no",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("1"),
        ),
        schema="organization",
    )
    op.add_column(
        "organization_settings",
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        ),
        schema="organization",
    )

    # employee_assignments already contains all AuditMixin columns
    # because deleted_at/deleted_by were manually added earlier.
    # No ALTER TABLE is required here.


def downgrade() -> None:
    """Revert organization audit columns."""

    # organization_settings
    op.drop_column(
        "organization_settings",
        "is_active",
        schema="organization",
    )
    op.drop_column(
        "organization_settings",
        "version_no",
        schema="organization",
    )
    op.drop_column(
        "organization_settings",
        "deleted_by",
        schema="organization",
    )
    op.drop_column(
        "organization_settings",
        "deleted_at",
        schema="organization",
    )
    op.drop_column(
        "organization_settings",
        "updated_by",
        schema="organization",
    )
    op.drop_column(
        "organization_settings",
        "created_by",
        schema="organization",
    )

    # designations
    op.drop_column(
        "designations",
        "deleted_by",
        schema="organization",
    )
    op.drop_column(
        "designations",
        "deleted_at",
        schema="organization",
    )

    # departments
    op.drop_column(
        "departments",
        "deleted_by",
        schema="organization",
    )
    op.drop_column(
        "departments",
        "deleted_at",
        schema="organization",
    )