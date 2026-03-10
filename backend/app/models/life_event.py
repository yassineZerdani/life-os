from sqlalchemy import Column, String, Float, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class LifeEvent(Base):
    __tablename__ = "life_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200))
    description = Column(Text, nullable=True)
    domain = Column(String(50), index=True)
    event_type = Column(String(50))
    xp_awarded = Column(Float, default=0.0)
    date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
