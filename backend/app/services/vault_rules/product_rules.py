"""
Configurable product rules for Money Vault.
Easy to modify for different product configurations.
"""
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class VaultProductRules:
    """Configurable rules for vault behavior. Modify for product changes."""

    # Amount limits
    min_vault_amount: float = 0.01
    max_vault_amount: float = 1_000_000.0
    min_funding_amount: float = 0.01
    max_funding_amount: float = 100_000.0

    # Unlock date constraints (days from now)
    min_unlock_days: int = 1
    max_unlock_days: int = 3650  # ~10 years

    # Break early
    allow_break_early: bool = True
    default_break_penalty_type: Optional[str] = None
    default_break_penalty_value: Optional[float] = None

    # Funding
    allow_credit_card_funding: bool = False
    allow_partial_funding: bool = True
    allow_multiple_funding_events: bool = True

    # Lock behavior
    lock_immediately_on_funding: bool = False
    lock_manually_after_funding: bool = True
    partial_lock_allowed: bool = True

    # Unlock
    auto_unlock_enabled_default: bool = True

    # Real vault requirements
    real_vault_requires_kyc: bool = True
    real_vault_requires_verified_source: bool = True

    # Funding source by vault type
    soft_vault_allowed_sources: tuple[str, ...] = ("available_balance", "bank_transfer", "debit_card")
    real_vault_allowed_sources: tuple[str, ...] = ("bank_transfer", "debit_card")


# Default product rules — single source of truth
DEFAULT_PRODUCT_RULES = VaultProductRules()
