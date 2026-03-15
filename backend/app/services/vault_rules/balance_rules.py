"""
Balance bucket rules — strict movement between available, locked, pending.
Every movement must create matching ledger entries.
"""
from dataclasses import dataclass
from enum import Enum
from typing import Optional
from uuid import UUID


class BalanceBucket(str, Enum):
    AVAILABLE = "available"
    LOCKED = "locked"
    PENDING = "pending"


@dataclass
class BalanceMovement:
    """Describes a valid balance movement for ledger creation."""
    from_bucket: str
    to_bucket: str
    amount: float
    entry_type: str
    reference_type: str
    reference_id: str


# Valid balance movements and their ledger entry types
# Format: (operation, from_bucket, to_bucket) -> entry_type
BALANCE_MOVEMENTS = {
    # Funding initiated (external -> pending)
    ("funding_initiated", "external", "pending"): "funding",
    # Funding posted (pending -> available)
    ("funding_posted", "pending", "available"): "funding",
    # Funds locked (available -> locked)
    ("lock", "available", "locked"): "vault_fund",
    # Vault unlocked (locked -> available)
    ("unlock", "locked", "available"): "vault_unlock",
    # Vault broken (locked -> available, minus penalty)
    ("break_early", "locked", "available"): "break_early",
    ("break_penalty", "locked", "fee"): "fee",
    # Payout initiated (available -> pending)
    ("payout_initiated", "available", "pending"): "payout",
    # Payout completed (pending -> external)
    ("payout_completed", "pending", "external"): "payout",
    # Reversal
    ("reversal", "locked", "available"): "reversal",
}


def get_ledger_entries_for_movement(
    operation: str,
    amount: float,
    reference_type: str,
    reference_id: str,
    vault_id: Optional[UUID] = None,
) -> list[dict]:
    """
    Return ledger entry specs for a balance movement.
    Double-entry: debit from_bucket, credit to_bucket.
    """
    if operation == "lock":
        return [
            {"entry_type": "vault_fund", "balance_bucket": "available", "direction": "debit", "amount": amount},
            {"entry_type": "vault_fund", "balance_bucket": "locked", "direction": "credit", "amount": amount},
        ]
    if operation == "unlock":
        return [
            {"entry_type": "vault_unlock", "balance_bucket": "locked", "direction": "debit", "amount": amount},
            {"entry_type": "vault_unlock", "balance_bucket": "available", "direction": "credit", "amount": amount},
        ]
    if operation == "break_early":
        return [
            {"entry_type": "break_early", "balance_bucket": "locked", "direction": "debit", "amount": amount},
            {"entry_type": "break_early", "balance_bucket": "available", "direction": "credit", "amount": amount},
        ]
    if operation == "break_penalty":
        return [
            {"entry_type": "fee", "balance_bucket": "locked", "direction": "debit", "amount": amount},
        ]
    if operation == "funding_posted":
        return [
            {"entry_type": "funding", "balance_bucket": "pending", "direction": "debit", "amount": amount},
            {"entry_type": "funding", "balance_bucket": "available", "direction": "credit", "amount": amount},
        ]
    if operation == "funding_to_vault":
        return [
            {"entry_type": "vault_fund", "balance_bucket": "available", "direction": "debit", "amount": amount},
            {"entry_type": "vault_fund", "balance_bucket": "locked", "direction": "credit", "amount": amount},
        ]
    return []
