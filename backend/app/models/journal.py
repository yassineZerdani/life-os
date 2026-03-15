"""
Diary-first journal: daily entries, prompt responses, extracted signals,
suggested domain updates for user review.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    title = Column(String(500), nullable=True)
    raw_text = Column(Text, nullable=True)
    mood = Column(String(50), nullable=True)
    energy = Column(String(50), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    prompt_responses = relationship(
        "JournalPromptResponse",
        back_populates="journal_entry",
        cascade="all, delete-orphan",
    )
    extracted_signals = relationship(
        "ExtractedSignal",
        back_populates="journal_entry",
        cascade="all, delete-orphan",
    )
    suggested_updates = relationship(
        "SuggestedDomainUpdate",
        back_populates="journal_entry",
        cascade="all, delete-orphan",
    )


class JournalPromptResponse(Base):
    __tablename__ = "journal_prompt_responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    journal_entry_id = Column(
        UUID(as_uuid=True),
        ForeignKey("journal_entries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    prompt_key = Column(String(80), nullable=False, index=True)
    response_value = Column(Text, nullable=True)

    journal_entry = relationship("JournalEntry", back_populates="prompt_responses")


class ExtractedSignal(Base):
    __tablename__ = "extracted_signals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    journal_entry_id = Column(
        UUID(as_uuid=True),
        ForeignKey("journal_entries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    domain = Column(String(50), nullable=False, index=True)
    signal_type = Column(String(80), nullable=False)
    value_json = Column(JSONB, nullable=True)
    confidence = Column(Float, nullable=True)
    source_text = Column(Text, nullable=True)

    journal_entry = relationship("JournalEntry", back_populates="extracted_signals")


class SuggestedDomainUpdate(Base):
    __tablename__ = "suggested_domain_updates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    journal_entry_id = Column(
        UUID(as_uuid=True),
        ForeignKey("journal_entries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    domain = Column(String(50), nullable=False, index=True)
    update_type = Column(String(80), nullable=False)
    payload_json = Column(JSONB, nullable=True)
    confidence = Column(Float, nullable=True)
    status = Column(String(20), nullable=False, default="pending")

    journal_entry = relationship("JournalEntry", back_populates="suggested_updates")
