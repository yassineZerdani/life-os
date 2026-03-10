"""Career / skills profile."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class CareerProfile(Base):
    __tablename__ = "career_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    current_role = Column(String(200), nullable=True)
    active_projects = Column(JSONB, nullable=True, default=list)
    desired_skills = Column(JSONB, nullable=True, default=list)
    learning_priorities = Column(JSONB, nullable=True, default=list)
    schedule_constraints = Column(JSONB, nullable=True, default=dict)
    work_style = Column(String(100), nullable=True)
    productivity_methods = Column(JSONB, nullable=True, default=list)
    long_term_career_goals = Column(JSONB, nullable=True, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
