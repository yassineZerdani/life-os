from sqlalchemy import Column, Float, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class XPEvent(Base):
    __tablename__ = "xp_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    domain = Column(String(50), index=True)
    xp_amount = Column(Float)
    reason = Column(String(200))
    source_type = Column(String(50))
    source_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
