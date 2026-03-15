"""
Social Capital Engine: contacts, interactions, opportunities, reciprocity, communities.
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


class Contact(Base):
    """Core contact: category, trust/warmth/opportunity scores, last contact."""
    __tablename__ = "network_contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(200), nullable=False, index=True)
    category = Column(
        String(60),
        nullable=False,
        index=True,
    )  # mentor | peer | collaborator | client | other
    company = Column(String(300), nullable=True)
    role = Column(String(200), nullable=True)
    notes = Column(Text, nullable=True)
    trust_score = Column(Float, nullable=True)  # 0-10
    warmth_score = Column(Float, nullable=True)  # 0-10
    opportunity_score = Column(Float, nullable=True)  # 0-10
    last_contact_at = Column(DateTime(timezone=True), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ContactInteraction(Base):
    """Single interaction with a contact: type, date, tone."""
    __tablename__ = "network_contact_interactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contact_id = Column(
        UUID(as_uuid=True),
        ForeignKey("network_contacts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    interaction_type = Column(String(60), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    tone = Column(String(60), nullable=True)  # warm | neutral | formal | tense
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ConnectionOpportunity(Base):
    """Opportunity linked to a contact: type, title, status, potential value."""
    __tablename__ = "network_connection_opportunities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contact_id = Column(
        UUID(as_uuid=True),
        ForeignKey("network_contacts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    opportunity_type = Column(String(60), nullable=False, index=True)
    title = Column(String(300), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(40), nullable=False, default="open", index=True)
    potential_value = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ReciprocityEntry(Base):
    """Support given/received with a contact: balance tracking."""
    __tablename__ = "network_reciprocity_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contact_id = Column(
        UUID(as_uuid=True),
        ForeignKey("network_contacts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    support_given = Column(Text, nullable=True)
    support_received = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    date = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Community(Base):
    """Community or group: name, type, relevance."""
    __tablename__ = "network_communities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(300), nullable=False, index=True)
    type = Column(String(60), nullable=False, index=True)
    description = Column(Text, nullable=True)
    relevance_score = Column(Float, nullable=True)  # 0-10
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
