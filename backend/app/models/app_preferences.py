"""App preferences — theme, notifications, timezone, language, privacy."""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.db.session import Base


class AppPreferences(Base):
    __tablename__ = "app_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    theme = Column(String(50), nullable=True, default="system")  # light, dark, system
    dark_mode = Column(Boolean, nullable=True, default=False)
    notifications_enabled = Column(Boolean, nullable=True, default=True)
    timezone = Column(String(100), nullable=True)
    language = Column(String(20), nullable=True, default="en")
    privacy_controls = Column(JSONB, nullable=True, default=dict)  # data sharing, visibility, etc.

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
