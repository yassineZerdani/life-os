"""
Stripe webhook handling — signature verification, event dispatch.
"""
import logging
from typing import Any, Optional

import stripe
from sqlalchemy.orm import Session

from app.config import settings
from app.models.payment_provider import PaymentProviderWebhookEvent

logger = logging.getLogger(__name__)


def verify_webhook_signature(payload: bytes, signature: str) -> Optional[dict]:
    """
    Verify Stripe webhook signature and return event.
    Returns None if verification fails.
    """
    if not settings.stripe_webhook_secret:
        logger.warning("STRIPE_WEBHOOK_SECRET not set — webhook verification disabled")
        return None
    try:
        event = stripe.Webhook.construct_event(
            payload, signature, settings.stripe_webhook_secret,
        )
        return event
    except ValueError as e:
        logger.warning("Stripe webhook invalid payload: %s", str(e))
        return None
    except stripe.SignatureVerificationError as e:
        logger.warning("Stripe webhook signature verification failed: %s", str(e))
        return None


def is_duplicate_event(db: Session, provider_event_id: str) -> bool:
    """Check if we've already processed this event."""
    return db.query(PaymentProviderWebhookEvent).filter(
        PaymentProviderWebhookEvent.provider_event_id == provider_event_id,
    ).first() is not None


def store_webhook_event(db: Session, provider_event_id: str, event_type: str) -> PaymentProviderWebhookEvent:
    """Store webhook event to avoid duplicate processing."""
    ev = PaymentProviderWebhookEvent(
        provider="stripe",
        provider_event_id=provider_event_id,
        event_type=event_type,
        processed=0,
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev


def mark_event_processed(db: Session, ev: PaymentProviderWebhookEvent) -> None:
    ev.processed = 1
    db.commit()


def dispatch_webhook_event(db: Session, event: dict) -> None:
    """
    Dispatch webhook event to handlers.
    Handles: setup_intent.succeeded, setup_intent.setup_failed,
             payment_intent.succeeded, payment_intent.payment_failed
    """
    event_id = event.get("id")
    event_type = event.get("type", "")

    if is_duplicate_event(db, event_id):
        logger.info("Skipping duplicate webhook event: %s", event_id)
        return

    ev = store_webhook_event(db, event_id, event_type)

    try:
        if event_type == "setup_intent.succeeded":
            _handle_setup_intent_succeeded(db, event)
        elif event_type == "setup_intent.setup_failed":
            _handle_setup_intent_failed(db, event)
        elif event_type == "payment_intent.succeeded":
            _handle_payment_intent_succeeded(db, event)
        elif event_type == "payment_intent.payment_failed":
            _handle_payment_intent_failed(db, event)
        else:
            logger.debug("Unhandled webhook event type: %s", event_type)
    finally:
        mark_event_processed(db, ev)


def _handle_setup_intent_succeeded(db: Session, event: dict) -> None:
    """SetupIntent succeeded — payment method attached."""
    data = event.get("data", {}).get("object", {})
    logger.info("SetupIntent succeeded: %s", data.get("id"))


def _handle_setup_intent_failed(db: Session, event: dict) -> None:
    """SetupIntent failed."""
    data = event.get("data", {}).get("object", {})
    logger.info("SetupIntent failed: %s", data.get("id"))


def _handle_payment_intent_succeeded(db: Session, event: dict) -> None:
    """PaymentIntent succeeded — funds received."""
    data = event.get("data", {}).get("object", {})
    logger.info("PaymentIntent succeeded: %s", data.get("id"))


def _handle_payment_intent_failed(db: Session, event: dict) -> None:
    """PaymentIntent failed."""
    data = event.get("data", {}).get("object", {})
    logger.info("PaymentIntent failed: %s", data.get("id"))
