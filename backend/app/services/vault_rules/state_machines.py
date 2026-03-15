"""
State machines for Money Vault and VaultTransaction.
Deterministic, explicit transitions.
"""
from app.services.vault_rules.reason_codes import INVALID_STATE_TRANSITION, INVALID_TRANSACTION_STATE_TRANSITION

# Vault lock_status values
VAULT_DRAFT = "draft"
VAULT_ACTIVE = "active"
VAULT_LOCKED = "locked"
VAULT_UNLOCKABLE = "unlockable"
VAULT_UNLOCKED = "unlocked"
VAULT_WITHDRAWN = "withdrawn"
VAULT_BROKEN = "broken"
VAULT_CANCELED = "canceled"

VAULT_STATES = frozenset({
    VAULT_DRAFT, VAULT_ACTIVE, VAULT_LOCKED, VAULT_UNLOCKABLE,
    VAULT_UNLOCKED, VAULT_WITHDRAWN, VAULT_BROKEN, VAULT_CANCELED,
})

# Valid vault transitions: from_state -> set of allowed to_states
VAULT_TRANSITIONS = {
    VAULT_DRAFT: {VAULT_ACTIVE, VAULT_CANCELED},
    VAULT_ACTIVE: {VAULT_LOCKED, VAULT_BROKEN, VAULT_CANCELED},
    VAULT_LOCKED: {VAULT_UNLOCKABLE, VAULT_BROKEN},
    VAULT_UNLOCKABLE: {VAULT_UNLOCKED},
    VAULT_UNLOCKED: {VAULT_WITHDRAWN},
    VAULT_WITHDRAWN: set(),
    VAULT_BROKEN: set(),
    VAULT_CANCELED: set(),
}

# Transaction status values
TX_PENDING = "pending"
TX_PROCESSING = "processing"
TX_POSTED = "posted"
TX_FAILED = "failed"
TX_CANCELED = "canceled"
TX_REVERSED = "reversed"
TX_REQUIRES_ACTION = "requires_action"

TX_STATES = frozenset({
    TX_PENDING, TX_PROCESSING, TX_POSTED, TX_FAILED,
    TX_CANCELED, TX_REVERSED, TX_REQUIRES_ACTION,
})

# Valid transaction transitions
TX_TRANSITIONS = {
    TX_PENDING: {TX_PROCESSING, TX_POSTED, TX_FAILED, TX_CANCELED},
    TX_PROCESSING: {TX_POSTED, TX_FAILED, TX_REQUIRES_ACTION},
    TX_POSTED: {TX_REVERSED},
    TX_FAILED: set(),
    TX_CANCELED: set(),
    TX_REVERSED: set(),
    TX_REQUIRES_ACTION: {TX_POSTED, TX_FAILED, TX_CANCELED},
}


class MoneyVaultStateMachine:
    """Formal state machine for WealthVault.lock_status."""

    @staticmethod
    def can_transition(from_state: str, to_state: str, break_early_allowed: bool = False) -> tuple[bool, str | None]:
        """
        Check if vault can transition from from_state to to_state.
        Returns (allowed, reason_code).
        """
        if from_state not in VAULT_STATES:
            return False, INVALID_STATE_TRANSITION
        if to_state not in VAULT_STATES:
            return False, INVALID_STATE_TRANSITION

        allowed = VAULT_TRANSITIONS.get(from_state, set())
        if to_state not in allowed:
            return False, INVALID_STATE_TRANSITION

        # Special rule: locked -> broken only if break_early_allowed
        if from_state == VAULT_LOCKED and to_state == VAULT_BROKEN:
            if not break_early_allowed:
                return False, INVALID_STATE_TRANSITION

        return True, None

    @staticmethod
    def transition(vault, to_state: str) -> tuple[bool, str | None]:
        """Check and return whether transition is valid. Does not mutate."""
        return MoneyVaultStateMachine.can_transition(
            vault.lock_status,
            to_state,
            break_early_allowed=bool(vault.break_early_allowed),
        )


class VaultTransactionStateMachine:
    """Formal state machine for VaultTransaction.status."""

    @staticmethod
    def can_transition(from_status: str, to_status: str) -> tuple[bool, str | None]:
        """Check if transaction can transition. Returns (allowed, reason_code)."""
        if from_status not in TX_STATES:
            return False, INVALID_TRANSACTION_STATE_TRANSITION
        if to_status not in TX_STATES:
            return False, INVALID_TRANSACTION_STATE_TRANSITION

        allowed = TX_TRANSITIONS.get(from_status, set())
        if to_status not in allowed:
            return False, INVALID_TRANSACTION_STATE_TRANSITION

        return True, None
