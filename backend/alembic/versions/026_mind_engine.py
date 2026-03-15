"""Mind Engine: emotional states, triggers, thought patterns, behavior loops, regulation

Revision ID: 026
Revises: 025
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "026"
down_revision: Union[str, None] = "025"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "mind_emotional_state_entries",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("primary_emotion", sa.String(80), nullable=False),
        sa.Column("intensity", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_mind_emotional_state_entries_user_id", "mind_emotional_state_entries", ["user_id"])
    op.create_index("ix_mind_emotional_state_entries_date", "mind_emotional_state_entries", ["date"])
    op.create_index("ix_mind_emotional_state_entries_primary_emotion", "mind_emotional_state_entries", ["primary_emotion"])

    op.create_table(
        "mind_trigger_entries",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("trigger_type", sa.String(80), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("linked_emotion", sa.String(120), nullable=True),
        sa.Column("linked_behavior", sa.String(200), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_mind_trigger_entries_user_id", "mind_trigger_entries", ["user_id"])
    op.create_index("ix_mind_trigger_entries_date", "mind_trigger_entries", ["date"])
    op.create_index("ix_mind_trigger_entries_trigger_type", "mind_trigger_entries", ["trigger_type"])

    op.create_table(
        "mind_thought_patterns",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.String(80), nullable=True),
        sa.Column("frequency_score", sa.Float(), nullable=True),
        sa.Column("severity_score", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_mind_thought_patterns_user_id", "mind_thought_patterns", ["user_id"])
    op.create_index("ix_mind_thought_patterns_title", "mind_thought_patterns", ["title"])
    op.create_index("ix_mind_thought_patterns_category", "mind_thought_patterns", ["category"])

    op.create_table(
        "mind_behavior_loops",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("trigger_summary", sa.Text(), nullable=True),
        sa.Column("emotional_sequence", sa.Text(), nullable=True),
        sa.Column("behavioral_sequence", sa.Text(), nullable=True),
        sa.Column("aftermath", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_mind_behavior_loops_user_id", "mind_behavior_loops", ["user_id"])
    op.create_index("ix_mind_behavior_loops_title", "mind_behavior_loops", ["title"])

    op.create_table(
        "mind_regulation_tool_uses",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("tool_name", sa.String(120), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("effectiveness_score", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_mind_regulation_tool_uses_user_id", "mind_regulation_tool_uses", ["user_id"])
    op.create_index("ix_mind_regulation_tool_uses_date", "mind_regulation_tool_uses", ["date"])
    op.create_index("ix_mind_regulation_tool_uses_tool_name", "mind_regulation_tool_uses", ["tool_name"])


def downgrade() -> None:
    op.drop_index("ix_mind_regulation_tool_uses_tool_name", "mind_regulation_tool_uses")
    op.drop_index("ix_mind_regulation_tool_uses_date", "mind_regulation_tool_uses")
    op.drop_index("ix_mind_regulation_tool_uses_user_id", "mind_regulation_tool_uses")
    op.drop_table("mind_regulation_tool_uses")

    op.drop_index("ix_mind_behavior_loops_title", "mind_behavior_loops")
    op.drop_index("ix_mind_behavior_loops_user_id", "mind_behavior_loops")
    op.drop_table("mind_behavior_loops")

    op.drop_index("ix_mind_thought_patterns_category", "mind_thought_patterns")
    op.drop_index("ix_mind_thought_patterns_title", "mind_thought_patterns")
    op.drop_index("ix_mind_thought_patterns_user_id", "mind_thought_patterns")
    op.drop_table("mind_thought_patterns")

    op.drop_index("ix_mind_trigger_entries_trigger_type", "mind_trigger_entries")
    op.drop_index("ix_mind_trigger_entries_date", "mind_trigger_entries")
    op.drop_index("ix_mind_trigger_entries_user_id", "mind_trigger_entries")
    op.drop_table("mind_trigger_entries")

    op.drop_index("ix_mind_emotional_state_entries_primary_emotion", "mind_emotional_state_entries")
    op.drop_index("ix_mind_emotional_state_entries_date", "mind_emotional_state_entries")
    op.drop_index("ix_mind_emotional_state_entries_user_id", "mind_emotional_state_entries")
    op.drop_table("mind_emotional_state_entries")
