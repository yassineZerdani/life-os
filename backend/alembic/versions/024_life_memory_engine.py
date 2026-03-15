"""Life Memory Engine: life_experiences, people, media, seasons, tags

Revision ID: 024
Revises: 023
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "024"
down_revision: Union[str, None] = "023"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "life_experiences",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("location_name", sa.String(300), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("category", sa.String(60), nullable=False),
        sa.Column("emotional_tone", sa.String(60), nullable=True),
        sa.Column("intensity_score", sa.Float(), nullable=True),
        sa.Column("meaning_score", sa.Float(), nullable=True),
        sa.Column("aliveness_score", sa.Float(), nullable=True),
        sa.Column("lesson_note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_life_experiences_user_id", "life_experiences", ["user_id"], unique=False)
    op.create_index("ix_life_experiences_date", "life_experiences", ["date"], unique=False)
    op.create_index("ix_life_experiences_category", "life_experiences", ["category"], unique=False)
    op.create_index("ix_life_experiences_emotional_tone", "life_experiences", ["emotional_tone"], unique=False)

    op.create_table(
        "life_experience_people",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("experience_id", UUID(as_uuid=True), nullable=False),
        sa.Column("person_name", sa.String(200), nullable=False),
        sa.Column("relationship_type", sa.String(100), nullable=True),
        sa.ForeignKeyConstraint(["experience_id"], ["life_experiences.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_life_experience_people_experience_id", "life_experience_people", ["experience_id"], unique=False)

    op.create_table(
        "life_experience_media",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("experience_id", UUID(as_uuid=True), nullable=False),
        sa.Column("media_type", sa.String(60), nullable=False),
        sa.Column("media_url", sa.String(2000), nullable=False),
        sa.ForeignKeyConstraint(["experience_id"], ["life_experiences.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_life_experience_media_experience_id", "life_experience_media", ["experience_id"], unique=False)

    op.create_table(
        "seasons_of_life",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_seasons_of_life_user_id", "seasons_of_life", ["user_id"], unique=False)
    op.create_index("ix_seasons_of_life_start_date", "seasons_of_life", ["start_date"], unique=False)

    op.create_table(
        "life_experience_tags",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("experience_id", UUID(as_uuid=True), nullable=False),
        sa.Column("tag", sa.String(100), nullable=False),
        sa.ForeignKeyConstraint(["experience_id"], ["life_experiences.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_life_experience_tags_experience_id", "life_experience_tags", ["experience_id"], unique=False)
    op.create_index("ix_life_experience_tags_tag", "life_experience_tags", ["tag"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_life_experience_tags_tag", table_name="life_experience_tags")
    op.drop_index("ix_life_experience_tags_experience_id", table_name="life_experience_tags")
    op.drop_table("life_experience_tags")
    op.drop_index("ix_seasons_of_life_start_date", table_name="seasons_of_life")
    op.drop_index("ix_seasons_of_life_user_id", table_name="seasons_of_life")
    op.drop_table("seasons_of_life")
    op.drop_index("ix_life_experience_media_experience_id", table_name="life_experience_media")
    op.drop_table("life_experience_media")
    op.drop_index("ix_life_experience_people_experience_id", table_name="life_experience_people")
    op.drop_table("life_experience_people")
    op.drop_index("ix_life_experiences_emotional_tone", table_name="life_experiences")
    op.drop_index("ix_life_experiences_category", table_name="life_experiences")
    op.drop_index("ix_life_experiences_date", table_name="life_experiences")
    op.drop_index("ix_life_experiences_user_id", table_name="life_experiences")
    op.drop_table("life_experiences")
