from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.db.session import Base


class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200))
    relationship_type = Column(String(100))
    notes = Column(Text, nullable=True)
    last_contact_date = Column(DateTime(timezone=True), nullable=True)
    important_dates = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
