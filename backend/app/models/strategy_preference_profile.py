"""Strategy preferences — how user wants recommendations and UX."""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class StrategyPreferenceProfile(Base):
    __tablename__ = "strategy_preference_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    strict_vs_flexible = Column(String(50), nullable=True)  # strict, flexible, mixed
    data_heavy_vs_simple = Column(String(50), nullable=True)  # data_heavy, simple, balanced
    science_backed = Column(Boolean, nullable=True, default=True)
    exploratory_reflective = Column(Boolean, nullable=True, default=False)
    wants_gamification = Column(Boolean, nullable=True, default=True)
    wants_reminders = Column(Boolean, nullable=True, default=True)
    recommendation_style = Column(String(50), nullable=True)  # challenging, gentle, balanced
    domain_priorities = Column(JSONB, nullable=True, default=list)  # ordered domain keys for weighting

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
