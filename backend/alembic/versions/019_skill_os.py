"""Skill OS: skills, skill_progress, practice_sessions, skill_artifacts, skill_weaknesses

Revision ID: 019
Revises: 018
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "019"
down_revision: Union[str, None] = "018"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "skills",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("category", sa.String(80), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("parent_skill_id", UUID(as_uuid=True), nullable=True),
        sa.Column("active", sa.String(20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["parent_skill_id"], ["skills.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_skills_user_id", "skills", ["user_id"], unique=False)
    op.create_index("ix_skills_name", "skills", ["name"], unique=False)
    op.create_index("ix_skills_category", "skills", ["category"], unique=False)
    op.create_index("ix_skills_parent_skill_id", "skills", ["parent_skill_id"], unique=False)

    op.create_table(
        "skill_progress",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("skill_id", UUID(as_uuid=True), nullable=False),
        sa.Column("level", sa.Integer(), nullable=False),
        sa.Column("xp", sa.Integer(), nullable=False),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("decay_risk", sa.Float(), nullable=True),
        sa.Column("last_practiced_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["skill_id"], ["skills.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_skill_progress_skill_id", "skill_progress", ["skill_id"], unique=True)

    op.create_table(
        "practice_sessions",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("skill_id", UUID(as_uuid=True), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("difficulty", sa.String(40), nullable=True),
        sa.Column("focus_area", sa.String(120), nullable=True),
        sa.Column("mistakes_notes", sa.Text(), nullable=True),
        sa.Column("feedback_notes", sa.Text(), nullable=True),
        sa.Column("energy_level", sa.String(40), nullable=True),
        sa.Column("quality_score", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["skill_id"], ["skills.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_practice_sessions_skill_id", "practice_sessions", ["skill_id"], unique=False)
    op.create_index("ix_practice_sessions_date", "practice_sessions", ["date"], unique=False)

    op.create_table(
        "skill_artifacts",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("skill_id", UUID(as_uuid=True), nullable=False),
        sa.Column("type", sa.String(60), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("file_url", sa.String(2000), nullable=True),
        sa.Column("link_url", sa.String(2000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["skill_id"], ["skills.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_skill_artifacts_skill_id", "skill_artifacts", ["skill_id"], unique=False)
    op.create_index("ix_skill_artifacts_type", "skill_artifacts", ["type"], unique=False)

    op.create_table(
        "skill_weaknesses",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("skill_id", UUID(as_uuid=True), nullable=False),
        sa.Column("weakness_name", sa.String(200), nullable=False),
        sa.Column("severity", sa.String(20), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["skill_id"], ["skills.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_skill_weaknesses_skill_id", "skill_weaknesses", ["skill_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_skill_weaknesses_skill_id", table_name="skill_weaknesses")
    op.drop_table("skill_weaknesses")
    op.drop_index("ix_skill_artifacts_type", table_name="skill_artifacts")
    op.drop_index("ix_skill_artifacts_skill_id", table_name="skill_artifacts")
    op.drop_table("skill_artifacts")
    op.drop_index("ix_practice_sessions_date", table_name="practice_sessions")
    op.drop_index("ix_practice_sessions_skill_id", table_name="practice_sessions")
    op.drop_table("practice_sessions")
    op.drop_index("ix_skill_progress_skill_id", table_name="skill_progress")
    op.drop_table("skill_progress")
    op.drop_index("ix_skills_parent_skill_id", table_name="skills")
    op.drop_index("ix_skills_category", table_name="skills")
    op.drop_index("ix_skills_name", table_name="skills")
    op.drop_index("ix_skills_user_id", table_name="skills")
    op.drop_table("skills")
