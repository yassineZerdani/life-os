"""
Health profile and supporting entities.
Tracking and insight only; safe, health-oriented design.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    conditions = Column(JSONB, nullable=True, default=list)
    symptoms = Column(JSONB, nullable=True, default=list)
    sleep_issues = Column(JSONB, nullable=True, default=list)
    eating_style = Column(String(100), nullable=True)
    movement_habits = Column(JSONB, nullable=True, default=list)
    exercise_habits = Column(JSONB, nullable=True, default=list)
    substance_use_tracking = Column(JSONB, nullable=True, default=list)
    energy_issues = Column(JSONB, nullable=True, default=list)
    digestive_issues = Column(JSONB, nullable=True, default=list)
    providers = Column(JSONB, nullable=True, default=list)
    key_lab_markers = Column(JSONB, nullable=True, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    medications = relationship("HealthMedication", back_populates="health_profile", cascade="all, delete-orphan")
    supplements = relationship("HealthSupplement", back_populates="health_profile", cascade="all, delete-orphan")
    allergies = relationship("HealthAllergy", back_populates="health_profile", cascade="all, delete-orphan")
    goals = relationship("HealthGoal", back_populates="health_profile", cascade="all, delete-orphan")
    habits = relationship("HealthHabit", back_populates="health_profile", cascade="all, delete-orphan")


class HealthMedication(Base):
    __tablename__ = "health_medications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    health_profile_id = Column(UUID(as_uuid=True), ForeignKey("health_profiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    dosage = Column(String(100), nullable=True)
    frequency = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    health_profile = relationship("HealthProfile", back_populates="medications")


class HealthSupplement(Base):
    __tablename__ = "health_supplements"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    health_profile_id = Column(UUID(as_uuid=True), ForeignKey("health_profiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    dosage = Column(String(100), nullable=True)
    frequency = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    health_profile = relationship("HealthProfile", back_populates="supplements")


class HealthAllergy(Base):
    __tablename__ = "health_allergies"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    health_profile_id = Column(UUID(as_uuid=True), ForeignKey("health_profiles.id", ondelete="CASCADE"), nullable=False)
    allergen = Column(String(200), nullable=False)
    severity = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    health_profile = relationship("HealthProfile", back_populates="allergies")


class HealthGoal(Base):
    __tablename__ = "health_goals"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    health_profile_id = Column(UUID(as_uuid=True), ForeignKey("health_profiles.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    target_value = Column(Float, nullable=True)
    target_unit = Column(String(50), nullable=True)
    health_profile = relationship("HealthProfile", back_populates="goals")


class HealthHabit(Base):
    __tablename__ = "health_habits"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    health_profile_id = Column(UUID(as_uuid=True), ForeignKey("health_profiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    habit_type = Column(String(50), nullable=True)
    frequency = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    health_profile = relationship("HealthProfile", back_populates="habits")
