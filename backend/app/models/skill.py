"""
Skill Operating System: skills as trees with progress, practice, artifacts, and weaknesses.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class Skill(Base):
    __tablename__ = "skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    category = Column(String(80), nullable=True, index=True)
    description = Column(Text, nullable=True)
    parent_skill_id = Column(
        UUID(as_uuid=True),
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    active = Column(String(20), nullable=False, default="active")  # active | paused | archived

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    parent = relationship("Skill", remote_side=[id], backref="subskills")
    progress = relationship(
        "SkillProgress",
        back_populates="skill",
        uselist=False,
        cascade="all, delete-orphan",
    )
    practice_sessions = relationship(
        "PracticeSession",
        back_populates="skill",
        cascade="all, delete-orphan",
        order_by="PracticeSession.date.desc()",
    )
    artifacts = relationship(
        "SkillArtifact",
        back_populates="skill",
        cascade="all, delete-orphan",
        order_by="SkillArtifact.created_at.desc()",
    )
    weaknesses = relationship(
        "SkillWeakness",
        back_populates="skill",
        cascade="all, delete-orphan",
    )


class SkillProgress(Base):
    __tablename__ = "skill_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    skill_id = Column(
        UUID(as_uuid=True),
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    level = Column(Integer, nullable=False, default=1)
    xp = Column(Integer, nullable=False, default=0)
    confidence_score = Column(Float, nullable=True)  # 0–1
    decay_risk = Column(Float, nullable=True)  # 0–1 computed
    last_practiced_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    skill = relationship("Skill", back_populates="progress")


class PracticeSession(Base):
    __tablename__ = "practice_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    skill_id = Column(
        UUID(as_uuid=True),
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    date = Column(Date, nullable=False, index=True)
    duration_minutes = Column(Integer, nullable=False, default=0)
    difficulty = Column(String(40), nullable=True)  # easy | medium | hard | challenge
    focus_area = Column(String(120), nullable=True)
    mistakes_notes = Column(Text, nullable=True)
    feedback_notes = Column(Text, nullable=True)
    energy_level = Column(String(40), nullable=True)
    quality_score = Column(Float, nullable=True)  # 0–1

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    skill = relationship("Skill", back_populates="practice_sessions")


class SkillArtifact(Base):
    __tablename__ = "skill_artifacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    skill_id = Column(
        UUID(as_uuid=True),
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type = Column(String(60), nullable=False, index=True)  # code | design | essay | recording | presentation | certificate | note
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    file_url = Column(String(2000), nullable=True)
    link_url = Column(String(2000), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    skill = relationship("Skill", back_populates="artifacts")


class SkillWeakness(Base):
    __tablename__ = "skill_weaknesses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    skill_id = Column(
        UUID(as_uuid=True),
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    weakness_name = Column(String(200), nullable=False)
    severity = Column(String(20), nullable=False, default="medium")  # low | medium | high
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    skill = relationship("Skill", back_populates="weaknesses")
