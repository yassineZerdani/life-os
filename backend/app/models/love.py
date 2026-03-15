"""
Relationship Depth System: couple pulse, shared vision, conflict repair,
memories, and reconnection actions.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Date, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class LoveProfile(Base):
    """One per user: partner info, status, anniversary."""
    __tablename__ = "love_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    partner_name = Column(String(200), nullable=True)
    relationship_status = Column(String(60), nullable=False, default="active", index=True)  # active | long_distance | complicated | other
    anniversary_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class LovePulseEntry(Base):
    """Single pulse check: closeness, communication, trust, tension, support, future_alignment (0-10)."""
    __tablename__ = "love_pulse_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    closeness_score = Column(Float, nullable=True)
    communication_score = Column(Float, nullable=True)
    trust_score = Column(Float, nullable=True)
    tension_score = Column(Float, nullable=True)
    support_score = Column(Float, nullable=True)
    future_alignment_score = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class LoveMemory(Base):
    """Milestones, moments, trips, plans, promises."""
    __tablename__ = "love_memories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(300), nullable=False, index=True)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=True, index=True)
    category = Column(String(60), nullable=False, index=True)  # milestone | moment | trip | plan | promise | repair | other
    media_url = Column(String(2000), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ConflictEntry(Base):
    """Conflict + repair: trigger, feelings, what happened, repair status."""
    __tablename__ = "conflict_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    trigger = Column(String(500), nullable=True)
    what_i_felt = Column(Text, nullable=True)
    what_they_may_have_felt = Column(Text, nullable=True)
    what_happened = Column(Text, nullable=True)
    repair_needed = Column(Text, nullable=True)
    status = Column(String(40), nullable=False, default="reflecting", index=True)  # reflecting | accountability | empathy | repair | reconnected
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class SharedVisionItem(Base):
    """Shared goals, dreams, plans."""
    __tablename__ = "shared_vision_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(60), nullable=False, index=True)  # life | travel | home | family | career | values | other
    title = Column(String(300), nullable=False, index=True)
    description = Column(Text, nullable=True)
    target_date = Column(Date, nullable=True)
    status = Column(String(40), nullable=False, default="active", index=True)  # active | achieved | paused | dropped
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ReconnectAction(Base):
    """Intentional reconnection: date night, conversation, gesture."""
    __tablename__ = "reconnect_actions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(300), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(60), nullable=False, index=True)  # date | conversation | gesture | ritual | surprise | other
    due_date = Column(Date, nullable=True)
    completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
