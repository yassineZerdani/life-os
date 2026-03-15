"""
Stripe client — initialized from env vars only.
Never log secret keys.
"""
import logging
from typing import Optional

import stripe
from app.config import settings

logger = logging.getLogger(__name__)

_stripe_initialized = False


def get_stripe_client() -> Optional[stripe.api_resources]:
    """Return Stripe API if configured. Never expose secret key."""
    global _stripe_initialized
    if not settings.stripe_configured():
        return None
    if not _stripe_initialized:
        stripe.api_key = settings.stripe_secret_key
        _stripe_initialized = True
    return stripe


def validate_stripe_config() -> tuple[bool, list[str]]:
    """
    Validate Stripe config on startup.
    Returns (valid, list of warnings/errors).
    """
    errors = []
    if not settings.stripe_secret_key:
        errors.append("STRIPE_SECRET_KEY not set")
    if not settings.stripe_publishable_key:
        errors.append("STRIPE_PUBLISHABLE_KEY not set")
    if settings.stripe_secret_key and not settings.stripe_secret_key.startswith("sk_"):
        errors.append("STRIPE_SECRET_KEY appears invalid (should start with sk_test_ or sk_live_)")
    if settings.stripe_webhook_secret and not settings.stripe_webhook_secret.startswith("whsec_"):
        errors.append("STRIPE_WEBHOOK_SECRET appears invalid (should start with whsec_)")
    return len(errors) == 0, errors
