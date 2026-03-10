"""Identity / values profile — values, principles, purpose, boundaries."""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class IdentityProfile(Base):
    __tablename__ = "identity_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    values = Column(JSONB, nullable=True, default=list)  # ranked or list
    principles = Column(JSONB, nullable=True, default=list)
    purpose = Column(Text, nullable=True)
    spiritual_orientation = Column(String(200), nullable=True)  # optional, user choice
    ideal_self_description = Column(Text, nullable=True)
    representation_goals = Column(JSONB, nullable=True, default=list)  # persona / how they want to show up
    boundaries = Column(JSONB, nullable=True, default=list)
    non_negotiables = Column(JSONB, nullable=True, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
