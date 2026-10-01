"""add external organization records

Revision ID: c45a981f2e73
Revises: a8e4d32f16b7
Create Date: 2026-10-01
"""
from alembic import op
import sqlalchemy as sa

revision = "c45a981f2e73"
down_revision = "a8e4d32f16b7"
branch_labels = None
depends_on = None


def audit_columns():
    return [
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("created_by", sa.BigInteger()), sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_by", sa.BigInteger()), sa.Column("deleted_at", sa.DateTime()),
        sa.Column("deleted_by", sa.BigInteger()), sa.Column("version_no", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    ]


def upgrade() -> None:
    op.create_table("agencies",
        sa.Column("id",sa.BigInteger(),autoincrement=True,nullable=False),sa.Column("organization_id",sa.BigInteger(),nullable=False),
        sa.Column("party_id",sa.BigInteger(),nullable=False),sa.Column("agency_code",sa.String(30),nullable=False),
        sa.Column("registration_number",sa.String(100)),sa.Column("branch_id",sa.BigInteger()),
        sa.Column("primary_contact_party_id",sa.BigInteger()),sa.Column("start_date",sa.Date(),nullable=False),
        sa.Column("end_date",sa.Date()),sa.Column("status",sa.String(20),nullable=False,server_default="ACTIVE"),
        sa.Column("remarks",sa.Text()),*audit_columns(),
        sa.ForeignKeyConstraint(["organization_id"],["organization.organizations.id"]),
        sa.ForeignKeyConstraint(["party_id"],["foundation.parties.id"]),sa.ForeignKeyConstraint(["branch_id"],["organization.branches.id"]),
        sa.ForeignKeyConstraint(["primary_contact_party_id"],["foundation.parties.id"]),sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("organization_id","agency_code",name="uq_agency_org_code"),schema="organization")
    op.create_table("associates",
        sa.Column("id",sa.BigInteger(),autoincrement=True,nullable=False),sa.Column("organization_id",sa.BigInteger(),nullable=False),
        sa.Column("party_id",sa.BigInteger(),nullable=False),sa.Column("associate_code",sa.String(30),nullable=False),
        sa.Column("associate_type",sa.String(30),nullable=False),sa.Column("branch_id",sa.BigInteger()),sa.Column("agency_id",sa.BigInteger()),
        sa.Column("joining_date",sa.Date(),nullable=False),sa.Column("end_date",sa.Date()),
        sa.Column("status",sa.String(20),nullable=False,server_default="ACTIVE"),sa.Column("referral_code",sa.String(50)),
        sa.Column("remarks",sa.Text()),*audit_columns(),
        sa.ForeignKeyConstraint(["organization_id"],["organization.organizations.id"]),sa.ForeignKeyConstraint(["party_id"],["foundation.parties.id"]),
        sa.ForeignKeyConstraint(["branch_id"],["organization.branches.id"]),sa.ForeignKeyConstraint(["agency_id"],["organization.agencies.id"]),
        sa.PrimaryKeyConstraint("id"),sa.UniqueConstraint("organization_id","associate_code",name="uq_associate_org_code"),schema="organization")
    op.create_table("arn_holders",
        sa.Column("id",sa.BigInteger(),autoincrement=True,nullable=False),sa.Column("organization_id",sa.BigInteger(),nullable=False),
        sa.Column("arn_number",sa.String(50),nullable=False),sa.Column("holder_party_id",sa.BigInteger(),nullable=False),
        sa.Column("holder_type",sa.String(20),nullable=False),sa.Column("branch_id",sa.BigInteger()),sa.Column("employee_id",sa.BigInteger()),
        sa.Column("associate_id",sa.BigInteger()),sa.Column("agency_id",sa.BigInteger()),sa.Column("registration_date",sa.Date()),
        sa.Column("valid_from",sa.Date()),sa.Column("valid_to",sa.Date()),sa.Column("status",sa.String(20),nullable=False,server_default="ACTIVE"),
        sa.Column("remarks",sa.Text()),*audit_columns(),
        sa.CheckConstraint("holder_type IN ('ORGANIZATION','EMPLOYEE','ASSOCIATE','AGENCY','OTHER')",name="ck_arn_holder_type"),
        sa.CheckConstraint("status IN ('ACTIVE','EXPIRED','SUSPENDED','INACTIVE')",name="ck_arn_holder_status"),
        sa.CheckConstraint("(holder_type = 'EMPLOYEE' AND employee_id IS NOT NULL AND associate_id IS NULL AND agency_id IS NULL) OR (holder_type = 'ASSOCIATE' AND associate_id IS NOT NULL AND employee_id IS NULL AND agency_id IS NULL) OR (holder_type = 'AGENCY' AND agency_id IS NOT NULL AND employee_id IS NULL AND associate_id IS NULL) OR (holder_type IN ('ORGANIZATION','OTHER') AND employee_id IS NULL AND associate_id IS NULL AND agency_id IS NULL)",name="ck_arn_holder_linkage"),
        sa.ForeignKeyConstraint(["organization_id"],["organization.organizations.id"]),sa.ForeignKeyConstraint(["holder_party_id"],["foundation.parties.id"]),
        sa.ForeignKeyConstraint(["branch_id"],["organization.branches.id"]),sa.ForeignKeyConstraint(["employee_id"],["organization.employees.id"]),
        sa.ForeignKeyConstraint(["associate_id"],["organization.associates.id"]),sa.ForeignKeyConstraint(["agency_id"],["organization.agencies.id"]),
        sa.PrimaryKeyConstraint("id"),sa.UniqueConstraint("organization_id","arn_number",name="uq_arn_holder_org_number"),schema="organization")
    op.create_index("ix_arn_holders_expiry","arn_holders",["organization_id","valid_to","status"],schema="organization")
    op.create_table("arn_status_history",sa.Column("id",sa.BigInteger(),autoincrement=True,nullable=False),
        sa.Column("arn_holder_id",sa.BigInteger(),nullable=False),sa.Column("old_status",sa.String(20)),sa.Column("new_status",sa.String(20),nullable=False),
        sa.Column("changed_at",sa.DateTime(),server_default=sa.text("CURRENT_TIMESTAMP"),nullable=False),sa.Column("changed_by",sa.BigInteger(),nullable=False),
        sa.Column("reason",sa.Text()),sa.ForeignKeyConstraint(["arn_holder_id"],["organization.arn_holders.id"]),
        sa.ForeignKeyConstraint(["changed_by"],["identity.users.id"]),sa.PrimaryKeyConstraint("id"),schema="organization")


def downgrade() -> None:
    op.drop_table("arn_status_history",schema="organization")
    op.drop_index("ix_arn_holders_expiry",table_name="arn_holders",schema="organization")
    op.drop_table("arn_holders",schema="organization")
    op.drop_table("associates",schema="organization")
    op.drop_table("agencies",schema="organization")
