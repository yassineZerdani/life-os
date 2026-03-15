"""
Money Vault Service — create, fund, lock, unlock, payout, break-early.
All balance movements generate ledger entries. Supports soft and real vault modes.
Uses MoneyVaultRulesEngine for eligibility and state transitions.
"""
from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.money_vault import (
    WealthAccount,
    FundingSource,
    WealthVault,
    VaultTransaction,
    LedgerEntry,
    UnlockSchedule,
)
from app.services.vault_provider import VaultProviderAdapter, MockVaultProviderAdapter
from app.services.vault_rules import get_rules_engine


def _get_provider() -> VaultProviderAdapter:
    return MockVaultProviderAdapter()


def _get_or_create_wealth_account(db: Session, user_id: int, currency: str = "USD") -> WealthAccount:
    acc = db.query(WealthAccount).filter(WealthAccount.user_id == user_id).first()
    if acc:
        return acc
    provider = _get_provider()
    provider_id, err = provider.create_customer_account(user_id, currency)
    if err:
        raise ValueError(f"Failed to create account: {err}")
    acc = WealthAccount(
        user_id=user_id,
        account_type="internal",
        provider="mock",
        provider_account_id=provider_id,
        currency=currency,
        available_balance=0,
        locked_balance=0,
        pending_balance=0,
        status="active",
    )
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return acc


def _write_ledger(
    db: Session,
    user_id: int,
    wealth_account_id: UUID,
    entry_type: str,
    amount: float,
    balance_bucket: str,
    direction: str,
    reference_type: str,
    reference_id: str,
    vault_id: UUID | None = None,
) -> LedgerEntry:
    entry = LedgerEntry(
        user_id=user_id,
        wealth_account_id=wealth_account_id,
        vault_id=vault_id,
        entry_type=entry_type,
        amount=amount,
        balance_bucket=balance_bucket,
        direction=direction,
        reference_type=reference_type,
        reference_id=reference_id,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def _create_vault_transaction(
    db: Session,
    vault_id: UUID,
    transaction_type: str,
    amount: float,
    currency: str,
    status: str = "posted",
    source_type: str | None = None,
    source_id: str | None = None,
    notes: str | None = None,
    provider_reference: str | None = None,
) -> VaultTransaction:
    tx = VaultTransaction(
        vault_id=vault_id,
        transaction_type=transaction_type,
        amount=amount,
        currency=currency,
        status=status,
        source_type=source_type,
        source_id=source_id,
        notes=notes,
        provider_reference=provider_reference,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


def create_vault(
    db: Session,
    user_id: int,
    name: str,
    unlock_date: datetime,
    target_amount: float | None = None,
    description: str | None = None,
    vault_type: str = "soft",
    break_early_allowed: bool = False,
    break_early_penalty_type: str | None = None,
    break_early_penalty_value: float | None = None,
    auto_unlock: bool = True,
    currency: str = "USD",
) -> WealthVault:
    acc = _get_or_create_wealth_account(db, user_id, currency)
    vault = WealthVault(
        user_id=user_id,
        wealth_account_id=acc.id,
        name=name,
        description=description,
        vault_type=vault_type,
        target_amount=target_amount,
        current_amount=0,
        unlock_date=unlock_date,
        lock_status="draft",
        break_early_allowed=1 if break_early_allowed else 0,
        break_early_penalty_type=break_early_penalty_type,
        break_early_penalty_value=break_early_penalty_value,
        auto_unlock=1 if auto_unlock else 0,
        currency=currency,
    )
    db.add(vault)
    db.commit()
    db.refresh(vault)
    # Create unlock schedule
    sched = UnlockSchedule(
        vault_id=vault.id,
        scheduled_for=unlock_date,
        status="pending",
        payout_destination_type="to_available",
    )
    db.add(sched)
    db.commit()
    return vault


def fund_vault(
    db: Session,
    user_id: int,
    vault_id: UUID,
    amount: float,
    funding_source_id: UUID | None = None,
    source_type: str = "available_balance",
) -> tuple[WealthVault, VaultTransaction]:
    """Fund vault from available balance or funding source. Uses rules engine for eligibility."""
    engine = get_rules_engine()
    vault = db.query(WealthVault).filter(WealthVault.id == vault_id, WealthVault.user_id == user_id).first()
    if not vault:
        raise ValueError("Vault not found")
    acc = db.query(WealthAccount).filter(WealthAccount.id == vault.wealth_account_id).first()
    if not acc:
        raise ValueError("Wealth account not found")

    funding_source = None
    if funding_source_id:
        funding_source = db.query(FundingSource).filter(
            FundingSource.id == funding_source_id,
            FundingSource.user_id == user_id,
        ).first()

    result = engine.can_fund_vault(vault, acc, amount, funding_source, source_type, db)
    if not result.success:
        raise ValueError(result.message or result.reason_code)

    # Transition draft -> active on first funding
    if vault.lock_status == "draft":
        vault.lock_status = "active"

    # Move available -> locked (vault holds funds)
    acc.available_balance -= amount
    acc.locked_balance += amount
    vault.current_amount += amount

    tx = _create_vault_transaction(
        db, vault_id, "add_funds", amount, vault.currency,
        source_type=source_type,
        source_id=str(funding_source_id) if funding_source_id else None,
    )

    _write_ledger(
        db, user_id, acc.id, "vault_fund", amount, "available", "debit",
        "vault_transaction", str(tx.id), vault_id,
    )
    _write_ledger(
        db, user_id, acc.id, "vault_fund", amount, "locked", "credit",
        "vault_transaction", str(tx.id), vault_id,
    )

    db.commit()
    db.refresh(vault)
    db.refresh(acc)
    return vault, tx


def lock_vault(db: Session, user_id: int, vault_id: UUID) -> WealthVault:
    """Lock the vault — prevent withdrawals until unlock date."""
    engine = get_rules_engine()
    vault = db.query(WealthVault).filter(WealthVault.id == vault_id, WealthVault.user_id == user_id).first()
    if not vault:
        raise ValueError("Vault not found")

    result = engine.can_lock_vault(vault)
    if not result.success:
        raise ValueError(result.message or result.reason_code)

    acc = db.query(WealthAccount).filter(WealthAccount.id == vault.wealth_account_id).first()
    if not acc:
        raise ValueError("Wealth account not found")

    # For soft vault: money is already in vault.current_amount and account.locked_balance (from fund)
    # Lock status change: draft/active -> locked
    vault.lock_status = "locked"

    if vault.vault_type == "real":
        provider = _get_provider()
        result = provider.move_to_locked_balance(
            acc.provider_account_id or "",
            vault.current_amount,
            vault.currency,
            str(vault.id),
        )
        if not result.success:
            raise ValueError(result.error_message or "Provider failed to lock")

    db.commit()
    db.refresh(vault)
    return vault


def check_unlock_eligibility(vault: WealthVault) -> bool:
    """True if vault can be unlocked (date reached or break-early)."""
    if vault.lock_status == "unlockable":
        return True
    if vault.lock_status == "locked":
        now = datetime.now(timezone.utc)
        if vault.unlock_date <= now:
            return True
        if vault.break_early_allowed:
            return True  # User can request break
    return False


def unlock_vault(db: Session, user_id: int, vault_id: UUID) -> WealthVault:
    """Unlock vault — move locked -> available (or to payout destination)."""
    engine = get_rules_engine()
    vault = db.query(WealthVault).filter(WealthVault.id == vault_id, WealthVault.user_id == user_id).first()
    if not vault:
        raise ValueError("Vault not found")

    result = engine.can_unlock_vault(vault)
    if not result.success:
        raise ValueError(result.message or result.reason_code)

    acc = db.query(WealthAccount).filter(WealthAccount.id == vault.wealth_account_id).first()
    if not acc:
        raise ValueError("Wealth account not found")

    amount = vault.current_amount

    # Release locked -> available
    if vault.vault_type == "real":
        provider = _get_provider()
        result = provider.release_locked_balance(
            acc.provider_account_id or "",
            amount,
            vault.currency,
            str(vault.id),
        )
        if not result.success:
            raise ValueError(result.error_message or "Provider failed to release")

    acc.locked_balance -= amount
    acc.available_balance += amount
    vault.current_amount = 0
    vault.lock_status = "unlocked"

    tx = _create_vault_transaction(db, vault_id, "unlock", amount, vault.currency, notes="Unlocked on schedule")
    _write_ledger(db, user_id, acc.id, "vault_unlock", amount, "locked", "debit", "vault_transaction", str(tx.id), vault_id)
    _write_ledger(db, user_id, acc.id, "vault_unlock", amount, "available", "credit", "vault_transaction", str(tx.id), vault_id)

    now = datetime.now(timezone.utc)
    sched = db.query(UnlockSchedule).filter(UnlockSchedule.vault_id == vault_id).first()
    if sched:
        sched.status = "executed"
        sched.executed_at = now

    db.commit()
    db.refresh(vault)
    return vault


def break_vault_early(db: Session, user_id: int, vault_id: UUID) -> WealthVault:
    """Break vault early — apply penalty if configured."""
    engine = get_rules_engine()
    vault = db.query(WealthVault).filter(WealthVault.id == vault_id, WealthVault.user_id == user_id).first()
    if not vault:
        raise ValueError("Vault not found")

    result = engine.can_break_vault(vault)
    if not result.success:
        raise ValueError(result.message or result.reason_code)

    acc = db.query(WealthAccount).filter(WealthAccount.id == vault.wealth_account_id).first()
    if not acc:
        raise ValueError("Wealth account not found")

    amount = vault.current_amount
    penalty_result = engine.calculate_break_penalty(vault, amount)
    penalty = penalty_result.penalty_amount
    net_amount = penalty_result.net_unlockable_amount

    acc.locked_balance -= amount
    acc.available_balance += net_amount
    vault.current_amount = 0
    vault.lock_status = "broken"

    tx = _create_vault_transaction(
        db, vault_id, "break_early", amount, vault.currency,
        notes=f"Early break. Penalty: {penalty}",
    )
    if penalty > 0:
        fee_tx = _create_vault_transaction(db, vault_id, "fee", penalty, vault.currency, notes="Early break penalty")
        _write_ledger(db, user_id, acc.id, "fee", penalty, "locked", "debit", "vault_transaction", str(fee_tx.id), vault_id)

    _write_ledger(db, user_id, acc.id, "break_early", amount, "locked", "debit", "vault_transaction", str(tx.id), vault_id)
    _write_ledger(db, user_id, acc.id, "break_early", net_amount, "available", "credit", "vault_transaction", str(tx.id), vault_id)

    db.commit()
    db.refresh(vault)
    return vault


def add_funds_to_account(
    db: Session,
    user_id: int,
    amount: float,
    funding_source_id: UUID | None = None,
    currency: str = "USD",
) -> WealthAccount:
    """Add funds to available balance (simulated for MVP — no real bank)."""
    acc = _get_or_create_wealth_account(db, user_id, currency)
    provider = _get_provider()
    source_id = str(funding_source_id) if funding_source_id else "mock_internal"
    result = provider.initiate_funding(
        acc.provider_account_id or "",
        source_id,
        amount,
        currency,
    )
    if not result.success:
        raise ValueError(result.error_message or "Funding failed")

    acc.available_balance += amount
    _write_ledger(
        db, user_id, acc.id, "funding", amount, "available", "credit",
        "funding", result.reference or "mock",
    )
    db.commit()
    db.refresh(acc)
    return acc
