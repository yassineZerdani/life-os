"""Lifestyle profile."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class LifestyleProfile(Base):
    __tablename__ = "lifestyle_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    usual_sleep_schedule = Column(JSONB, nullable=True, default=dict)
    work_schedule = Column(JSONB, nullable=True, default=dict)
    commute = Column(JSONB, nullable=True, default=dict)
    home_environment = Column(JSONB, nullable=True, default=dict)
    movement_environment = Column(JSONB, nullable=True, default=dict)
    gym_access = Column(String(50), nullable=True)
    food_access = Column(JSONB, nullable=True, default=dict)
    screen_time_habits = Column(JSONB, nullable=True, default=list)
    digital_distractions = Column(JSONB, nullable=True, default=list)
    weekend_structure = Column(JSONB, nullable=True, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
