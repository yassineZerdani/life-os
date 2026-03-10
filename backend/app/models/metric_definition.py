from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class MetricDefinition(Base):
    __tablename__ = "metric_definitions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100))
    domain = Column(String(50), index=True)
    unit = Column(String(50), default="")
    weight = Column(Float, default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    entries = relationship("MetricEntry", back_populates="metric_definition", cascade="all, delete-orphan")


class MetricEntry(Base):
    __tablename__ = "metric_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    metric_id = Column(UUID(as_uuid=True), ForeignKey("metric_definitions.id"), nullable=False)
    value = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    note = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    metric_definition = relationship("MetricDefinition", back_populates="entries")
