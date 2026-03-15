"""
Money Vault Rules Engine — deterministic, auditable business logic.
"""
from app.services.vault_rules.reason_codes import *  # noqa: F401, F403
from app.services.vault_rules.product_rules import VaultProductRules, DEFAULT_PRODUCT_RULES
from app.services.vault_rules.state_machines import (
    MoneyVaultStateMachine,
    VaultTransactionStateMachine,
    VAULT_DRAFT,
    VAULT_ACTIVE,
    VAULT_LOCKED,
    VAULT_UNLOCKABLE,
    VAULT_UNLOCKED,
    VAULT_WITHDRAWN,
    VAULT_BROKEN,
    VAULT_CANCELED,
    TX_PENDING,
    TX_PROCESSING,
    TX_POSTED,
    TX_FAILED,
    TX_CANCELED,
    TX_REVERSED,
    TX_REQUIRES_ACTION,
)
from app.services.vault_rules.eligibility import VaultEligibilityService, EligibilityResult
from app.services.vault_rules.penalty import VaultPenaltyService, BreakPenaltyResult
from app.services.vault_rules.ledger_service import LedgerService
from app.services.vault_rules.rules_engine import MoneyVaultRulesEngine, RuleResult, get_rules_engine

__all__ = [
    "VaultProductRules",
    "DEFAULT_PRODUCT_RULES",
    "MoneyVaultStateMachine",
    "VaultTransactionStateMachine",
    "VaultEligibilityService",
    "VaultPenaltyService",
    "LedgerService",
    "MoneyVaultRulesEngine",
    "RuleResult",
    "EligibilityResult",
    "BreakPenaltyResult",
    "get_rules_engine",
    "VAULT_DRAFT",
    "VAULT_ACTIVE",
    "VAULT_LOCKED",
    "VAULT_UNLOCKABLE",
    "VAULT_UNLOCKED",
    "VAULT_WITHDRAWN",
    "VAULT_BROKEN",
    "VAULT_CANCELED",
    "TX_PENDING",
    "TX_PROCESSING",
    "TX_POSTED",
    "TX_FAILED",
    "TX_CANCELED",
    "TX_REVERSED",
    "TX_REQUIRES_ACTION",
]
