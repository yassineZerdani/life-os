"""Persona Lab: persona_identity_profiles, values, principles, narrative, aspects, drift

Revision ID: 025
Revises: 024
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "025"
down_revision: Union[str, None] = "024"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "persona_identity_profiles",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("current_self_summary", sa.Text(), nullable=True),
        sa.Column("ideal_self_summary", sa.Text(), nullable=True),
        sa.Column("public_self_summary", sa.Text(), nullable=True),
        sa.Column("private_self_summary", sa.Text(), nullable=True),
        sa.Column("values_summary", sa.Text(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_persona_identity_profiles_user_id",
        "persona_identity_profiles",
        ["user_id"],
        unique=True,
    )

    op.create_table(
        "persona_values",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("priority_score", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_persona_values_user_id", "persona_values", ["user_id"], unique=False)
    op.create_index("ix_persona_values_name", "persona_values", ["name"], unique=False)

    op.create_table(
        "persona_principles",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_persona_principles_user_id", "persona_principles", ["user_id"], unique=False)

    op.create_table(
        "persona_narrative_entries",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("time_period", sa.String(200), nullable=True),
        sa.Column("type", sa.String(60), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_persona_narrative_entries_user_id", "persona_narrative_entries", ["user_id"], unique=False)
    op.create_index("ix_persona_narrative_entries_type", "persona_narrative_entries", ["type"], unique=False)

    op.create_table(
        "persona_aspects",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("strength_score", sa.Float(), nullable=True),
        sa.Column("tension_score", sa.Float(), nullable=True),
        sa.Column("active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_persona_aspects_user_id", "persona_aspects", ["user_id"], unique=False)
    op.create_index("ix_persona_aspects_name", "persona_aspects", ["name"], unique=False)

    op.create_table(
        "identity_drift_signals",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("source", sa.String(120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("severity", sa.String(40), nullable=False),
        sa.Column("detected_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_identity_drift_signals_user_id", "identity_drift_signals", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_identity_drift_signals_user_id", table_name="identity_drift_signals")
    op.drop_table("identity_drift_signals")
    op.drop_index("ix_persona_aspects_name", table_name="persona_aspects")
    op.drop_index("ix_persona_aspects_user_id", table_name="persona_aspects")
    op.drop_table("persona_aspects")
    op.drop_index("ix_persona_narrative_entries_type", table_name="persona_narrative_entries")
    op.drop_index("ix_persona_narrative_entries_user_id", table_name="persona_narrative_entries")
    op.drop_table("persona_narrative_entries")
    op.drop_index("ix_persona_principles_user_id", table_name="persona_principles")
    op.drop_table("persona_principles")
    op.drop_index("ix_persona_values_name", table_name="persona_values")
    op.drop_index("ix_persona_values_user_id", table_name="persona_values")
    op.drop_table("persona_values")
    op.drop_index("ix_persona_identity_profiles_user_id", table_name="persona_identity_profiles")
    op.drop_table("persona_identity_profiles")
