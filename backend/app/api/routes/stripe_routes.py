"""
Stripe API — health, customers, setup intents, webhooks.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.config import settings
from app.integrations.stripe.client import validate_stripe_config
from app.integrations.stripe.service import get_stripe_service, StripeServiceError
from app.integrations.stripe.webhooks import (
    verify_webhook_signature,
    dispatch_webhook_event,
)
from app.models import User
from app.models.payment_provider import (
    PaymentProviderCustomer,
    PaymentProviderWebhookEvent,
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/health")
def stripe_health():
    """
    Stripe health check.
    Confirms: configured, test mode, webhook secret present/missing.
    """
    configured = settings.stripe_configured()
    valid, config_errors = validate_stripe_config()
    return {
        "stripe_configured": configured,
        "config_valid": valid,
        "config_errors": config_errors,
        "test_mode": settings.stripe_test_mode() if configured else None,
        "webhook_secret_present": bool(settings.stripe_webhook_secret),
    }


@router.post("/customers")
def create_stripe_customer(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create Stripe customer for user."""
    if not settings.stripe_configured():
        raise HTTPException(status_code=503, detail="Stripe is not configured")
    existing = db.query(PaymentProviderCustomer).filter(
        PaymentProviderCustomer.user_id == user.id,
        PaymentProviderCustomer.provider == "stripe",
    ).first()
    if existing:
        return {"customer_id": existing.provider_customer_id, "already_exists": True}
    try:
        svc = get_stripe_service()
        email = user.email or f"user_{user.id}@lifeos.local"
        result = svc.create_customer(user.id, email)
        rec = PaymentProviderCustomer(
            user_id=user.id,
            provider="stripe",
            provider_customer_id=result.customer_id,
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)
        return {"customer_id": result.customer_id, "already_exists": False}
    except StripeServiceError:
        raise HTTPException(status_code=502, detail="Failed to create customer")


@router.post("/setup-intent")
def create_setup_intent(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create SetupIntent for adding payment method."""
    if not settings.stripe_configured():
        raise HTTPException(status_code=503, detail="Stripe is not configured")
    customer = db.query(PaymentProviderCustomer).filter(
        PaymentProviderCustomer.user_id == user.id,
        PaymentProviderCustomer.provider == "stripe",
    ).first()
    if not customer:
        raise HTTPException(status_code=400, detail="Create customer first")
    try:
        svc = get_stripe_service()
        meta = {"user_id": str(user.id)}
        result = svc.create_setup_intent(customer.provider_customer_id, metadata=meta)
        return {"client_secret": result.client_secret, "intent_id": result.intent_id}
    except StripeServiceError:
        raise HTTPException(status_code=502, detail="Failed to create setup intent")


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Stripe webhook endpoint.
    Requires raw body for signature verification.
    """
    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")
    event = verify_webhook_signature(payload, signature)
    if event is None:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
    dispatch_webhook_event(db, event)
    return {"received": True}


@router.get("/webhook-events")
def list_webhook_events(
    limit: int = 20,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List recent webhook events (for debugging/settings UI)."""
    events = (
        db.query(PaymentProviderWebhookEvent)
        .filter(PaymentProviderWebhookEvent.provider == "stripe")
        .order_by(PaymentProviderWebhookEvent.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": str(ev.id),
            "event_id": ev.provider_event_id,
            "event_type": ev.event_type,
            "processed": bool(ev.processed),
            "created_at": ev.created_at.isoformat() if ev.created_at else None,
        }
        for ev in events
    ]
