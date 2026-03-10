from sqlalchemy import Column, String, Float, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid


class AchievementDefinition(Base):
    __tablename__ = "achievement_definitions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    domain = Column(String(50), nullable=True, index=True)
    xp_reward = Column(Float, default=0)
    condition_expression = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    unlocks = relationship("AchievementUnlock", back_populates="achievement_definition")
