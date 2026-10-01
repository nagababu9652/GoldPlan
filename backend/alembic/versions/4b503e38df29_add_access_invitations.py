"""add access invitations

Revision ID: 4b503e38df29
Revises: 3a4f0d27ce18
Create Date: 2026-10-01
"""
from alembic import op
import sqlalchemy as sa

revision="4b503e38df29";down_revision="3a4f0d27ce18";branch_labels=None;depends_on=None

def upgrade()->None:
    op.create_table("access_invitations",
        sa.Column("id",sa.BigInteger(),autoincrement=True,nullable=False),sa.Column("organization_id",sa.BigInteger(),nullable=False),sa.Column("party_id",sa.BigInteger(),nullable=False),sa.Column("employee_id",sa.BigInteger(),nullable=True),sa.Column("customer_id",sa.BigInteger(),nullable=True),sa.Column("invitation_type",sa.String(30),nullable=False),sa.Column("target_role",sa.String(30),nullable=False),sa.Column("email",sa.String(150),nullable=False),sa.Column("token_hash",sa.String(64),nullable=False),sa.Column("expires_at",sa.DateTime(),nullable=False),sa.Column("accepted_at",sa.DateTime(),nullable=True),sa.Column("revoked_at",sa.DateTime(),nullable=True),sa.Column("invited_by_user_id",sa.BigInteger(),nullable=False),sa.Column("created_at",sa.DateTime(),server_default=sa.text("CURRENT_TIMESTAMP"),nullable=False),sa.ForeignKeyConstraint(["organization_id"],["organization.organizations.id"]),sa.ForeignKeyConstraint(["party_id"],["foundation.parties.id"]),sa.ForeignKeyConstraint(["employee_id"],["organization.employees.id"]),sa.ForeignKeyConstraint(["customer_id"],["crm.customers.id"]),sa.ForeignKeyConstraint(["invited_by_user_id"],["identity.users.id"]),sa.PrimaryKeyConstraint("id"),sa.UniqueConstraint("token_hash"),schema="identity")
    op.create_index("uq_employee_access_invitation_pending","access_invitations",["employee_id","invitation_type"],unique=True,schema="identity",postgresql_where=sa.text("accepted_at IS NULL AND revoked_at IS NULL"))

def downgrade()->None:
    op.drop_index("uq_employee_access_invitation_pending",table_name="access_invitations",schema="identity");op.drop_table("access_invitations",schema="identity")
