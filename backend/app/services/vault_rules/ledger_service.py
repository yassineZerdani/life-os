"""
Ledger integrity and reconciliation.
- All money movements produce ledger entries
- Balances derivable from ledger history
- Append-only ledger
"""
from dataclasses import dataclass
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.money_vault import LedgerEntry, WealthAccount, WealthVault


@dataclass
class ReconciliationResult:
    valid: bool
    expected_available: float
    expected_locked: float
    expected_pending: float
    actual_available: float
    actual_locked: float
    actual_pending: float
    discrepancy: bool


class LedgerService:
    """Ledger integrity validation and reconciliation."""

    def validate_ledger_integrity(
        self,
        db: Session,
        wealth_account_id: UUID,
    ) -> tuple[bool, list[str]]:
        """
        Validate that ledger entries are consistent.
        - No balance change without ledger entry (checked via reconciliation)
        - Entries are append-only (no updates/deletes — app-level policy)
        Returns (valid, list of error messages).
        """
        errors = []
        result = self.reconcile_account_balance(db, wealth_account_id)
        if result.discrepancy:
            errors.append(
                f"Account balance mismatch: expected available={result.expected_available}, "
                f"locked={result.expected_locked}, pending={result.expected_pending}; "
                f"actual available={result.actual_available}, locked={result.actual_locked}, "
                f"pending={result.actual_pending}"
            )
        return len(errors) == 0, errors

    def reconcile_account_balance(
        self,
        db: Session,
        wealth_account_id: UUID,
    ) -> ReconciliationResult:
        """
        Derive balance from ledger history and compare to account.
        Ledger: credit increases bucket, debit decreases.
        """
        account = db.query(WealthAccount).filter(WealthAccount.id == wealth_account_id).first()
        if not account:
            return ReconciliationResult(
                valid=False,
                expected_available=0, expected_locked=0, expected_pending=0,
                actual_available=0, actual_locked=0, actual_pending=0,
                discrepancy=True,
            )

        def _bucket_balance(bucket: str) -> float:
            credits = (
                db.query(func.coalesce(func.sum(LedgerEntry.amount), 0))
                .filter(
                    LedgerEntry.wealth_account_id == wealth_account_id,
                    LedgerEntry.balance_bucket == bucket,
                    LedgerEntry.direction == "credit",
                )
                .scalar()
                or 0
            )
            debits = (
                db.query(func.coalesce(func.sum(LedgerEntry.amount), 0))
                .filter(
                    LedgerEntry.wealth_account_id == wealth_account_id,
                    LedgerEntry.balance_bucket == bucket,
                    LedgerEntry.direction == "debit",
                )
                .scalar()
                or 0
            )
            return float(credits) - float(debits)

        expected_available = _bucket_balance("available")
        expected_locked = _bucket_balance("locked")
        expected_pending = _bucket_balance("pending")

        discrepancy = (
            abs(account.available_balance - expected_available) > 1e-6
            or abs(account.locked_balance - expected_locked) > 1e-6
            or abs(account.pending_balance - expected_pending) > 1e-6
        )
        return ReconciliationResult(
            valid=not discrepancy,
            expected_available=expected_available,
            expected_locked=expected_locked,
            expected_pending=expected_pending,
            actual_available=account.available_balance,
            actual_locked=account.locked_balance,
            actual_pending=account.pending_balance,
            discrepancy=discrepancy,
        )

    def reconcile_vault_balance(
        self,
        db: Session,
        vault_id: UUID,
    ) -> tuple[bool, float, float]:
        """
        Reconcile vault.current_amount with ledger entries for this vault.
        Vault amount = sum of vault-specific ledger credits to locked minus debits from locked
        (simplified: vault holds locked funds; funding adds to locked, unlock removes)
        Returns (valid, expected_vault_amount, actual_vault_amount).
        """
        vault = db.query(WealthVault).filter(WealthVault.id == vault_id).first()
        if not vault:
            return False, 0.0, 0.0

        # Vault amount is the locked balance attributable to this vault.
        # Ledger entries with vault_id: credits to locked = funds in vault, debits = funds out
        credits = (
            db.query(func.coalesce(func.sum(LedgerEntry.amount), 0))
            .filter(
                LedgerEntry.vault_id == vault_id,
                LedgerEntry.balance_bucket == "locked",
                LedgerEntry.direction == "credit",
            )
            .scalar()
            or 0
        )
        debits = (
            db.query(func.coalesce(func.sum(LedgerEntry.amount), 0))
            .filter(
                LedgerEntry.vault_id == vault_id,
                LedgerEntry.balance_bucket == "locked",
                LedgerEntry.direction == "debit",
            )
            .scalar()
            or 0
        )
        expected = credits - debits
        actual = vault.current_amount
        valid = abs(expected - actual) <= 1e-6
        return valid, expected, actual
