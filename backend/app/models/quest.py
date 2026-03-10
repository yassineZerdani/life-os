from sqlalchemy import Column, String, Float, DateTime, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class Quest(Base):
    __tablename__ = "quests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    domain = Column(String(50), nullable=True, index=True)
    xp_reward = Column(Float, default=0)
    target_value = Column(Float, default=1)
    progress = Column(Float, default=0)
    deadline = Column(DateTime(timezone=True), nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
