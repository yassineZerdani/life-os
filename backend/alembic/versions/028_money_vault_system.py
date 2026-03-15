"""Money Vault System: wealth_accounts, funding_sources, wealth_vaults, vault_transactions, ledger_entries, unlock_schedules, payout_destinations, compliance_profiles

Revision ID: 028
Revises: 027
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "028"
down_revision: Union[str, None] = "027"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "wealth_accounts",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("account_type", sa.String(50), nullable=False),
        sa.Column("provider", sa.String(50), nullable=False),
        sa.Column("provider_account_id", sa.String(200), nullable=True),
        sa.Column("currency", sa.String(10), nullable=False),
        sa.Column("available_balance", sa.Float(), nullable=False),
        sa.Column("locked_balance", sa.Float(), nullable=False),
        sa.Column("pending_balance", sa.Float(), nullable=False),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_wealth_accounts_user", "wealth_accounts", ["user_id"], unique=False)

    op.create_table(
        "funding_sources",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("source_type", sa.String(50), nullable=False),
        sa.Column("provider", sa.String(50), nullable=False),
        sa.Column("provider_source_id", sa.String(200), nullable=True),
        sa.Column("label", sa.String(200), nullable=False),
        sa.Column("last4", sa.String(4), nullable=True),
        sa.Column("brand", sa.String(50), nullable=True),
        sa.Column("active", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_funding_sources_user", "funding_sources", ["user_id"], unique=False)

    op.create_table(
        "wealth_vaults",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("wealth_account_id", UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("vault_type", sa.String(20), nullable=False),
        sa.Column("target_amount", sa.Float(), nullable=True),
        sa.Column("current_amount", sa.Float(), nullable=False),
        sa.Column("unlock_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("lock_status", sa.String(30), nullable=False),
        sa.Column("break_early_allowed", sa.Integer(), nullable=False),
        sa.Column("break_early_penalty_type", sa.String(30), nullable=True),
        sa.Column("break_early_penalty_value", sa.Float(), nullable=True),
        sa.Column("auto_unlock", sa.Integer(), nullable=False),
        sa.Column("payout_destination_type", sa.String(50), nullable=True),
        sa.Column("currency", sa.String(10), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["wealth_account_id"], ["wealth_accounts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_wealth_vaults_user", "wealth_vaults", ["user_id"], unique=False)
    op.create_index("ix_wealth_vaults_account", "wealth_vaults", ["wealth_account_id"], unique=False)

    op.create_table(
        "vault_transactions",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("vault_id", UUID(as_uuid=True), nullable=False),
        sa.Column("transaction_type", sa.String(30), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(10), nullable=False),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("source_type", sa.String(50), nullable=True),
        sa.Column("source_id", sa.String(200), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("provider_reference", sa.String(200), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["vault_id"], ["wealth_vaults.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_vault_transactions_vault", "vault_transactions", ["vault_id"], unique=False)

    op.create_table(
        "ledger_entries",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("wealth_account_id", UUID(as_uuid=True), nullable=False),
        sa.Column("vault_id", UUID(as_uuid=True), nullable=True),
        sa.Column("entry_type", sa.String(50), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("balance_bucket", sa.String(20), nullable=False),
        sa.Column("direction", sa.String(10), nullable=False),
        sa.Column("reference_type", sa.String(50), nullable=False),
        sa.Column("reference_id", sa.String(200), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["wealth_account_id"], ["wealth_accounts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["vault_id"], ["wealth_vaults.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ledger_entries_user", "ledger_entries", ["user_id"], unique=False)
    op.create_index("ix_ledger_entries_account", "ledger_entries", ["wealth_account_id"], unique=False)
    op.create_index("ix_ledger_entries_vault", "ledger_entries", ["vault_id"], unique=False)

    op.create_table(
        "unlock_schedules",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("vault_id", UUID(as_uuid=True), nullable=False),
        sa.Column("scheduled_for", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("executed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("payout_destination_type", sa.String(50), nullable=True),
        sa.Column("payout_destination_id", sa.String(200), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["vault_id"], ["wealth_vaults.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_unlock_schedules_vault", "unlock_schedules", ["vault_id"], unique=False)

    op.create_table(
        "payout_destinations",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("destination_type", sa.String(50), nullable=False),
        sa.Column("provider", sa.String(50), nullable=False),
        sa.Column("provider_destination_id", sa.String(200), nullable=True),
        sa.Column("label", sa.String(200), nullable=False),
        sa.Column("active", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_payout_destinations_user", "payout_destinations", ["user_id"], unique=False)

    op.create_table(
        "compliance_profiles",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("kyc_status", sa.String(30), nullable=False),
        sa.Column("risk_level", sa.String(20), nullable=True),
        sa.Column("verification_provider", sa.String(50), nullable=True),
        sa.Column("verification_reference", sa.String(200), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_compliance_profiles_user", "compliance_profiles", ["user_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_compliance_profiles_user", table_name="compliance_profiles")
    op.drop_table("compliance_profiles")
    op.drop_index("ix_payout_destinations_user", table_name="payout_destinations")
    op.drop_table("payout_destinations")
    op.drop_index("ix_unlock_schedules_vault", table_name="unlock_schedules")
    op.drop_table("unlock_schedules")
    op.drop_index("ix_ledger_entries_vault", table_name="ledger_entries")
    op.drop_index("ix_ledger_entries_account", table_name="ledger_entries")
    op.drop_index("ix_ledger_entries_user", table_name="ledger_entries")
    op.drop_table("ledger_entries")
    op.drop_index("ix_vault_transactions_vault", table_name="vault_transactions")
    op.drop_table("vault_transactions")
    op.drop_index("ix_wealth_vaults_account", table_name="wealth_vaults")
    op.drop_index("ix_wealth_vaults_user", table_name="wealth_vaults")
    op.drop_table("wealth_vaults")
    op.drop_index("ix_funding_sources_user", table_name="funding_sources")
    op.drop_table("funding_sources")
    op.drop_index("ix_wealth_accounts_user", table_name="wealth_accounts")
    op.drop_table("wealth_accounts")
