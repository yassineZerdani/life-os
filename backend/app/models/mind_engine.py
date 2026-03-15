"""
Mind Engine: emotional states, triggers, thought patterns, behavior loops, regulation.
"""
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text,
    Date,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class EmotionalStateEntry(Base):
    """Single emotional state log: primary emotion, intensity, date."""
    __tablename__ = "mind_emotional_state_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    date = Column(Date, nullable=False, index=True)
    primary_emotion = Column(String(80), nullable=False, index=True)
    intensity = Column(Float, nullable=True)  # 0-10
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TriggerEntry(Base):
    """Trigger event with optional link to emotion and behavior."""
    __tablename__ = "mind_trigger_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    trigger_type = Column(String(80), nullable=False, index=True)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False, index=True)
    linked_emotion = Column(String(120), nullable=True)
    linked_behavior = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ThoughtPattern(Base):
    """Recurring thought pattern: title, category, frequency/severity."""
    __tablename__ = "mind_thought_patterns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(80), nullable=True, index=True)
    frequency_score = Column(Float, nullable=True)  # 0-10
    severity_score = Column(Float, nullable=True)  # 0-10
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class BehaviorLoop(Base):
    """Maladaptive or observed loop: trigger -> emotion -> behavior -> aftermath."""
    __tablename__ = "mind_behavior_loops"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(200), nullable=False, index=True)
    trigger_summary = Column(Text, nullable=True)
    emotional_sequence = Column(Text, nullable=True)
    behavioral_sequence = Column(Text, nullable=True)
    aftermath = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class RegulationToolUse(Base):
    """Log of using a regulation/coping tool and its effectiveness."""
    __tablename__ = "mind_regulation_tool_uses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    tool_name = Column(String(120), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    effectiveness_score = Column(Float, nullable=True)  # 0-10
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
