from sqlalchemy import Column, Float, Integer, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class DomainScore(Base):
    __tablename__ = "domain_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    domain = Column(String(50), unique=True, index=True)
    score = Column(Float, default=0.0)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
