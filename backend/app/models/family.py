"""
Family Command Center: family members, interactions, responsibilities,
memories, and dynamics (closeness, tension, support, patterns).
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    relationship_type = Column(String(60), nullable=False, index=True)  # parent | sibling | partner | child | extended | other
    birth_date = Column(Date, nullable=True)
    contact_info = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    closeness_score = Column(Float, nullable=True)  # 0-10
    tension_score = Column(Float, nullable=True)  # 0-10
    support_level = Column(String(40), nullable=True, index=True)  # none | light | moderate | high | critical
    parent_id = Column(UUID(as_uuid=True), ForeignKey("family_members.id", ondelete="SET NULL"), nullable=True, index=True)  # for graph hierarchy
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    parent = relationship("FamilyMember", remote_side=[id], backref="children")
    interactions = relationship(
        "FamilyInteraction",
        back_populates="family_member",
        cascade="all, delete-orphan",
        order_by="FamilyInteraction.date.desc()",
    )
    responsibilities = relationship(
        "FamilyResponsibility",
        back_populates="family_member",
        cascade="all, delete-orphan",
    )
    memories = relationship(
        "FamilyMemory",
        back_populates="family_member",
        cascade="all, delete-orphan",
        order_by="FamilyMemory.date.desc()",
    )
    dynamic_notes = relationship(
        "FamilyDynamicNote",
        back_populates="family_member",
        cascade="all, delete-orphan",
    )


class FamilyInteraction(Base):
    __tablename__ = "family_interactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    family_member_id = Column(
        UUID(as_uuid=True),
        ForeignKey("family_members.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    interaction_type = Column(String(60), nullable=False, index=True)  # call | visit | message | event | other
    date = Column(Date, nullable=False, index=True)
    emotional_tone = Column(String(40), nullable=True)  # positive | neutral | difficult | mixed
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    family_member = relationship("FamilyMember", back_populates="interactions")


class FamilyResponsibility(Base):
    __tablename__ = "family_responsibilities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    family_member_id = Column(
        UUID(as_uuid=True),
        ForeignKey("family_members.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    title = Column(String(300), nullable=False, index=True)
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=True)
    status = Column(String(40), nullable=False, default="pending", index=True)  # pending | in_progress | done | deferred
    category = Column(String(60), nullable=False, index=True)  # health | appointment | follow_up | financial | emotional | logistics | other
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    family_member = relationship("FamilyMember", back_populates="responsibilities")


class FamilyMemory(Base):
    __tablename__ = "family_memories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    family_member_id = Column(
        UUID(as_uuid=True),
        ForeignKey("family_members.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title = Column(String(300), nullable=False, index=True)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=True)
    media_url = Column(String(2000), nullable=True)
    tags = Column(JSONB, nullable=True, default=list)  # list of strings
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    family_member = relationship("FamilyMember", back_populates="memories")


class FamilyDynamicNote(Base):
    __tablename__ = "family_dynamic_notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    family_member_id = Column(
        UUID(as_uuid=True),
        ForeignKey("family_members.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    pattern_type = Column(String(60), nullable=False, index=True)  # conflict | fragile | closeness_cycle | communication | support_gap
    trigger_notes = Column(Text, nullable=True)
    safe_topics = Column(Text, nullable=True)
    difficult_topics = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    family_member = relationship("FamilyMember", back_populates="dynamic_notes")
