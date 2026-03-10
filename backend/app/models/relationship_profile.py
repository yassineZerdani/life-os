"""Relationship profile."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class RelationshipProfile(Base):
    __tablename__ = "relationship_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    family_structure = Column(JSONB, nullable=True, default=dict)
    close_friends = Column(JSONB, nullable=True, default=list)
    partner_status = Column(String(100), nullable=True)
    mentors = Column(JSONB, nullable=True, default=list)
    support_network = Column(JSONB, nullable=True, default=list)
    important_relationships = Column(JSONB, nullable=True, default=list)
    relationship_stressors = Column(JSONB, nullable=True, default=list)
    relationship_goals = Column(JSONB, nullable=True, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
