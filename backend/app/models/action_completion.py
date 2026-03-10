from sqlalchemy import Column, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class ActionCompletion(Base):
    __tablename__ = "action_completions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action_template_id = Column(UUID(as_uuid=True), ForeignKey("action_templates.id"), nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
