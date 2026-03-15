"""
Life Memory Engine: experiences, people, media, seasons, tags.
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


class LifeExperience(Base):
    """Single life experience: what, where, who, tone, intensity, meaning, aliveness, lesson."""
    __tablename__ = "life_experiences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(300), nullable=False, index=True)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False, index=True)
    location_name = Column(String(300), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    category = Column(String(60), nullable=False, index=True)
    emotional_tone = Column(String(60), nullable=True, index=True)
    intensity_score = Column(Float, nullable=True)  # 0-10
    meaning_score = Column(Float, nullable=True)  # 0-10
    aliveness_score = Column(Float, nullable=True)  # 0-10
    lesson_note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class LifeExperiencePerson(Base):
    """Person involved in an experience."""
    __tablename__ = "life_experience_people"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experience_id = Column(
        UUID(as_uuid=True),
        ForeignKey("life_experiences.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    person_name = Column(String(200), nullable=False, index=True)
    relationship_type = Column(String(100), nullable=True)


class LifeExperienceMedia(Base):
    """Media artifact for an experience (photo, video, audio)."""
    __tablename__ = "life_experience_media"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experience_id = Column(
        UUID(as_uuid=True),
        ForeignKey("life_experiences.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    media_type = Column(String(60), nullable=False, index=True)
    media_url = Column(String(2000), nullable=False)


class SeasonOfLife(Base):
    """A season or chapter of life with start/end and summary."""
    __tablename__ = "seasons_of_life"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(300), nullable=False, index=True)
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class LifeExperienceTag(Base):
    """Tag on an experience for filtering."""
    __tablename__ = "life_experience_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experience_id = Column(
        UUID(as_uuid=True),
        ForeignKey("life_experiences.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    tag = Column(String(100), nullable=False, index=True)
