"""
Vault eligibility rules — can_fund, can_lock, can_unlock, can_break, can_payout.
Returns (allowed, reason_code) for audit and UX.
"""
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.money_vault import WealthVault, WealthAccount, FundingSource, ComplianceProfile
from app.services.vault_rules.reason_codes import (
    AMOUNT_ABOVE_MAXIMUM,
    AMOUNT_BELOW_MINIMUM,
    AMOUNT_INVALID,
    BREAK_EARLY_NOT_ALLOWED,
    CARD_FUNDING_NOT_ALLOWED,
    FUNDING_SOURCE_INACTIVE,
    FUNDING_SOURCE_UNVERIFIED,
    INSUFFICIENT_AMOUNT,
    INSUFFICIENT_AVAILABLE_BALANCE,
    KYC_REQUIRED,
    PAYOUT_DESTINATION_INVALID,
    PAYOUT_HOLD,
    REAL_VAULT_REQUIRES_VERIFIED_SOURCE,
    UNLOCK_DATE_NOT_REACHED,
    VAULT_ALREADY_UNLOCKED,
    VAULT_CLOSED_OR_CANCELED,
    VAULT_EMPTY,
    VAULT_NOT_FUNDABLE,
    VAULT_NOT_LOCKABLE,
    VAULT_NOT_LOCKED,
    VAULT_NOT_PAYOUT_ELIGIBLE,
    VAULT_NOT_UNLOCKABLE,
    ZERO_OR_NEGATIVE_AMOUNT,
)
from app.services.vault_rules.product_rules import VaultProductRules, DEFAULT_PRODUCT_RULES
from app.services.vault_rules.state_machines import (
    MoneyVaultStateMachine,
    VAULT_ACTIVE,
    VAULT_DRAFT,
    VAULT_LOCKED,
    VAULT_UNLOCKABLE,
    VAULT_UNLOCKED,
    VAULT_WITHDRAWN,
    VAULT_BROKEN,
    VAULT_CANCELED,
)


@dataclass
class EligibilityResult:
    allowed: bool
    reason_code: Optional[str] = None
    message: Optional[str] = None


class VaultEligibilityService:
    """Determines eligibility for funding, lock, unlock, break, payout."""

    def __init__(self, product_rules: VaultProductRules = DEFAULT_PRODUCT_RULES):
        self.rules = product_rules

    def can_fund_vault(
        self,
        vault: WealthVault,
        account: WealthAccount,
        amount: float,
        funding_source: Optional[Any] = None,
        source_type: str = "available_balance",
        db: Optional[Session] = None,
    ) -> EligibilityResult:
        """Check if vault can be funded."""
        if vault is None:
            return EligibilityResult(False, VAULT_CLOSED_OR_CANCELED, "Vault not found")

        if vault.lock_status in (VAULT_WITHDRAWN, VAULT_BROKEN, VAULT_CANCELED):
            return EligibilityResult(False, VAULT_CLOSED_OR_CANCELED, "Vault is closed or canceled")

        if vault.lock_status not in (VAULT_DRAFT, VAULT_ACTIVE):
            return EligibilityResult(False, VAULT_NOT_FUNDABLE, f"Vault status {vault.lock_status} cannot receive funding")

        if amount <= 0:
            return EligibilityResult(False, ZERO_OR_NEGATIVE_AMOUNT, "Amount must be positive")

        if amount < self.rules.min_funding_amount:
            return EligibilityResult(False, AMOUNT_BELOW_MINIMUM, f"Amount below minimum {self.rules.min_funding_amount}")

        if amount > self.rules.max_funding_amount:
            return EligibilityResult(False, AMOUNT_ABOVE_MAXIMUM, f"Amount above maximum {self.rules.max_funding_amount}")

        # Funding source checks
        if source_type == "credit_card" and not self.rules.allow_credit_card_funding:
            return EligibilityResult(False, CARD_FUNDING_NOT_ALLOWED, "Credit card funding not allowed")

        allowed_sources = (
            self.rules.real_vault_allowed_sources
            if vault.vault_type == "real"
            else self.rules.soft_vault_allowed_sources
        )
        if source_type not in allowed_sources and source_type != "available_balance":
            return EligibilityResult(False, FUNDING_SOURCE_INACTIVE, f"Source type {source_type} not allowed")

        if funding_source is not None and getattr(funding_source, "active", 1) != 1:
            return EligibilityResult(False, FUNDING_SOURCE_INACTIVE, "Funding source is inactive")

        if vault.vault_type == "real" and self.rules.real_vault_requires_verified_source:
            if funding_source is None and source_type != "available_balance":
                return EligibilityResult(False, REAL_VAULT_REQUIRES_VERIFIED_SOURCE, "Real vault requires verified source")

        if vault.vault_type == "real" and self.rules.real_vault_requires_kyc and db:
            profile = db.query(ComplianceProfile).filter(ComplianceProfile.user_id == vault.user_id).first()
            if profile and profile.kyc_status != "verified":
                return EligibilityResult(False, KYC_REQUIRED, "KYC verification required for real vault")

        # Available balance check (when funding from available)
        if source_type == "available_balance":
            if account.available_balance < amount:
                return EligibilityResult(False, INSUFFICIENT_AVAILABLE_BALANCE, "Insufficient available balance")

        return EligibilityResult(True)

    def can_lock_vault(
        self,
        vault: WealthVault,
        amount: Optional[float] = None,
    ) -> EligibilityResult:
        """Check if vault can be locked."""
        if vault is None:
            return EligibilityResult(False, VAULT_NOT_LOCKABLE, "Vault not found")

        ok, reason = MoneyVaultStateMachine.can_transition(vault.lock_status, "locked", vault.break_early_allowed)
        if not ok:
            return EligibilityResult(False, VAULT_NOT_LOCKABLE, f"Invalid transition from {vault.lock_status}")

        if vault.unlock_date is None:
            return EligibilityResult(False, VAULT_NOT_LOCKABLE, "Unlock date is required")

        amt = amount if amount is not None else vault.current_amount
        if amt <= 0:
            return EligibilityResult(False, VAULT_EMPTY, "Vault has no funds to lock")

        return EligibilityResult(True)

    def can_unlock_vault(
        self,
        vault: WealthVault,
        now: Optional[datetime] = None,
    ) -> EligibilityResult:
        """Check if vault can be unlocked (scheduled or break-early)."""
        if vault is None:
            return EligibilityResult(False, VAULT_NOT_UNLOCKABLE, "Vault not found")

        if vault.lock_status not in (VAULT_LOCKED, VAULT_UNLOCKABLE):
            return EligibilityResult(False, VAULT_NOT_UNLOCKABLE, f"Cannot unlock from status {vault.lock_status}")

        if vault.lock_status == VAULT_UNLOCKABLE:
            return EligibilityResult(True)

        now = now or datetime.now(timezone.utc)
        if vault.unlock_date > now:
            return EligibilityResult(False, UNLOCK_DATE_NOT_REACHED, "Unlock date not yet reached")

        if vault.current_amount <= 0:
            return EligibilityResult(False, VAULT_EMPTY, "Vault has no funds to unlock")

        return EligibilityResult(True)

    def can_break_vault(
        self,
        vault: WealthVault,
    ) -> EligibilityResult:
        """Check if vault can be broken early."""
        if vault is None:
            return EligibilityResult(False, BREAK_EARLY_NOT_ALLOWED, "Vault not found")

        if not vault.break_early_allowed:
            return EligibilityResult(False, BREAK_EARLY_NOT_ALLOWED, "Early break not allowed for this vault")

        if vault.lock_status != VAULT_LOCKED:
            return EligibilityResult(False, VAULT_NOT_LOCKED, f"Vault must be locked to break; current: {vault.lock_status}")

        if not self.rules.allow_break_early:
            return EligibilityResult(False, BREAK_EARLY_NOT_ALLOWED, "Product rules prohibit break early")

        if vault.current_amount <= 0:
            return EligibilityResult(False, VAULT_EMPTY, "Vault has no funds")

        return EligibilityResult(True)

    def can_payout_vault(
        self,
        vault: WealthVault,
        account: WealthAccount,
        amount: float,
        destination_type: str = "to_available",
        destination: Optional[Any] = None,
    ) -> EligibilityResult:
        """Check if payout can be initiated."""
        if vault is None:
            return EligibilityResult(False, VAULT_NOT_PAYOUT_ELIGIBLE, "Vault not found")

        if vault.lock_status not in (VAULT_UNLOCKED, VAULT_UNLOCKABLE):
            return EligibilityResult(False, VAULT_NOT_PAYOUT_ELIGIBLE, f"Vault must be unlocked; current: {vault.lock_status}")

        if amount <= 0:
            return EligibilityResult(False, ZERO_OR_NEGATIVE_AMOUNT, "Amount must be positive")

        # When unlockable: funds still in vault.current_amount. When unlocked: funds in account.available_balance
        if vault.lock_status == VAULT_UNLOCKABLE:
            available = vault.current_amount
        else:
            available = account.available_balance
        if available < amount:
            return EligibilityResult(False, INSUFFICIENT_AMOUNT, "Insufficient amount for payout")

        if destination_type not in ("to_available", "bank_account", "external"):
            return EligibilityResult(False, PAYOUT_DESTINATION_INVALID, f"Invalid destination: {destination_type}")

        if destination is not None and getattr(destination, "active", 1) != 1:
            return EligibilityResult(False, PAYOUT_DESTINATION_INVALID, "Payout destination is inactive")

        return EligibilityResult(True)
