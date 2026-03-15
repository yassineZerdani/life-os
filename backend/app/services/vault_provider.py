"""
Vault Provider Abstraction — interface for soft (mock) and real partner-backed vaults.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional
from uuid import UUID


@dataclass
class ProviderBalance:
    available: float
    locked: float
    pending: float
    currency: str


@dataclass
class ProviderTransactionResult:
    success: bool
    reference: Optional[str] = None
    status: str = "posted"
    error_message: Optional[str] = None


class VaultProviderAdapter(ABC):
    """Abstract interface for vault money movement. Implement for mock, Stripe, Dwolla, etc."""

    @abstractmethod
    def create_customer_account(self, user_id: int, currency: str) -> tuple[Optional[str], Optional[str]]:
        """Create customer account at provider. Returns (provider_account_id, error)."""
        pass

    @abstractmethod
    def attach_funding_source(
        self,
        account_id: str,
        source_type: str,
        token_or_reference: str,
        label: Optional[str] = None,
    ) -> tuple[Optional[str], Optional[str]]:
        """Attach funding source. Returns (provider_source_id, error)."""
        pass

    @abstractmethod
    def initiate_funding(
        self,
        account_id: str,
        source_id: str,
        amount: float,
        currency: str,
    ) -> ProviderTransactionResult:
        """Initiate funding from source to account. May be async."""
        pass

    @abstractmethod
    def move_to_locked_balance(
        self,
        account_id: str,
        amount: float,
        currency: str,
        reference: str,
    ) -> ProviderTransactionResult:
        """Move available -> locked (for real vaults). Soft vault: no-op or ledger-only."""
        pass

    @abstractmethod
    def release_locked_balance(
        self,
        account_id: str,
        amount: float,
        currency: str,
        reference: str,
    ) -> ProviderTransactionResult:
        """Release locked -> available (or to payout)."""
        pass

    @abstractmethod
    def create_payout(
        self,
        account_id: str,
        destination_id: str,
        amount: float,
        currency: str,
        reference: str,
    ) -> ProviderTransactionResult:
        """Send funds to external destination."""
        pass

    @abstractmethod
    def get_balance(self, account_id: str) -> Optional[ProviderBalance]:
        """Get current balance from provider."""
        pass

    @abstractmethod
    def get_transaction_status(self, reference: str) -> Optional[str]:
        """Get status of async transaction: pending, posted, failed."""
        pass


class MockVaultProviderAdapter(VaultProviderAdapter):
    """In-memory mock — all operations succeed immediately. For soft vault MVP."""

    def create_customer_account(self, user_id: int, currency: str) -> tuple[Optional[str], Optional[str]]:
        return (f"mock_acct_{user_id}", None)

    def attach_funding_source(
        self,
        account_id: str,
        source_type: str,
        token_or_reference: str,
        label: Optional[str] = None,
    ) -> tuple[Optional[str], Optional[str]]:
        return (f"mock_src_{account_id}_{source_type}", None)

    def initiate_funding(
        self,
        account_id: str,
        source_id: str,
        amount: float,
        currency: str,
    ) -> ProviderTransactionResult:
        return ProviderTransactionResult(success=True, reference=f"mock_fund_{account_id}", status="posted")

    def move_to_locked_balance(
        self,
        account_id: str,
        amount: float,
        currency: str,
        reference: str,
    ) -> ProviderTransactionResult:
        return ProviderTransactionResult(success=True, reference=reference, status="posted")

    def release_locked_balance(
        self,
        account_id: str,
        amount: float,
        currency: str,
        reference: str,
    ) -> ProviderTransactionResult:
        return ProviderTransactionResult(success=True, reference=reference, status="posted")

    def create_payout(
        self,
        account_id: str,
        destination_id: str,
        amount: float,
        currency: str,
        reference: str,
    ) -> ProviderTransactionResult:
        return ProviderTransactionResult(success=True, reference=reference, status="posted")

    def get_balance(self, account_id: str) -> Optional[ProviderBalance]:
        return None  # Mock doesn't track; app ledger is source of truth

    def get_transaction_status(self, reference: str) -> Optional[str]:
        return "posted"
