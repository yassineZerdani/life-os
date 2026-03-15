"""
Life Work Engine: missions, milestones, meaningful achievements,
opportunities, career leverage, work-energy patterns.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class LifeWorkMission(Base):
    __tablename__ = "life_work_missions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(300), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(40), nullable=False, default="active", index=True)  # active | paused | completed | archived
    phase = Column(String(80), nullable=True, index=True)  # e.g. discovery | building | scaling
    priority = Column(Integer, nullable=True, default=1)  # 1 = highest
    target_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    milestones = relationship(
        "LifeWorkMilestone",
        back_populates="mission",
        cascade="all, delete-orphan",
        order_by="LifeWorkMilestone.order_index",
    )


class LifeWorkMilestone(Base):
    __tablename__ = "life_work_milestones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mission_id = Column(
        UUID(as_uuid=True),
        ForeignKey("life_work_missions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(40), nullable=False, default="pending", index=True)  # pending | in_progress | completed
    completed_at = Column(DateTime(timezone=True), nullable=True)
    order_index = Column(Integer, nullable=False, default=0)

    mission = relationship("LifeWorkMission", back_populates="milestones")


class LifeWorkAchievement(Base):
    """Meaningful career/life achievements (shipped product, landed client, etc.)."""
    __tablename__ = "life_work_achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(300), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(60), nullable=False, index=True)  # business | technical | financial | social_professional | personal_growth
    impact_level = Column(String(20), nullable=True, index=True)  # low | medium | high | transformative
    date = Column(Date, nullable=False, index=True)
    proof_url = Column(String(2000), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class LifeWorkOpportunity(Base):
    __tablename__ = "life_work_opportunities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(300), nullable=False, index=True)
    type = Column(String(60), nullable=False, index=True)  # freelance_lead | job | partnership | startup_idea | collaboration | investment
    source = Column(String(200), nullable=True)
    status = Column(String(40), nullable=False, default="open", index=True)  # open | in_progress | won | lost | deferred
    value_estimate = Column(String(100), nullable=True)  # e.g. "$5k", "Equity"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class CareerLeverage(Base):
    """Leverage areas: skills, reputation, network, assets_projects."""
    __tablename__ = "career_leverage"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    area = Column(String(60), nullable=False, index=True)  # skills | reputation | network | assets_projects
    score = Column(Float, nullable=False, default=0.0)  # 0-10 or 0-100
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class EnergyPattern(Base):
    """Which work types energize vs drain the user."""
    __tablename__ = "energy_patterns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    work_type = Column(String(120), nullable=False, index=True)  # e.g. architecture | admin | deep coding
    energy_effect = Column(String(20), nullable=False, index=True)  # energizes | drains | neutral
    focus_quality = Column(String(20), nullable=True, index=True)  # high | medium | low
    notes = Column(Text, nullable=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
