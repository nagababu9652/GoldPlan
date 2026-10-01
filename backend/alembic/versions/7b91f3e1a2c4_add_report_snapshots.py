"""add immutable report snapshots"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "7b91f3e1a2c4"
down_revision = "64dd8d21c320"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "report_snapshots",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("organization_id", sa.BigInteger(), nullable=False),
        sa.Column("advisor_employee_id", sa.BigInteger(), nullable=False),
        sa.Column("title", sa.String(length=250), nullable=False),
        sa.Column("report_type", sa.String(length=40), nullable=False),
        sa.Column("report_date", sa.Date(), nullable=False),
        sa.Column("period_start", sa.Date(), nullable=False),
        sa.Column("period_end", sa.Date(), nullable=False),
        sa.Column("assumptions", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("created_by", sa.BigInteger(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.Column("updated_by", sa.BigInteger(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("deleted_by", sa.BigInteger(), nullable=True),
        sa.Column("version_no", sa.Integer(), server_default=sa.text("1"), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.ForeignKeyConstraint(["advisor_employee_id"], ["organization.employees.id"]),
        sa.ForeignKeyConstraint(["organization_id"], ["organization.organizations.id"]),
        sa.PrimaryKeyConstraint("id"),
        schema="crm",
    )
    op.create_index(
        "ix_report_snapshots_advisor_date",
        "report_snapshots",
        ["advisor_employee_id", "report_date"],
        unique=False,
        schema="crm",
    )


def downgrade() -> None:
    op.drop_index(
        "ix_report_snapshots_advisor_date",
        table_name="report_snapshots",
        schema="crm",
    )
    op.drop_table("report_snapshots", schema="crm")
