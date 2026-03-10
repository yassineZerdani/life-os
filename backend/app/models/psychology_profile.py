"""Psychology profile — Big Five, triggers, coping, therapy preferences."""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class PsychologyProfile(Base):
    __tablename__ = "psychology_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    big_five = Column(JSONB, nullable=True, default=dict)
    emotional_triggers = Column(JSONB, nullable=True, default=list)
    coping_patterns = Column(JSONB, nullable=True, default=list)
    thought_distortions = Column(JSONB, nullable=True, default=list)
    behavior_loops = Column(JSONB, nullable=True, default=list)
    therapy_methods_interest = Column(JSONB, nullable=True, default=list)
    cbt_preferences = Column(JSONB, nullable=True, default=dict)
    dbt_preferences = Column(JSONB, nullable=True, default=dict)
    shadow_work_interest = Column(JSONB, nullable=True, default=dict)
    journaling_preference = Column(String(100), nullable=True)
    stress_patterns = Column(JSONB, nullable=True, default=list)
    mood_patterns = Column(JSONB, nullable=True, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
