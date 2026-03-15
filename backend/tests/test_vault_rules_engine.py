"""
Tests for Money Vault Rules Engine.
Covers state machines, eligibility, penalties, ledger logic.
"""
from datetime import datetime, timezone, timedelta
from unittest.mock import MagicMock
import pytest

from app.services.vault_rules import (
    MoneyVaultStateMachine,
    VaultTransactionStateMachine,
    VaultEligibilityService,
    VaultPenaltyService,
    MoneyVaultRulesEngine,
    VaultProductRules,
    get_rules_engine,
    VAULT_DRAFT,
    VAULT_ACTIVE,
    VAULT_LOCKED,
    VAULT_UNLOCKABLE,
    VAULT_UNLOCKED,
    VAULT_WITHDRAWN,
    VAULT_BROKEN,
    VAULT_CANCELED,
    TX_PENDING,
    TX_POSTED,
    TX_FAILED,
    TX_REVERSED,
)


# --- Mock objects ---
def make_vault(
    lock_status: str = "draft",
    current_amount: float = 0,
    unlock_date: datetime | None = None,
    break_early_allowed: bool = False,
    break_early_penalty_type: str | None = None,
    break_early_penalty_value: float | None = None,
    vault_type: str = "soft",
    user_id: int = 1,
):
    v = MagicMock()
    v.lock_status = lock_status
    v.current_amount = current_amount
    v.unlock_date = unlock_date or (datetime.now(timezone.utc) + timedelta(days=30))
    v.break_early_allowed = 1 if break_early_allowed else 0
    v.break_early_penalty_type = break_early_penalty_type
    v.break_early_penalty_value = break_early_penalty_value
    v.vault_type = vault_type
    v.user_id = user_id
    return v


def make_account(available: float = 100, locked: float = 0, pending: float = 0):
    a = MagicMock()
    a.available_balance = available
    a.locked_balance = locked
    a.pending_balance = pending
    return a


def make_tx(status: str = "posted"):
    t = MagicMock()
    t.status = status
    return t


# --- State machine tests ---
class TestMoneyVaultStateMachine:
    def test_valid_transitions(self):
        assert MoneyVaultStateMachine.can_transition(VAULT_DRAFT, VAULT_ACTIVE)[0] is True
        assert MoneyVaultStateMachine.can_transition(VAULT_DRAFT, VAULT_CANCELED)[0] is True
        assert MoneyVaultStateMachine.can_transition(VAULT_ACTIVE, VAULT_LOCKED)[0] is True
        assert MoneyVaultStateMachine.can_transition(VAULT_LOCKED, VAULT_UNLOCKABLE)[0] is True
        assert MoneyVaultStateMachine.can_transition(VAULT_UNLOCKABLE, VAULT_UNLOCKED)[0] is True
        assert MoneyVaultStateMachine.can_transition(VAULT_UNLOCKED, VAULT_WITHDRAWN)[0] is True

    def test_locked_to_broken_requires_break_early(self):
        ok, _ = MoneyVaultStateMachine.can_transition(VAULT_LOCKED, VAULT_BROKEN, break_early_allowed=False)
        assert ok is False
        ok, _ = MoneyVaultStateMachine.can_transition(VAULT_LOCKED, VAULT_BROKEN, break_early_allowed=True)
        assert ok is True

    def test_invalid_transitions(self):
        assert MoneyVaultStateMachine.can_transition(VAULT_DRAFT, VAULT_LOCKED)[0] is False
        assert MoneyVaultStateMachine.can_transition(VAULT_LOCKED, VAULT_DRAFT)[0] is False
        assert MoneyVaultStateMachine.can_transition(VAULT_UNLOCKED, VAULT_LOCKED)[0] is False
        assert MoneyVaultStateMachine.can_transition(VAULT_WITHDRAWN, VAULT_ACTIVE)[0] is False

    def test_terminal_states_no_outgoing(self):
        assert MoneyVaultStateMachine.can_transition(VAULT_WITHDRAWN, VAULT_ACTIVE)[0] is False
        assert MoneyVaultStateMachine.can_transition(VAULT_BROKEN, VAULT_LOCKED)[0] is False
        assert MoneyVaultStateMachine.can_transition(VAULT_CANCELED, VAULT_ACTIVE)[0] is False


class TestVaultTransactionStateMachine:
    def test_valid_transitions(self):
        assert VaultTransactionStateMachine.can_transition(TX_PENDING, TX_POSTED)[0] is True
        assert VaultTransactionStateMachine.can_transition(TX_PENDING, TX_FAILED)[0] is True
        assert VaultTransactionStateMachine.can_transition(TX_POSTED, TX_REVERSED)[0] is True

    def test_invalid_transitions(self):
        assert VaultTransactionStateMachine.can_transition(TX_POSTED, TX_PENDING)[0] is False
        assert VaultTransactionStateMachine.can_transition(TX_FAILED, TX_POSTED)[0] is False
        assert VaultTransactionStateMachine.can_transition(TX_REVERSED, TX_POSTED)[0] is False


# --- Eligibility tests ---
class TestVaultEligibilityService:
    def test_can_fund_success(self):
        svc = VaultEligibilityService()
        vault = make_vault(lock_status=VAULT_DRAFT, current_amount=0)
        acc = make_account(available=100)
        r = svc.can_fund_vault(vault, acc, 50)
        assert r.allowed is True

    def test_can_fund_insufficient_balance(self):
        svc = VaultEligibilityService()
        vault = make_vault(lock_status=VAULT_DRAFT)
        acc = make_account(available=10)
        r = svc.can_fund_vault(vault, acc, 50, source_type="available_balance")
        assert r.allowed is False
        assert r.reason_code == "insufficient_available_balance"

    def test_can_fund_closed_vault(self):
        svc = VaultEligibilityService()
        vault = make_vault(lock_status=VAULT_CANCELED)
        acc = make_account(available=100)
        r = svc.can_fund_vault(vault, acc, 50)
        assert r.allowed is False
        assert r.reason_code == "vault_closed_or_canceled"

    def test_can_fund_zero_amount(self):
        svc = VaultEligibilityService()
        vault = make_vault(lock_status=VAULT_DRAFT)
        acc = make_account(available=100)
        r = svc.can_fund_vault(vault, acc, 0)
        assert r.allowed is False
        assert r.reason_code == "zero_or_negative_amount"

    def test_can_lock_success(self):
        svc = VaultEligibilityService()
        vault = make_vault(lock_status=VAULT_ACTIVE, current_amount=50)
        r = svc.can_lock_vault(vault)
        assert r.allowed is True

    def test_can_lock_empty_vault(self):
        svc = VaultEligibilityService()
        vault = make_vault(lock_status=VAULT_ACTIVE, current_amount=0)
        r = svc.can_lock_vault(vault)
        assert r.allowed is False
        assert r.reason_code == "vault_empty"

    def test_can_unlock_date_reached(self):
        svc = VaultEligibilityService()
        vault = make_vault(lock_status=VAULT_LOCKED, current_amount=50)
        vault.unlock_date = datetime.now(timezone.utc) - timedelta(days=1)
        r = svc.can_unlock_vault(vault)
        assert r.allowed is True

    def test_can_unlock_date_not_reached(self):
        svc = VaultEligibilityService()
        vault = make_vault(lock_status=VAULT_LOCKED, current_amount=50)
        vault.unlock_date = datetime.now(timezone.utc) + timedelta(days=30)
        r = svc.can_unlock_vault(vault)
        assert r.allowed is False
        assert r.reason_code == "unlock_date_not_reached"

    def test_can_break_success(self):
        svc = VaultEligibilityService()
        vault = make_vault(lock_status=VAULT_LOCKED, current_amount=50, break_early_allowed=True)
        r = svc.can_break_vault(vault)
        assert r.allowed is True

    def test_can_break_not_allowed(self):
        svc = VaultEligibilityService()
        vault = make_vault(lock_status=VAULT_LOCKED, current_amount=50, break_early_allowed=False)
        r = svc.can_break_vault(vault)
        assert r.allowed is False
        assert r.reason_code == "break_early_not_allowed"

    def test_can_break_vault_not_locked(self):
        svc = VaultEligibilityService()
        vault = make_vault(lock_status=VAULT_ACTIVE, current_amount=50, break_early_allowed=True)
        r = svc.can_break_vault(vault)
        assert r.allowed is False
        assert r.reason_code == "vault_not_locked"

    def test_can_payout_unlockable(self):
        svc = VaultEligibilityService()
        vault = make_vault(lock_status=VAULT_UNLOCKABLE, current_amount=50)
        acc = make_account(available=0, locked=50)
        r = svc.can_payout_vault(vault, acc, 50, "to_available")
        assert r.allowed is True

    def test_can_payout_insufficient(self):
        svc = VaultEligibilityService()
        vault = make_vault(lock_status=VAULT_UNLOCKABLE, current_amount=50)
        acc = make_account(available=0, locked=50)
        r = svc.can_payout_vault(vault, acc, 100, "to_available")
        assert r.allowed is False
        assert r.reason_code == "insufficient_amount"


# --- Penalty tests ---
class TestVaultPenaltyService:
    def test_no_penalty(self):
        svc = VaultPenaltyService()
        vault = make_vault(break_early_penalty_type="none")
        r = svc.calculate_break_penalty(vault, 100)
        assert r.gross_amount == 100
        assert r.penalty_amount == 0
        assert r.net_unlockable_amount == 100

    def test_percentage_penalty(self):
        svc = VaultPenaltyService()
        vault = make_vault(break_early_penalty_type="percentage", break_early_penalty_value=10)
        r = svc.calculate_break_penalty(vault, 100)
        assert r.gross_amount == 100
        assert r.penalty_amount == 10
        assert r.net_unlockable_amount == 90

    def test_fixed_penalty(self):
        svc = VaultPenaltyService()
        vault = make_vault(break_early_penalty_type="fixed", break_early_penalty_value=5)
        r = svc.calculate_break_penalty(vault, 100)
        assert r.gross_amount == 100
        assert r.penalty_amount == 5
        assert r.net_unlockable_amount == 95

    def test_fixed_penalty_exceeds_amount(self):
        svc = VaultPenaltyService()
        vault = make_vault(break_early_penalty_type="fixed", break_early_penalty_value=150)
        r = svc.calculate_break_penalty(vault, 100)
        assert r.penalty_amount == 100  # min(150, 100)
        assert r.net_unlockable_amount == 0


# --- Rules engine integration ---
class TestMoneyVaultRulesEngine:
    def test_get_rules_engine_singleton(self):
        e1 = get_rules_engine()
        e2 = get_rules_engine()
        assert e1 is e2

    def test_validate_vault_transition(self):
        engine = get_rules_engine()
        vault = make_vault(lock_status=VAULT_DRAFT)
        r = engine.validate_vault_transition(vault, VAULT_ACTIVE)
        assert r.success is True
        r = engine.validate_vault_transition(vault, VAULT_LOCKED)
        assert r.success is False
        assert r.reason_code == "invalid_state_transition"

    def test_calculate_break_penalty_via_engine(self):
        engine = get_rules_engine()
        vault = make_vault(break_early_penalty_type="percentage", break_early_penalty_value=5)
        r = engine.calculate_break_penalty(vault, 200)
        assert r.penalty_amount == 10
        assert r.net_unlockable_amount == 190


# --- Product rules ---
class TestVaultProductRules:
    def test_default_rules(self):
        r = VaultProductRules()
        assert r.min_funding_amount > 0
        assert r.allow_break_early is True
        assert r.real_vault_requires_kyc is True

    def test_custom_rules(self):
        r = VaultProductRules(min_funding_amount=10, allow_break_early=False)
        assert r.min_funding_amount == 10
        assert r.allow_break_early is False
