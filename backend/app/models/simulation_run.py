from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    months_ahead = Column(Integer, nullable=False)
    scenario_parameters = Column(JSONB, nullable=True, default=dict)
    result = Column(JSONB, nullable=True, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
