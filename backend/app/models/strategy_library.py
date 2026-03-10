"""
Strategy Library and Protocol Engine models.
Evidence-based strategies organized by domain, category, and method modules.
"""
from sqlalchemy import Column, String, Float, DateTime, Text, Boolean, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class StrategyLibraryItem(Base):
    """Library of evidence-based strategies per domain."""
    __tablename__ = "strategy_library_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    domain_key = Column(String(50), nullable=False, index=True)
    module_key = Column(String(50), nullable=True, index=True)  # big_five, cbt, dbt, etc.
    name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)  # foundational, targeted, exploratory
    evidence_level = Column(String(30), nullable=False)  # high, moderate, emerging, reflective
    impact_level = Column(String(20), nullable=False)  # high, medium, low
    difficulty_level = Column(String(20), nullable=False)  # easy, medium, hard
    description = Column(Text, nullable=True)
    when_to_use = Column(Text, nullable=True)
    contraindications = Column(Text, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    protocols = relationship("StrategyProtocol", back_populates="strategy", cascade="all, delete-orphan")


class StrategyProtocol(Base):
    """Concrete protocol implementing a strategy (cadence, duration, steps)."""
    __tablename__ = "strategy_protocols"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    strategy_id = Column(UUID(as_uuid=True), ForeignKey("strategy_library_items.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    cadence = Column(String(50), nullable=False)  # daily, weekly, etc.
    duration_days = Column(Integer, nullable=True)
    instructions_json = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    strategy = relationship("StrategyLibraryItem", back_populates="protocols")
    steps = relationship("ProtocolStep", back_populates="protocol", cascade="all, delete-orphan", order_by="ProtocolStep.order_index")
    user_active = relationship("UserActiveProtocol", back_populates="protocol", cascade="all, delete-orphan")


class ProtocolStep(Base):
    """Step within a protocol."""
    __tablename__ = "protocol_steps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    protocol_id = Column(UUID(as_uuid=True), ForeignKey("strategy_protocols.id", ondelete="CASCADE"), nullable=False)
    order_index = Column(Integer, nullable=False, default=0)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    frequency = Column(String(100), nullable=True)
    target_metric_key = Column(String(100), nullable=True)
    xp_reward = Column(Float, default=0)

    protocol = relationship("StrategyProtocol", back_populates="steps")


class UserActiveProtocol(Base):
    """User's active protocol instance."""
    __tablename__ = "user_active_protocols"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    protocol_id = Column(UUID(as_uuid=True), ForeignKey("strategy_protocols.id", ondelete="CASCADE"), nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    active = Column(Boolean, default=True)
    adherence_score = Column(Float, default=0)
    effectiveness_score = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

    protocol = relationship("StrategyProtocol", back_populates="user_active")
    checkins = relationship("ProtocolCheckin", back_populates="user_active_protocol", cascade="all, delete-orphan")


class ProtocolCheckin(Base):
    """Check-in record for protocol adherence."""
    __tablename__ = "protocol_checkins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_active_protocol_id = Column(UUID(as_uuid=True), ForeignKey("user_active_protocols.id", ondelete="CASCADE"), nullable=False)
    checked_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_steps_json = Column(JSONB, nullable=True)
    adherence_value = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

    user_active_protocol = relationship("UserActiveProtocol", back_populates="checkins")
