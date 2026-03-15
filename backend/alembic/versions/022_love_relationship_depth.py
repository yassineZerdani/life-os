"""Relationship Depth System: love_profiles, love_pulse_entries, love_memories, conflict_entries, shared_vision_items, reconnect_actions

Revision ID: 022
Revises: 021
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "022"
down_revision: Union[str, None] = "021"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "love_profiles",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("partner_name", sa.String(200), nullable=True),
        sa.Column("relationship_status", sa.String(60), nullable=False),
        sa.Column("anniversary_date", sa.Date(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_love_profiles_user_id", "love_profiles", ["user_id"], unique=True)

    op.create_table(
        "love_pulse_entries",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("closeness_score", sa.Float(), nullable=True),
        sa.Column("communication_score", sa.Float(), nullable=True),
        sa.Column("trust_score", sa.Float(), nullable=True),
        sa.Column("tension_score", sa.Float(), nullable=True),
        sa.Column("support_score", sa.Float(), nullable=True),
        sa.Column("future_alignment_score", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_love_pulse_entries_user_id", "love_pulse_entries", ["user_id"], unique=False)
    op.create_index("ix_love_pulse_entries_date", "love_pulse_entries", ["date"], unique=False)

    op.create_table(
        "love_memories",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("date", sa.Date(), nullable=True),
        sa.Column("category", sa.String(60), nullable=False),
        sa.Column("media_url", sa.String(2000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_love_memories_user_id", "love_memories", ["user_id"], unique=False)
    op.create_index("ix_love_memories_category", "love_memories", ["category"], unique=False)
    op.create_index("ix_love_memories_date", "love_memories", ["date"], unique=False)

    op.create_table(
        "conflict_entries",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("trigger", sa.String(500), nullable=True),
        sa.Column("what_i_felt", sa.Text(), nullable=True),
        sa.Column("what_they_may_have_felt", sa.Text(), nullable=True),
        sa.Column("what_happened", sa.Text(), nullable=True),
        sa.Column("repair_needed", sa.Text(), nullable=True),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_conflict_entries_user_id", "conflict_entries", ["user_id"], unique=False)
    op.create_index("ix_conflict_entries_status", "conflict_entries", ["status"], unique=False)

    op.create_table(
        "shared_vision_items",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(60), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("target_date", sa.Date(), nullable=True),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_shared_vision_items_user_id", "shared_vision_items", ["user_id"], unique=False)
    op.create_index("ix_shared_vision_items_category", "shared_vision_items", ["category"], unique=False)

    op.create_table(
        "reconnect_actions",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.String(60), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("completed", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_reconnect_actions_user_id", "reconnect_actions", ["user_id"], unique=False)
    op.create_index("ix_reconnect_actions_completed", "reconnect_actions", ["completed"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_reconnect_actions_completed", table_name="reconnect_actions")
    op.drop_index("ix_reconnect_actions_user_id", table_name="reconnect_actions")
    op.drop_table("reconnect_actions")
    op.drop_index("ix_shared_vision_items_category", table_name="shared_vision_items")
    op.drop_index("ix_shared_vision_items_user_id", table_name="shared_vision_items")
    op.drop_table("shared_vision_items")
    op.drop_index("ix_conflict_entries_status", table_name="conflict_entries")
    op.drop_index("ix_conflict_entries_user_id", table_name="conflict_entries")
    op.drop_table("conflict_entries")
    op.drop_index("ix_love_memories_date", table_name="love_memories")
    op.drop_index("ix_love_memories_category", table_name="love_memories")
    op.drop_index("ix_love_memories_user_id", table_name="love_memories")
    op.drop_table("love_memories")
    op.drop_index("ix_love_pulse_entries_date", table_name="love_pulse_entries")
    op.drop_index("ix_love_pulse_entries_user_id", table_name="love_pulse_entries")
    op.drop_table("love_pulse_entries")
    op.drop_index("ix_love_profiles_user_id", table_name="love_profiles")
    op.drop_table("love_profiles")
