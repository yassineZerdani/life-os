from sqlalchemy import Column, String, Float, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base
import uuid


class ActionTemplate(Base):
    __tablename__ = "action_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    domain = Column(String(50), index=True, nullable=False)
    description = Column(Text, nullable=True)
    xp_reward = Column(Float, default=0)
    estimated_score_impact = Column(Float, default=0)
    time_cost_minutes = Column(Integer, default=0)
