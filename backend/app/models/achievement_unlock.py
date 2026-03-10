from sqlalchemy import Column, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid


class AchievementUnlock(Base):
    __tablename__ = "achievement_unlocks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    achievement_id = Column(UUID(as_uuid=True), ForeignKey("achievement_definitions.id"), nullable=False)
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now())

    achievement_definition = relationship("AchievementDefinition", back_populates="unlocks")
