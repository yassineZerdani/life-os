"""Tiered anatomy: BodySystem defaults, Organ detail_level, inheritance fields.

Revision ID: 027
Revises: 026
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision: str = "027"
down_revision: Union[str, None] = "026"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # BodySystem: key + default profiles for inheritance
    op.add_column("body_systems", sa.Column("key", sa.String(50), nullable=True))
    op.add_column("body_systems", sa.Column("default_support_profile_json", JSONB(), nullable=True))
    op.add_column("body_systems", sa.Column("default_metrics_json", JSONB(), nullable=True))
    op.add_column("body_systems", sa.Column("default_signal_profile_json", JSONB(), nullable=True))
    op.create_index(op.f("ix_body_systems_key"), "body_systems", ["key"], unique=True)

    # Organ: detail_level, parent, region, type, custom-data flags
    op.add_column("organs", sa.Column("key", sa.String(80), nullable=True))
    op.add_column("organs", sa.Column("detail_level", sa.String(20), nullable=True))  # full, medium, basic
    op.add_column("organs", sa.Column("parent_organ_id", UUID(as_uuid=True), nullable=True))
    op.add_column("organs", sa.Column("anatomical_region", sa.String(80), nullable=True))
    op.add_column("organs", sa.Column("organ_type", sa.String(50), nullable=True))
    op.add_column("organs", sa.Column("has_custom_support_data", sa.Boolean(), server_default=sa.false(), nullable=False))
    op.add_column("organs", sa.Column("has_custom_metric_data", sa.Boolean(), server_default=sa.false(), nullable=False))
    op.add_column("organs", sa.Column("has_custom_signal_data", sa.Boolean(), server_default=sa.false(), nullable=False))
    op.create_foreign_key(
        "fk_organs_parent_organ_id",
        "organs",
        "organs",
        ["parent_organ_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(op.f("ix_organs_key"), "organs", ["key"], unique=False)
    op.create_index(op.f("ix_organs_parent_organ_id"), "organs", ["parent_organ_id"], unique=False)

    # Backfill key from slug
    op.execute("UPDATE body_systems SET key = slug WHERE key IS NULL")
    op.execute("UPDATE organs SET key = slug WHERE key IS NULL")
    op.alter_column("body_systems", "key", nullable=False)
    op.alter_column("organs", "key", nullable=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_organs_parent_organ_id"), table_name="organs")
    op.drop_index(op.f("ix_organs_key"), table_name="organs")
    op.drop_constraint("fk_organs_parent_organ_id", "organs", type_="foreignkey")
    op.drop_column("organs", "has_custom_signal_data")
    op.drop_column("organs", "has_custom_metric_data")
    op.drop_column("organs", "has_custom_support_data")
    op.drop_column("organs", "organ_type")
    op.drop_column("organs", "anatomical_region")
    op.drop_column("organs", "parent_organ_id")
    op.drop_column("organs", "detail_level")
    op.drop_column("organs", "key")
    op.drop_index(op.f("ix_body_systems_key"), table_name="body_systems")
    op.drop_column("body_systems", "default_signal_profile_json")
    op.drop_column("body_systems", "default_metrics_json")
    op.drop_column("body_systems", "default_support_profile_json")
    op.drop_column("body_systems", "key")
