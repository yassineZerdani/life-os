"""Family Command Center: family_members, family_interactions, family_responsibilities, family_memories, family_dynamic_notes

Revision ID: 021
Revises: 020
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision: str = "021"
down_revision: Union[str, None] = "020"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "family_members",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("relationship_type", sa.String(60), nullable=False),
        sa.Column("birth_date", sa.Date(), nullable=True),
        sa.Column("contact_info", sa.String(500), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("closeness_score", sa.Float(), nullable=True),
        sa.Column("tension_score", sa.Float(), nullable=True),
        sa.Column("support_level", sa.String(40), nullable=True),
        sa.Column("parent_id", UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["parent_id"], ["family_members.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_family_members_user_id", "family_members", ["user_id"], unique=False)
    op.create_index("ix_family_members_name", "family_members", ["name"], unique=False)
    op.create_index("ix_family_members_relationship_type", "family_members", ["relationship_type"], unique=False)
    op.create_index("ix_family_members_parent_id", "family_members", ["parent_id"], unique=False)

    op.create_table(
        "family_interactions",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("family_member_id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("interaction_type", sa.String(60), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("emotional_tone", sa.String(40), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["family_member_id"], ["family_members.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_family_interactions_family_member_id", "family_interactions", ["family_member_id"], unique=False)
    op.create_index("ix_family_interactions_date", "family_interactions", ["date"], unique=False)

    op.create_table(
        "family_responsibilities",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("family_member_id", UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("category", sa.String(60), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["family_member_id"], ["family_members.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_family_responsibilities_user_id", "family_responsibilities", ["user_id"], unique=False)
    op.create_index("ix_family_responsibilities_family_member_id", "family_responsibilities", ["family_member_id"], unique=False)
    op.create_index("ix_family_responsibilities_status", "family_responsibilities", ["status"], unique=False)
    op.create_index("ix_family_responsibilities_category", "family_responsibilities", ["category"], unique=False)

    op.create_table(
        "family_memories",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("family_member_id", UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("date", sa.Date(), nullable=True),
        sa.Column("media_url", sa.String(2000), nullable=True),
        sa.Column("tags", JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["family_member_id"], ["family_members.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_family_memories_user_id", "family_memories", ["user_id"], unique=False)
    op.create_index("ix_family_memories_family_member_id", "family_memories", ["family_member_id"], unique=False)

    op.create_table(
        "family_dynamic_notes",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("family_member_id", UUID(as_uuid=True), nullable=True),
        sa.Column("pattern_type", sa.String(60), nullable=False),
        sa.Column("trigger_notes", sa.Text(), nullable=True),
        sa.Column("safe_topics", sa.Text(), nullable=True),
        sa.Column("difficult_topics", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["family_member_id"], ["family_members.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_family_dynamic_notes_user_id", "family_dynamic_notes", ["user_id"], unique=False)
    op.create_index("ix_family_dynamic_notes_family_member_id", "family_dynamic_notes", ["family_member_id"], unique=False)
    op.create_index("ix_family_dynamic_notes_pattern_type", "family_dynamic_notes", ["pattern_type"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_family_dynamic_notes_pattern_type", table_name="family_dynamic_notes")
    op.drop_index("ix_family_dynamic_notes_family_member_id", table_name="family_dynamic_notes")
    op.drop_index("ix_family_dynamic_notes_user_id", table_name="family_dynamic_notes")
    op.drop_table("family_dynamic_notes")
    op.drop_index("ix_family_memories_family_member_id", table_name="family_memories")
    op.drop_index("ix_family_memories_user_id", table_name="family_memories")
    op.drop_table("family_memories")
    op.drop_index("ix_family_responsibilities_category", table_name="family_responsibilities")
    op.drop_index("ix_family_responsibilities_status", table_name="family_responsibilities")
    op.drop_index("ix_family_responsibilities_family_member_id", table_name="family_responsibilities")
    op.drop_index("ix_family_responsibilities_user_id", table_name="family_responsibilities")
    op.drop_table("family_responsibilities")
    op.drop_index("ix_family_interactions_date", table_name="family_interactions")
    op.drop_index("ix_family_interactions_family_member_id", table_name="family_interactions")
    op.drop_table("family_interactions")
    op.drop_index("ix_family_members_parent_id", table_name="family_members")
    op.drop_index("ix_family_members_relationship_type", table_name="family_members")
    op.drop_index("ix_family_members_name", table_name="family_members")
    op.drop_index("ix_family_members_user_id", table_name="family_members")
    op.drop_table("family_members")
