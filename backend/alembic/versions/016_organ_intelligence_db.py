"""Organ intelligence DB: nutrients, movement_types, symptoms, organ_nutrients, organ_movements, organ_symptoms

Revision ID: 016
Revises: 015
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "016"
down_revision: Union[str, None] = "015"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "nutrients",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(80), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("unit", sa.String(30), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_nutrients_slug"), "nutrients", ["slug"], unique=True)

    op.create_table(
        "movement_types",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(80), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_movement_types_slug"), "movement_types", ["slug"], unique=True)

    op.create_table(
        "symptoms",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(80), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("stage", sa.String(30), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_symptoms_slug"), "symptoms", ["slug"], unique=True)

    op.create_table(
        "organ_nutrients",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("organ_id", UUID(as_uuid=True), nullable=False),
        sa.Column("nutrient_id", UUID(as_uuid=True), nullable=False),
        sa.Column("importance", sa.String(30), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["organ_id"], ["organs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["nutrient_id"], ["nutrients.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_organ_nutrients_organ", "organ_nutrients", ["organ_id"], unique=False)
    op.create_index("ix_organ_nutrients_nutrient", "organ_nutrients", ["nutrient_id"], unique=False)

    op.create_table(
        "organ_movements",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("organ_id", UUID(as_uuid=True), nullable=False),
        sa.Column("movement_type_id", UUID(as_uuid=True), nullable=False),
        sa.Column("importance", sa.String(30), nullable=True),
        sa.ForeignKeyConstraint(["organ_id"], ["organs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["movement_type_id"], ["movement_types.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_organ_movements_organ", "organ_movements", ["organ_id"], unique=False)
    op.create_index("ix_organ_movements_type", "organ_movements", ["movement_type_id"], unique=False)

    op.create_table(
        "organ_symptoms",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("organ_id", UUID(as_uuid=True), nullable=False),
        sa.Column("symptom_id", UUID(as_uuid=True), nullable=False),
        sa.Column("stage", sa.String(30), nullable=True),
        sa.ForeignKeyConstraint(["organ_id"], ["organs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["symptom_id"], ["symptoms.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_organ_symptoms_organ", "organ_symptoms", ["organ_id"], unique=False)
    op.create_index("ix_organ_symptoms_symptom", "organ_symptoms", ["symptom_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_organ_symptoms_symptom", table_name="organ_symptoms")
    op.drop_index("ix_organ_symptoms_organ", table_name="organ_symptoms")
    op.drop_table("organ_symptoms")
    op.drop_index("ix_organ_movements_type", table_name="organ_movements")
    op.drop_index("ix_organ_movements_organ", table_name="organ_movements")
    op.drop_table("organ_movements")
    op.drop_index("ix_organ_nutrients_nutrient", table_name="organ_nutrients")
    op.drop_index("ix_organ_nutrients_organ", table_name="organ_nutrients")
    op.drop_table("organ_nutrients")
    op.drop_index(op.f("ix_symptoms_slug"), table_name="symptoms")
    op.drop_table("symptoms")
    op.drop_index(op.f("ix_movement_types_slug"), table_name="movement_types")
    op.drop_table("movement_types")
    op.drop_index(op.f("ix_nutrients_slug"), table_name="nutrients")
    op.drop_table("nutrients")
