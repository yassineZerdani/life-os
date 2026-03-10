"""Personal profile — full name, preferred name, birth, location, occupation, relationship status, etc."""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class PersonProfile(Base):
    __tablename__ = "person_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    full_name = Column(String(200), nullable=True)
    preferred_name = Column(String(100), nullable=True)
    birth_year = Column(Integer, nullable=True)
    location = Column(String(200), nullable=True)
    timezone = Column(String(100), nullable=True)
    languages = Column(JSONB, nullable=True, default=list)  # ["en", "es"]
    occupation = Column(String(200), nullable=True)
    relationship_status = Column(String(50), nullable=True)  # single, partnered, married, etc.
    living_situation = Column(String(100), nullable=True)  # alone, family, roommates, etc.

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
