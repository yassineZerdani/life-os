"""Social Capital Engine: network_contacts, contact_interactions, opportunities, reciprocity, communities

Revision ID: 023
Revises: 022
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "023"
down_revision: Union[str, None] = "022"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "network_contacts",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("category", sa.String(60), nullable=False),
        sa.Column("company", sa.String(300), nullable=True),
        sa.Column("role", sa.String(200), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("trust_score", sa.Float(), nullable=True),
        sa.Column("warmth_score", sa.Float(), nullable=True),
        sa.Column("opportunity_score", sa.Float(), nullable=True),
        sa.Column("last_contact_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_network_contacts_user_id", "network_contacts", ["user_id"], unique=False)
    op.create_index("ix_network_contacts_category", "network_contacts", ["category"], unique=False)
    op.create_index("ix_network_contacts_name", "network_contacts", ["name"], unique=False)
    op.create_index("ix_network_contacts_last_contact_at", "network_contacts", ["last_contact_at"], unique=False)

    op.create_table(
        "network_contact_interactions",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("contact_id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("interaction_type", sa.String(60), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("tone", sa.String(60), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["contact_id"], ["network_contacts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_network_contact_interactions_contact_id", "network_contact_interactions", ["contact_id"], unique=False)
    op.create_index("ix_network_contact_interactions_user_id", "network_contact_interactions", ["user_id"], unique=False)
    op.create_index("ix_network_contact_interactions_date", "network_contact_interactions", ["date"], unique=False)

    op.create_table(
        "network_connection_opportunities",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("contact_id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("opportunity_type", sa.String(60), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("potential_value", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["contact_id"], ["network_contacts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_network_connection_opportunities_contact_id", "network_connection_opportunities", ["contact_id"], unique=False)
    op.create_index("ix_network_connection_opportunities_user_id", "network_connection_opportunities", ["user_id"], unique=False)
    op.create_index("ix_network_connection_opportunities_status", "network_connection_opportunities", ["status"], unique=False)

    op.create_table(
        "network_reciprocity_entries",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("contact_id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("support_given", sa.Text(), nullable=True),
        sa.Column("support_received", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["contact_id"], ["network_contacts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_network_reciprocity_entries_contact_id", "network_reciprocity_entries", ["contact_id"], unique=False)
    op.create_index("ix_network_reciprocity_entries_user_id", "network_reciprocity_entries", ["user_id"], unique=False)
    op.create_index("ix_network_reciprocity_entries_date", "network_reciprocity_entries", ["date"], unique=False)

    op.create_table(
        "network_communities",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(300), nullable=False),
        sa.Column("type", sa.String(60), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("relevance_score", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_network_communities_user_id", "network_communities", ["user_id"], unique=False)
    op.create_index("ix_network_communities_type", "network_communities", ["type"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_network_communities_type", table_name="network_communities")
    op.drop_index("ix_network_communities_user_id", table_name="network_communities")
    op.drop_table("network_communities")
    op.drop_index("ix_network_reciprocity_entries_date", table_name="network_reciprocity_entries")
    op.drop_index("ix_network_reciprocity_entries_user_id", table_name="network_reciprocity_entries")
    op.drop_index("ix_network_reciprocity_entries_contact_id", table_name="network_reciprocity_entries")
    op.drop_table("network_reciprocity_entries")
    op.drop_index("ix_network_connection_opportunities_status", table_name="network_connection_opportunities")
    op.drop_index("ix_network_connection_opportunities_user_id", table_name="network_connection_opportunities")
    op.drop_index("ix_network_connection_opportunities_contact_id", table_name="network_connection_opportunities")
    op.drop_table("network_connection_opportunities")
    op.drop_index("ix_network_contact_interactions_date", table_name="network_contact_interactions")
    op.drop_index("ix_network_contact_interactions_user_id", table_name="network_contact_interactions")
    op.drop_index("ix_network_contact_interactions_contact_id", table_name="network_contact_interactions")
    op.drop_table("network_contact_interactions")
    op.drop_index("ix_network_contacts_last_contact_at", table_name="network_contacts")
    op.drop_index("ix_network_contacts_name", table_name="network_contacts")
    op.drop_index("ix_network_contacts_category", table_name="network_contacts")
    op.drop_index("ix_network_contacts_user_id", table_name="network_contacts")
    op.drop_table("network_contacts")
