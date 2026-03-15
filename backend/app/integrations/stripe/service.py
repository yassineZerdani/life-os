"""
Stripe service — customer, setup intent, payment intent.
Centralized error handling.
"""
import logging
from typing import Optional

from app.config import settings
from app.integrations.funding_provider import (
    FundingProviderAdapter,
    CustomerResult,
    SetupIntentResult,
    PaymentIntentResult,
)
from app.integrations.stripe.client import get_stripe_client

logger = logging.getLogger(__name__)


class StripeServiceError(Exception):
    """Stripe operation failed."""
    pass


class StripeFundingProviderAdapter(FundingProviderAdapter):
    """Stripe implementation of FundingProviderAdapter."""
    provider_name = "stripe"

    def create_customer(self, user_id: int, email: str) -> CustomerResult:
        stripe_client = get_stripe_client()
        if not stripe_client:
            raise StripeServiceError("Stripe is not configured")
        try:
            customer = stripe_client.Customer.create(
                email=email,
                metadata={"user_id": str(user_id)},
            )
            return CustomerResult(customer_id=customer.id)
        except stripe.StripeError as e:
            logger.error("Stripe create_customer failed: %s", str(e))
            raise StripeServiceError("Failed to create customer") from e

    def create_setup_intent(self, customer_id: str, metadata: Optional[dict] = None) -> SetupIntentResult:
        stripe_client = get_stripe_client()
        if not stripe_client:
            raise StripeServiceError("Stripe is not configured")
        try:
            intent = stripe_client.SetupIntent.create(
                customer=customer_id,
                payment_method_types=["card", "us_bank_account"],
                metadata=metadata or {},
            )
            return SetupIntentResult(client_secret=intent.client_secret, intent_id=intent.id)
        except stripe.StripeError as e:
            logger.error("Stripe create_setup_intent failed: %s", str(e))
            raise StripeServiceError("Failed to create setup intent") from e

    def attach_payment_method(self, customer_id: str, payment_method_id: str) -> Optional[str]:
        stripe_client = get_stripe_client()
        if not stripe_client:
            raise StripeServiceError("Stripe is not configured")
        try:
            stripe_client.PaymentMethod.attach(payment_method_id, customer=customer_id)
            return payment_method_id
        except stripe.StripeError as e:
            logger.error("Stripe attach_payment_method failed: %s", str(e))
            raise StripeServiceError("Failed to attach payment method") from e

    def create_payment_intent(
        self,
        customer_id: str,
        amount: float,
        currency: str,
        payment_method_id: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> PaymentIntentResult:
        stripe_client = get_stripe_client()
        if not stripe_client:
            raise StripeServiceError("Stripe is not configured")
        amount_cents = int(round(amount * 100))
        try:
            params = {
                "amount": amount_cents,
                "currency": currency.lower(),
                "customer": customer_id,
                "metadata": metadata or {},
            }
            if payment_method_id:
                params["payment_method"] = payment_method_id
                params["confirm"] = True
            intent = stripe_client.PaymentIntent.create(**params)
            return PaymentIntentResult(client_secret=intent.client_secret, intent_id=intent.id)
        except stripe.StripeError as e:
            logger.error("Stripe create_payment_intent failed: %s", str(e))
            raise StripeServiceError("Failed to create payment intent") from e


def get_stripe_service() -> StripeFundingProviderAdapter:
    return StripeFundingProviderAdapter()
