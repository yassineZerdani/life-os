"""Wealth domain: budget categories, allocations, expenses, income entries, vaults, investment strategies and accounts

Revision ID: 017
Revises: 016
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "017"
down_revision: Union[str, None] = "016"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "budget_categories",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("key", sa.String(30), nullable=False),
        sa.Column("label", sa.String(100), nullable=False),
        sa.Column("target_percentage", sa.Float(), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_budget_categories_key"), "budget_categories", ["key"], unique=True)

    op.create_table(
        "budget_allocations",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("finance_profile_id", UUID(as_uuid=True), nullable=False),
        sa.Column("category_key", sa.String(30), nullable=False),
        sa.Column("target_percentage", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["finance_profile_id"], ["finance_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_budget_allocations_finance", "budget_allocations", ["finance_profile_id"], unique=False)

    op.create_table(
        "expenses",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("finance_profile_id", UUID(as_uuid=True), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(10), nullable=True),
        sa.Column("category", sa.String(30), nullable=False),
        sa.Column("description", sa.String(500), nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["finance_profile_id"], ["finance_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_expenses_finance", "expenses", ["finance_profile_id"], unique=False)
    op.create_index("ix_expenses_occurred", "expenses", ["occurred_at"], unique=False)

    op.create_table(
        "income_entries",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("finance_profile_id", UUID(as_uuid=True), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(10), nullable=True),
        sa.Column("income_source_id", UUID(as_uuid=True), nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("automation_applied", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["finance_profile_id"], ["finance_profiles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["income_source_id"], ["income_sources.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_income_entries_finance", "income_entries", ["finance_profile_id"], unique=False)

    op.create_table(
        "money_vaults",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("finance_profile_id", UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("target_amount", sa.Float(), nullable=False),
        sa.Column("current_amount", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(10), nullable=True),
        sa.Column("unlock_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("allocation_key", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["finance_profile_id"], ["finance_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_money_vaults_finance", "money_vaults", ["finance_profile_id"], unique=False)

    op.create_table(
        "investment_strategies",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("finance_profile_id", UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(50), nullable=False),
        sa.Column("label", sa.String(100), nullable=True),
        sa.Column("is_active", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["finance_profile_id"], ["finance_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_investment_strategies_finance", "investment_strategies", ["finance_profile_id"], unique=False)

    op.create_table(
        "investment_allocations",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("investment_strategy_id", UUID(as_uuid=True), nullable=False),
        sa.Column("allocation_key", sa.String(50), nullable=False),
        sa.Column("label", sa.String(100), nullable=True),
        sa.Column("percentage", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["investment_strategy_id"], ["investment_strategies.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_investment_allocations_strategy", "investment_allocations", ["investment_strategy_id"], unique=False)

    op.create_table(
        "investment_accounts",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("finance_profile_id", UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("account_type", sa.String(50), nullable=True),
        sa.Column("allocation_key", sa.String(50), nullable=True),
        sa.Column("balance", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(10), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["finance_profile_id"], ["finance_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_investment_accounts_finance", "investment_accounts", ["finance_profile_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_investment_accounts_finance", table_name="investment_accounts")
    op.drop_table("investment_accounts")
    op.drop_index("ix_investment_allocations_strategy", table_name="investment_allocations")
    op.drop_table("investment_allocations")
    op.drop_index("ix_investment_strategies_finance", table_name="investment_strategies")
    op.drop_table("investment_strategies")
    op.drop_index("ix_money_vaults_finance", table_name="money_vaults")
    op.drop_table("money_vaults")
    op.drop_index("ix_income_entries_finance", table_name="income_entries")
    op.drop_table("income_entries")
    op.drop_index("ix_expenses_occurred", table_name="expenses")
    op.drop_index("ix_expenses_finance", table_name="expenses")
    op.drop_table("expenses")
    op.drop_index("ix_budget_allocations_finance", table_name="budget_allocations")
    op.drop_table("budget_allocations")
    op.drop_index(op.f("ix_budget_categories_key"), table_name="budget_categories")
    op.drop_table("budget_categories")
