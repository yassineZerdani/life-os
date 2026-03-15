"""
Money Vault Rules Engine — orchestrates all vault business logic.
Deterministic, auditable, provider-agnostic.
"""
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.money_vault import WealthVault, WealthAccount, VaultTransaction, LedgerEntry
from app.services.vault_rules.eligibility import VaultEligibilityService, EligibilityResult
from app.services.vault_rules.penalty import VaultPenaltyService, BreakPenaltyResult
from app.services.vault_rules.ledger_service import LedgerService
from app.services.vault_rules.state_machines import MoneyVaultStateMachine, VaultTransactionStateMachine
from app.services.vault_rules.product_rules import VaultProductRules, DEFAULT_PRODUCT_RULES


@dataclass
class RuleResult:
    success: bool
    reason_code: Optional[str] = None
    message: Optional[str] = None
    data: Optional[dict] = None


class MoneyVaultRulesEngine:
    """
    Central rules engine for Money Vault.
    Routes logic based on vault_type (soft vs real).
    """

    def __init__(
        self,
        product_rules: VaultProductRules = DEFAULT_PRODUCT_RULES,
    ):
        self.product_rules = product_rules
        self.eligibility = VaultEligibilityService(product_rules)
        self.penalty = VaultPenaltyService()
        self.ledger = LedgerService()

    def can_fund_vault(
        self,
        vault: WealthVault,
        account: WealthAccount,
        amount: float,
        funding_source: Optional[Any] = None,
        source_type: str = "available_balance",
        db: Optional[Session] = None,
    ) -> RuleResult:
        """Check funding eligibility."""
        r = self.eligibility.can_fund_vault(vault, account, amount, funding_source, source_type, db)
        return RuleResult(r.allowed, r.reason_code, r.message)

    def can_lock_vault(self, vault: WealthVault, amount: Optional[float] = None) -> RuleResult:
        """Check lock eligibility."""
        r = self.eligibility.can_lock_vault(vault, amount)
        return RuleResult(r.allowed, r.reason_code, r.message)

    def can_unlock_vault(self, vault: WealthVault, now: Optional[datetime] = None) -> RuleResult:
        """Check unlock eligibility."""
        r = self.eligibility.can_unlock_vault(vault, now)
        return RuleResult(r.allowed, r.reason_code, r.message)

    def can_break_vault(self, vault: WealthVault) -> RuleResult:
        """Check break-early eligibility."""
        r = self.eligibility.can_break_vault(vault)
        return RuleResult(r.allowed, r.reason_code, r.message)

    def can_payout_vault(
        self,
        vault: WealthVault,
        account: WealthAccount,
        amount: float,
        destination_type: str = "to_available",
        destination: Optional[Any] = None,
    ) -> RuleResult:
        """Check payout eligibility."""
        r = self.eligibility.can_payout_vault(vault, account, amount, destination_type, destination)
        return RuleResult(r.allowed, r.reason_code, r.message)

    def calculate_break_penalty(self, vault: WealthVault, amount: float) -> BreakPenaltyResult:
        """Calculate break-early penalty. Deterministic."""
        return self.penalty.calculate_break_penalty(vault, amount)

    def validate_vault_transition(self, vault: WealthVault, to_state: str) -> RuleResult:
        """Validate vault state transition."""
        ok, reason = MoneyVaultStateMachine.transition(vault, to_state)
        return RuleResult(ok, reason if not ok else None)

    def validate_transaction_transition(self, tx: VaultTransaction, to_status: str) -> RuleResult:
        """Validate transaction state transition."""
        ok, reason = VaultTransactionStateMachine.can_transition(tx.status, to_status)
        return RuleResult(ok, reason if not ok else None)

    def validate_ledger_integrity(self, db: Session, wealth_account_id: UUID) -> tuple[bool, list[str]]:
        """Validate ledger consistency for account."""
        return self.ledger.validate_ledger_integrity(db, wealth_account_id)

    def reconcile_vault_balance(self, db: Session, vault_id: UUID) -> tuple[bool, float, float]:
        """Reconcile vault amount with ledger."""
        return self.ledger.reconcile_vault_balance(db, vault_id)

    def reconcile_account_balance(self, db: Session, wealth_account_id: UUID) -> Any:
        """Reconcile account balances with ledger."""
        return self.ledger.reconcile_account_balance(db, wealth_account_id)


# Singleton for default usage
_default_engine: Optional[MoneyVaultRulesEngine] = None


def get_rules_engine(product_rules: Optional[VaultProductRules] = None) -> MoneyVaultRulesEngine:
    """Get rules engine instance."""
    global _default_engine
    if product_rules is not None:
        return MoneyVaultRulesEngine(product_rules)
    if _default_engine is None:
        _default_engine = MoneyVaultRulesEngine()
    return _default_engine
