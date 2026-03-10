"""Personal Profile and Life Configuration Center

Revision ID: 014
Revises: 013
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision: str = "014"
down_revision: Union[str, None] = "013"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "person_profiles",
        sa.Column("id", sa.Integer(), sa.Identity(always=False), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(200), nullable=True),
        sa.Column("preferred_name", sa.String(100), nullable=True),
        sa.Column("birth_year", sa.Integer(), nullable=True),
        sa.Column("location", sa.String(200), nullable=True),
        sa.Column("timezone", sa.String(100), nullable=True),
        sa.Column("languages", JSONB(), nullable=True),
        sa.Column("occupation", sa.String(200), nullable=True),
        sa.Column("relationship_status", sa.String(50), nullable=True),
        sa.Column("living_situation", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_person_profile_user_id"),
    )
    op.create_index(op.f("ix_person_profiles_user_id"), "person_profiles", ["user_id"], unique=True)

    op.create_table(
        "app_preferences",
        sa.Column("id", sa.Integer(), sa.Identity(always=False), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("theme", sa.String(50), nullable=True),
        sa.Column("dark_mode", sa.Boolean(), nullable=True),
        sa.Column("notifications_enabled", sa.Boolean(), nullable=True),
        sa.Column("timezone", sa.String(100), nullable=True),
        sa.Column("language", sa.String(20), nullable=True),
        sa.Column("privacy_controls", JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_app_preferences_user_id"),
    )
    op.create_index(op.f("ix_app_preferences_user_id"), "app_preferences", ["user_id"], unique=True)

    op.create_table(
        "health_profiles",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("conditions", JSONB(), nullable=True),
        sa.Column("symptoms", JSONB(), nullable=True),
        sa.Column("sleep_issues", JSONB(), nullable=True),
        sa.Column("eating_style", sa.String(100), nullable=True),
        sa.Column("movement_habits", JSONB(), nullable=True),
        sa.Column("exercise_habits", JSONB(), nullable=True),
        sa.Column("substance_use_tracking", JSONB(), nullable=True),
        sa.Column("energy_issues", JSONB(), nullable=True),
        sa.Column("digestive_issues", JSONB(), nullable=True),
        sa.Column("providers", JSONB(), nullable=True),
        sa.Column("key_lab_markers", JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_health_profile_user_id"),
    )
    op.create_index(op.f("ix_health_profiles_user_id"), "health_profiles", ["user_id"], unique=True)

    op.create_table(
        "health_medications",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("health_profile_id", UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("dosage", sa.String(100), nullable=True),
        sa.Column("frequency", sa.String(100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["health_profile_id"], ["health_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "health_supplements",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("health_profile_id", UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("dosage", sa.String(100), nullable=True),
        sa.Column("frequency", sa.String(100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["health_profile_id"], ["health_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "health_allergies",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("health_profile_id", UUID(as_uuid=True), nullable=False),
        sa.Column("allergen", sa.String(200), nullable=False),
        sa.Column("severity", sa.String(50), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["health_profile_id"], ["health_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "health_goals",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("health_profile_id", UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("target_value", sa.Float(), nullable=True),
        sa.Column("target_unit", sa.String(50), nullable=True),
        sa.ForeignKeyConstraint(["health_profile_id"], ["health_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "health_habits",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("health_profile_id", UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("habit_type", sa.String(50), nullable=True),
        sa.Column("frequency", sa.String(100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["health_profile_id"], ["health_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "psychology_profiles",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("big_five", JSONB(), nullable=True),
        sa.Column("emotional_triggers", JSONB(), nullable=True),
        sa.Column("coping_patterns", JSONB(), nullable=True),
        sa.Column("thought_distortions", JSONB(), nullable=True),
        sa.Column("behavior_loops", JSONB(), nullable=True),
        sa.Column("therapy_methods_interest", JSONB(), nullable=True),
        sa.Column("cbt_preferences", JSONB(), nullable=True),
        sa.Column("dbt_preferences", JSONB(), nullable=True),
        sa.Column("shadow_work_interest", JSONB(), nullable=True),
        sa.Column("journaling_preference", sa.String(100), nullable=True),
        sa.Column("stress_patterns", JSONB(), nullable=True),
        sa.Column("mood_patterns", JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_psychology_profile_user_id"),
    )
    op.create_index(op.f("ix_psychology_profiles_user_id"), "psychology_profiles", ["user_id"], unique=True)

    op.create_table(
        "finance_profiles",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("fixed_monthly_expenses", sa.Float(), nullable=True),
        sa.Column("risk_tolerance", sa.String(50), nullable=True),
        sa.Column("budgeting_style", sa.String(50), nullable=True),
        sa.Column("emergency_fund_target", sa.Float(), nullable=True),
        sa.Column("emergency_fund_currency", sa.String(10), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_finance_profile_user_id"),
    )
    op.create_index(op.f("ix_finance_profiles_user_id"), "finance_profiles", ["user_id"], unique=True)

    op.create_table(
        "income_sources",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("finance_profile_id", UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("amount_monthly", sa.Float(), nullable=True),
        sa.Column("currency", sa.String(10), nullable=True),
        sa.Column("is_variable", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["finance_profile_id"], ["finance_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "debt_items",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("finance_profile_id", UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("balance", sa.Float(), nullable=True),
        sa.Column("interest_rate", sa.Float(), nullable=True),
        sa.Column("minimum_payment", sa.Float(), nullable=True),
        sa.Column("currency", sa.String(10), nullable=True),
        sa.ForeignKeyConstraint(["finance_profile_id"], ["finance_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "asset_items",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("finance_profile_id", UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("asset_type", sa.String(50), nullable=True),
        sa.Column("value", sa.Float(), nullable=True),
        sa.Column("currency", sa.String(10), nullable=True),
        sa.ForeignKeyConstraint(["finance_profile_id"], ["finance_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "finance_goals",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("finance_profile_id", UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("target_amount", sa.Float(), nullable=True),
        sa.Column("currency", sa.String(10), nullable=True),
        sa.Column("target_date", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["finance_profile_id"], ["finance_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "career_profiles",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("current_role", sa.String(200), nullable=True),
        sa.Column("active_projects", JSONB(), nullable=True),
        sa.Column("desired_skills", JSONB(), nullable=True),
        sa.Column("learning_priorities", JSONB(), nullable=True),
        sa.Column("schedule_constraints", JSONB(), nullable=True),
        sa.Column("work_style", sa.String(100), nullable=True),
        sa.Column("productivity_methods", JSONB(), nullable=True),
        sa.Column("long_term_career_goals", JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_career_profile_user_id"),
    )
    op.create_index(op.f("ix_career_profiles_user_id"), "career_profiles", ["user_id"], unique=True)

    op.create_table(
        "relationship_profiles",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("family_structure", JSONB(), nullable=True),
        sa.Column("close_friends", JSONB(), nullable=True),
        sa.Column("partner_status", sa.String(100), nullable=True),
        sa.Column("mentors", JSONB(), nullable=True),
        sa.Column("support_network", JSONB(), nullable=True),
        sa.Column("important_relationships", JSONB(), nullable=True),
        sa.Column("relationship_stressors", JSONB(), nullable=True),
        sa.Column("relationship_goals", JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_relationship_profile_user_id"),
    )
    op.create_index(op.f("ix_relationship_profiles_user_id"), "relationship_profiles", ["user_id"], unique=True)

    op.create_table(
        "lifestyle_profiles",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("usual_sleep_schedule", JSONB(), nullable=True),
        sa.Column("work_schedule", JSONB(), nullable=True),
        sa.Column("commute", JSONB(), nullable=True),
        sa.Column("home_environment", JSONB(), nullable=True),
        sa.Column("movement_environment", JSONB(), nullable=True),
        sa.Column("gym_access", sa.String(50), nullable=True),
        sa.Column("food_access", JSONB(), nullable=True),
        sa.Column("screen_time_habits", JSONB(), nullable=True),
        sa.Column("digital_distractions", JSONB(), nullable=True),
        sa.Column("weekend_structure", JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_lifestyle_profile_user_id"),
    )
    op.create_index(op.f("ix_lifestyle_profiles_user_id"), "lifestyle_profiles", ["user_id"], unique=True)

    op.create_table(
        "identity_profiles",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("values", JSONB(), nullable=True),
        sa.Column("principles", JSONB(), nullable=True),
        sa.Column("purpose", sa.Text(), nullable=True),
        sa.Column("spiritual_orientation", sa.String(200), nullable=True),
        sa.Column("ideal_self_description", sa.Text(), nullable=True),
        sa.Column("representation_goals", JSONB(), nullable=True),
        sa.Column("boundaries", JSONB(), nullable=True),
        sa.Column("non_negotiables", JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_identity_profile_user_id"),
    )
    op.create_index(op.f("ix_identity_profiles_user_id"), "identity_profiles", ["user_id"], unique=True)

    op.create_table(
        "strategy_preference_profiles",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("strict_vs_flexible", sa.String(50), nullable=True),
        sa.Column("data_heavy_vs_simple", sa.String(50), nullable=True),
        sa.Column("science_backed", sa.Boolean(), nullable=True),
        sa.Column("exploratory_reflective", sa.Boolean(), nullable=True),
        sa.Column("wants_gamification", sa.Boolean(), nullable=True),
        sa.Column("wants_reminders", sa.Boolean(), nullable=True),
        sa.Column("recommendation_style", sa.String(50), nullable=True),
        sa.Column("domain_priorities", JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_strategy_preference_profile_user_id"),
    )
    op.create_index(op.f("ix_strategy_preference_profiles_user_id"), "strategy_preference_profiles", ["user_id"], unique=True)


def downgrade() -> None:
    op.drop_table("strategy_preference_profiles")
    op.drop_table("identity_profiles")
    op.drop_table("lifestyle_profiles")
    op.drop_table("relationship_profiles")
    op.drop_table("career_profiles")
    op.drop_table("finance_goals")
    op.drop_table("asset_items")
    op.drop_table("debt_items")
    op.drop_table("income_sources")
    op.drop_table("finance_profiles")
    op.drop_table("psychology_profiles")
    op.drop_table("health_habits")
    op.drop_table("health_goals")
    op.drop_table("health_allergies")
    op.drop_table("health_supplements")
    op.drop_table("health_medications")
    op.drop_table("health_profiles")
    op.drop_table("app_preferences")
    op.drop_table("person_profiles")
