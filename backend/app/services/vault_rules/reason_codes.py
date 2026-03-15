"""
Rule rejection reason codes — for audit, UX, and debugging.
Every rule rejection produces a clear reason code.
"""

# Funding
INSUFFICIENT_AVAILABLE_BALANCE = "insufficient_available_balance"
VAULT_NOT_FUNDABLE = "vault_not_fundable"
VAULT_CLOSED_OR_CANCELED = "vault_closed_or_canceled"
FUNDING_SOURCE_INACTIVE = "funding_source_inactive"
FUNDING_SOURCE_UNVERIFIED = "funding_source_unverified"
AMOUNT_INVALID = "amount_invalid"
AMOUNT_BELOW_MINIMUM = "amount_below_minimum"
AMOUNT_ABOVE_MAXIMUM = "amount_above_maximum"
CARD_FUNDING_NOT_ALLOWED = "card_funding_not_allowed"
REAL_VAULT_REQUIRES_VERIFIED_SOURCE = "real_vault_requires_verified_source"
KYC_REQUIRED = "kyc_required"
COMPLIANCE_HOLD = "compliance_hold"

# Locking
VAULT_NOT_LOCKABLE = "vault_not_lockable"
VAULT_EMPTY = "vault_empty"
UNLOCK_DATE_MISSING = "unlock_date_missing"
PROVIDER_LOCK_FAILED = "provider_lock_failed"
PARTIAL_LOCK_NOT_ALLOWED = "partial_lock_not_allowed"

# Unlocking
VAULT_NOT_UNLOCKABLE = "vault_not_unlockable"
UNLOCK_DATE_NOT_REACHED = "unlock_date_not_reached"
VAULT_ALREADY_UNLOCKED = "vault_already_unlocked"
PROVIDER_UNLOCK_FAILED = "provider_unlock_failed"
UNRESOLVED_PROVIDER_ISSUES = "unresolved_provider_issues"

# Break early
BREAK_EARLY_NOT_ALLOWED = "break_early_not_allowed"
VAULT_NOT_LOCKED = "vault_not_locked"
PRODUCT_RULES_PROHIBIT_BREAK = "product_rules_prohibit_break"

# Payout
VAULT_NOT_PAYOUT_ELIGIBLE = "vault_not_payout_eligible"
PAYOUT_DESTINATION_INVALID = "payout_destination_invalid"
PAYOUT_DESTINATION_UNVERIFIED = "payout_destination_unverified"
INSUFFICIENT_AMOUNT = "insufficient_amount"
PAYOUT_HOLD = "payout_hold"

# State transitions
INVALID_STATE_TRANSITION = "invalid_state_transition"
INVALID_TRANSACTION_STATE_TRANSITION = "invalid_transaction_state_transition"

# Ledger
LEDGER_ENTRY_REQUIRED = "ledger_entry_required"
BALANCE_MISMATCH = "balance_mismatch"
VAULT_RECONCILIATION_FAILED = "vault_reconciliation_failed"
ACCOUNT_RECONCILIATION_FAILED = "account_reconciliation_failed"

# General
VAULT_NOT_FOUND = "vault_not_found"
ACCOUNT_NOT_FOUND = "account_not_found"
DUPLICATE_OPERATION = "duplicate_operation"
ZERO_OR_NEGATIVE_AMOUNT = "zero_or_negative_amount"
