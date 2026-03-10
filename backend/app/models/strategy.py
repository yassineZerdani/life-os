from sqlalchemy import Column, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class Strategy(Base):
    __tablename__ = "strategies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    domain = Column(String(50), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(String(20), default="medium")  # easy, medium, hard
    estimated_impact = Column(Float, default=0)  # 0-100
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    steps = relationship("StrategyStep", back_populates="strategy", cascade="all, delete-orphan")
    user_strategies = relationship("UserStrategy", back_populates="strategy", cascade="all, delete-orphan")


class StrategyStep(Base):
    __tablename__ = "strategy_steps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    strategy_id = Column(UUID(as_uuid=True), ForeignKey("strategies.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    frequency = Column(String(100), nullable=True)  # e.g. "3 times per week", "daily"
    xp_reward = Column(Float, default=0)

    strategy = relationship("Strategy", back_populates="steps")


class UserStrategy(Base):
    __tablename__ = "user_strategies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    strategy_id = Column(UUID(as_uuid=True), ForeignKey("strategies.id", ondelete="CASCADE"), nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    active = Column(Boolean, default=True)
    adherence_score = Column(Float, default=0)  # 0-100

    strategy = relationship("Strategy", back_populates="user_strategies")
