from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.db.session import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    description = Column(Text, nullable=True)
    domain_id = Column(Integer, ForeignKey("domains.id"))
    progress = Column(Float, default=0.0)
    target_value = Column(Float, nullable=True)
    target_unit = Column(String(50), nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
