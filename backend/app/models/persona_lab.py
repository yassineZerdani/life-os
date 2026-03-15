"""
Persona Lab: identity profile, values, principles, narrative, persona aspects, drift signals.
"""
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text,
    Boolean,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class PersonaIdentityProfile(Base):
    """Extended identity profile for Persona Lab: current, ideal, public, private self."""
    __tablename__ = "persona_identity_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    current_self_summary = Column(Text, nullable=True)
    ideal_self_summary = Column(Text, nullable=True)
    public_self_summary = Column(Text, nullable=True)
    private_self_summary = Column(Text, nullable=True)
    values_summary = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PersonaValue(Base):
    """Stated value with name, description, priority."""
    __tablename__ = "persona_values"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    priority_score = Column(Float, nullable=True)  # 0-10
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PersonaPrinciple(Base):
    """Principle or rule the user lives by."""
    __tablename__ = "persona_principles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(300), nullable=False, index=True)
    description = Column(Text, nullable=True)
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PersonaNarrativeEntry(Base):
    """Narrative entry: who I was, am, becoming; defining moments; identity shifts."""
    __tablename__ = "persona_narrative_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(300), nullable=False, index=True)
    description = Column(Text, nullable=True)
    time_period = Column(String(200), nullable=True)
    type = Column(String(60), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PersonaAspect(Base):
    """Self-aspect: current, ideal, public, private, disciplined, wounded, aspirational."""
    __tablename__ = "persona_aspects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(120), nullable=False, index=True)
    description = Column(Text, nullable=True)
    strength_score = Column(Float, nullable=True)  # 0-10
    tension_score = Column(Float, nullable=True)  # 0-10
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class IdentityDriftSignal(Base):
    """Detected signal that behavior may be out of alignment with stated identity."""
    __tablename__ = "identity_drift_signals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    source = Column(String(120), nullable=False, index=True)
    description = Column(Text, nullable=False)
    severity = Column(String(40), nullable=False, default="medium", index=True)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
