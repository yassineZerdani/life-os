"""Life Work Engine: missions, milestones, achievements, opportunities, leverage, energy patterns

Revision ID: 020
Revises: 019
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "020"
down_revision: Union[str, None] = "019"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "life_work_missions",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("phase", sa.String(80), nullable=True),
        sa.Column("priority", sa.Integer(), nullable=True),
        sa.Column("target_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_life_work_missions_user_id", "life_work_missions", ["user_id"], unique=False)
    op.create_index("ix_life_work_missions_title", "life_work_missions", ["title"], unique=False)
    op.create_index("ix_life_work_missions_status", "life_work_missions", ["status"], unique=False)
    op.create_index("ix_life_work_missions_phase", "life_work_missions", ["phase"], unique=False)

    op.create_table(
        "life_work_milestones",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("mission_id", UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("order_index", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["mission_id"], ["life_work_missions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_life_work_milestones_mission_id", "life_work_milestones", ["mission_id"], unique=False)
    op.create_index("ix_life_work_milestones_status", "life_work_milestones", ["status"], unique=False)

    op.create_table(
        "life_work_achievements",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.String(60), nullable=False),
        sa.Column("impact_level", sa.String(20), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("proof_url", sa.String(2000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_life_work_achievements_user_id", "life_work_achievements", ["user_id"], unique=False)
    op.create_index("ix_life_work_achievements_category", "life_work_achievements", ["category"], unique=False)
    op.create_index("ix_life_work_achievements_date", "life_work_achievements", ["date"], unique=False)

    op.create_table(
        "life_work_opportunities",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("type", sa.String(60), nullable=False),
        sa.Column("source", sa.String(200), nullable=True),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("value_estimate", sa.String(100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_life_work_opportunities_user_id", "life_work_opportunities", ["user_id"], unique=False)
    op.create_index("ix_life_work_opportunities_type", "life_work_opportunities", ["type"], unique=False)
    op.create_index("ix_life_work_opportunities_status", "life_work_opportunities", ["status"], unique=False)

    op.create_table(
        "career_leverage",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("area", sa.String(60), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_career_leverage_user_id", "career_leverage", ["user_id"], unique=False)
    op.create_index("ix_career_leverage_area", "career_leverage", ["area"], unique=False)

    op.create_table(
        "energy_patterns",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("work_type", sa.String(120), nullable=False),
        sa.Column("energy_effect", sa.String(20), nullable=False),
        sa.Column("focus_quality", sa.String(20), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("recorded_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_energy_patterns_user_id", "energy_patterns", ["user_id"], unique=False)
    op.create_index("ix_energy_patterns_work_type", "energy_patterns", ["work_type"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_energy_patterns_work_type", table_name="energy_patterns")
    op.drop_index("ix_energy_patterns_user_id", table_name="energy_patterns")
    op.drop_table("energy_patterns")
    op.drop_index("ix_career_leverage_area", table_name="career_leverage")
    op.drop_index("ix_career_leverage_user_id", table_name="career_leverage")
    op.drop_table("career_leverage")
    op.drop_index("ix_life_work_opportunities_status", table_name="life_work_opportunities")
    op.drop_index("ix_life_work_opportunities_type", table_name="life_work_opportunities")
    op.drop_index("ix_life_work_opportunities_user_id", table_name="life_work_opportunities")
    op.drop_table("life_work_opportunities")
    op.drop_index("ix_life_work_achievements_date", table_name="life_work_achievements")
    op.drop_index("ix_life_work_achievements_category", table_name="life_work_achievements")
    op.drop_index("ix_life_work_achievements_user_id", table_name="life_work_achievements")
    op.drop_table("life_work_achievements")
    op.drop_index("ix_life_work_milestones_status", table_name="life_work_milestones")
    op.drop_index("ix_life_work_milestones_mission_id", table_name="life_work_milestones")
    op.drop_table("life_work_milestones")
    op.drop_index("ix_life_work_missions_phase", table_name="life_work_missions")
    op.drop_index("ix_life_work_missions_status", table_name="life_work_missions")
    op.drop_index("ix_life_work_missions_title", table_name="life_work_missions")
    op.drop_index("ix_life_work_missions_user_id", table_name="life_work_missions")
    op.drop_table("life_work_missions")
