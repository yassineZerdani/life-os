"""
Money Vault System — real financial architecture for locked savings.
Supports soft (in-app ledger) and real (partner-backed) vault modes.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class WealthAccount(Base):
    """User's wealth account — wallet/balance held by app or partner."""
    __tablename__ = "wealth_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    account_type = Column(String(50), nullable=False)  # internal, partner_fbo, etc.
    provider = Column(String(50), nullable=False, default="mock")  # mock, stripe, dwolla, etc.
    provider_account_id = Column(String(200), nullable=True)
    currency = Column(String(10), nullable=False, default="USD")
    available_balance = Column(Float, nullable=False, default=0)
    locked_balance = Column(Float, nullable=False, default=0)
    pending_balance = Column(Float, nullable=False, default=0)
    status = Column(String(30), nullable=False, default="active")  # active, suspended, closed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    vaults = relationship("WealthVault", back_populates="wealth_account", cascade="all, delete-orphan")
    ledger_entries = relationship("LedgerEntry", back_populates="wealth_account", cascade="all, delete-orphan")


class FundingSource(Base):
    """Source for funding the wealth account (bank, card, etc.)."""
    __tablename__ = "funding_sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    source_type = Column(String(50), nullable=False)  # bank_transfer, debit_card, credit_card
    provider = Column(String(50), nullable=False, default="mock")
    provider_source_id = Column(String(200), nullable=True)
    label = Column(String(200), nullable=False)
    last4 = Column(String(4), nullable=True)
    brand = Column(String(50), nullable=True)
    active = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class WealthVault(Base):
    """Money vault — locked savings until unlock date."""
    __tablename__ = "wealth_vaults"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    wealth_account_id = Column(
        UUID(as_uuid=True),
        ForeignKey("wealth_accounts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    vault_type = Column(String(20), nullable=False, default="soft")  # soft, real
    target_amount = Column(Float, nullable=True)
    current_amount = Column(Float, nullable=False, default=0)
    unlock_date = Column(DateTime(timezone=True), nullable=False)
    lock_status = Column(String(30), nullable=False, default="draft")  # draft, active, locked, unlockable, unlocked, withdrawn, broken
    break_early_allowed = Column(Integer, nullable=False, default=0)
    break_early_penalty_type = Column(String(30), nullable=True)  # percentage, fixed, none
    break_early_penalty_value = Column(Float, nullable=True)
    auto_unlock = Column(Integer, nullable=False, default=1)
    payout_destination_type = Column(String(50), nullable=True)  # to_available, to_external
    currency = Column(String(10), nullable=False, default="USD")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    wealth_account = relationship("WealthAccount", back_populates="vaults")
    transactions = relationship("VaultTransaction", back_populates="vault", cascade="all, delete-orphan")
    unlock_schedules = relationship("UnlockSchedule", back_populates="vault", cascade="all, delete-orphan")


class VaultTransaction(Base):
    """Immutable record of vault money movement."""
    __tablename__ = "vault_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vault_id = Column(
        UUID(as_uuid=True),
        ForeignKey("wealth_vaults.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    transaction_type = Column(String(30), nullable=False)  # fund, lock, add_funds, unlock, payout, break_early, reverse, fee
    amount = Column(Float, nullable=False)
    currency = Column(String(10), nullable=False, default="USD")
    status = Column(String(30), nullable=False, default="posted")  # pending, posted, failed, canceled
    source_type = Column(String(50), nullable=True)  # funding_source, available_balance, etc.
    source_id = Column(String(200), nullable=True)
    notes = Column(Text, nullable=True)
    provider_reference = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vault = relationship("WealthVault", back_populates="transactions")


class LedgerEntry(Base):
    """Double-entry style ledger for all balance movements."""
    __tablename__ = "ledger_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    wealth_account_id = Column(
        UUID(as_uuid=True),
        ForeignKey("wealth_accounts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    vault_id = Column(
        UUID(as_uuid=True),
        ForeignKey("wealth_vaults.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    entry_type = Column(String(50), nullable=False)  # funding, lock, unlock, payout, fee, etc.
    amount = Column(Float, nullable=False)
    balance_bucket = Column(String(20), nullable=False)  # available, locked, pending
    direction = Column(String(10), nullable=False)  # credit, debit
    reference_type = Column(String(50), nullable=False)  # vault_transaction, funding, etc.
    reference_id = Column(String(200), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    wealth_account = relationship("WealthAccount", back_populates="ledger_entries")


class UnlockSchedule(Base):
    """Scheduled unlock events for vaults."""
    __tablename__ = "unlock_schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vault_id = Column(
        UUID(as_uuid=True),
        ForeignKey("wealth_vaults.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    scheduled_for = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(30), nullable=False, default="pending")  # pending, executed, canceled
    executed_at = Column(DateTime(timezone=True), nullable=True)
    payout_destination_type = Column(String(50), nullable=True)
    payout_destination_id = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vault = relationship("WealthVault", back_populates="unlock_schedules")


class PayoutDestination(Base):
    """Where unlocked funds can be sent."""
    __tablename__ = "payout_destinations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    destination_type = Column(String(50), nullable=False)  # bank_account, wallet, etc.
    provider = Column(String(50), nullable=False, default="mock")
    provider_destination_id = Column(String(200), nullable=True)
    label = Column(String(200), nullable=False)
    active = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ComplianceProfile(Base):
    """KYC/compliance readiness — structure for future verification."""
    __tablename__ = "compliance_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    kyc_status = Column(String(30), nullable=False, default="not_started")  # not_started, pending, verified, rejected
    risk_level = Column(String(20), nullable=True)  # low, medium, high
    verification_provider = Column(String(50), nullable=True)
    verification_reference = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
