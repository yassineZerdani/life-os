"""
Payment provider models — Stripe customer, funding sources, webhook events, transactions.
Local tracking for Stripe references and audit trail.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class PaymentProviderCustomer(Base):
    """Links user to Stripe customer."""
    __tablename__ = "payment_provider_customers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    provider = Column(String(50), nullable=False, default="stripe")
    provider_customer_id = Column(String(200), nullable=False, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PaymentProviderFundingSource(Base):
    """Stripe payment method / funding source."""
    __tablename__ = "payment_provider_funding_sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider_customer_id = Column(String(200), nullable=False, index=True)
    provider_payment_method_id = Column(String(200), nullable=False, unique=True, index=True)
    provider = Column(String(50), nullable=False, default="stripe")
    type = Column(String(50), nullable=False)  # card, us_bank_account, etc.
    brand = Column(String(50), nullable=True)
    last4 = Column(String(4), nullable=True)
    label = Column(String(200), nullable=False)
    active = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PaymentProviderWebhookEvent(Base):
    """Stripe webhook events — avoid duplicate processing."""
    __tablename__ = "payment_provider_webhook_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider = Column(String(50), nullable=False, default="stripe")
    provider_event_id = Column(String(200), nullable=False, unique=True, index=True)
    event_type = Column(String(100), nullable=False)
    processed = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PaymentProviderTransaction(Base):
    """External transaction references (Stripe PaymentIntent, SetupIntent)."""
    __tablename__ = "payment_provider_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider = Column(String(50), nullable=False, default="stripe")
    object_type = Column(String(50), nullable=False)  # payment_intent, setup_intent
    provider_intent_id = Column(String(200), nullable=False, unique=True, index=True)
    amount = Column(Float, nullable=True)
    currency = Column(String(10), nullable=True)
    status = Column(String(50), nullable=False)
    metadata_json = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
