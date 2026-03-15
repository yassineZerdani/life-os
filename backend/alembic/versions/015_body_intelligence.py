"""Human Body Intelligence System: body_systems, organs, organ_health_scores

Revision ID: 015
Revises: 014
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision: str = "015"
down_revision: Union[str, None] = "014"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "body_systems",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(50), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_body_systems_slug"), "body_systems", ["slug"], unique=True)

    op.create_table(
        "organs",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("system_id", UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(80), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("functions", JSONB(), nullable=True),
        sa.Column("nutrition_requirements", JSONB(), nullable=True),
        sa.Column("movement_requirements", JSONB(), nullable=True),
        sa.Column("sleep_requirements", JSONB(), nullable=True),
        sa.Column("signals", JSONB(), nullable=True),
        sa.Column("symptoms", JSONB(), nullable=True),
        sa.Column("metric_keys", JSONB(), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=True),
        sa.Column("map_region_id", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["system_id"], ["body_systems.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_organs_slug"), "organs", ["slug"], unique=True)
    op.create_index(op.f("ix_organs_system_id"), "organs", ["system_id"], unique=False)

    op.create_table(
        "organ_health_scores",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("organ_id", UUID(as_uuid=True), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("factors", JSONB(), nullable=True),
        sa.Column("computed_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["organ_id"], ["organs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_organ_health_scores_user_organ"), "organ_health_scores", ["user_id", "organ_id"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_organ_health_scores_user_organ"), table_name="organ_health_scores")
    op.drop_table("organ_health_scores")
    op.drop_index(op.f("ix_organs_system_id"), table_name="organs")
    op.drop_index(op.f("ix_organs_slug"), table_name="organs")
    op.drop_table("organs")
    op.drop_index(op.f("ix_body_systems_slug"), table_name="body_systems")
    op.drop_table("body_systems")
