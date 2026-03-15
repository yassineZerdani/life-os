"""
Funding provider abstraction — Stripe now, Treasury-ready later.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Optional


@dataclass
class SetupIntentResult:
    client_secret: str
    intent_id: str


@dataclass
class PaymentIntentResult:
    client_secret: str
    intent_id: str


@dataclass
class CustomerResult:
    customer_id: str


class FundingProviderAdapter(ABC):
    """Abstract interface for funding providers."""
    provider_name: str = "abstract"

    @abstractmethod
    def create_customer(self, user_id: int, email: str) -> CustomerResult:
        pass

    @abstractmethod
    def create_setup_intent(self, customer_id: str, metadata: Optional[dict] = None) -> SetupIntentResult:
        pass

    @abstractmethod
    def attach_payment_method(self, customer_id: str, payment_method_id: str) -> Optional[str]:
        pass

    @abstractmethod
    def create_payment_intent(
        self,
        customer_id: str,
        amount: float,
        currency: str,
        payment_method_id: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> PaymentIntentResult:
        pass

    @abstractmethod
    def handle_webhook(self, payload: bytes, signature: str) -> dict[str, Any]:
        pass
