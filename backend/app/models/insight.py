from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class Insight(Base):
    __tablename__ = "insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String(50), index=True)
    domain = Column(String(50), nullable=True, index=True)
    message = Column(Text)
    severity = Column(String(20), default="medium")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved = Column(Boolean, default=False)
