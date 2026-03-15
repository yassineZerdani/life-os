"""
Human Body Intelligence System: Body System → Organ → Functions → Needs → Metrics → Signals.
Health domain: track health at body system and organ level.
Includes: nutrients DB, movement types DB, symptoms DB, and junction tables for organ mappings.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class BodySystem(Base):
    __tablename__ = "body_systems"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(50), unique=True, nullable=False, index=True)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)
    default_support_profile_json = Column(JSONB, nullable=True)  # nutrients, movement, sleep defaults
    default_metrics_json = Column(JSONB, nullable=True)  # default metric keys for system
    default_signal_profile_json = Column(JSONB, nullable=True)  # default signals/symptoms for system

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    organs = relationship("Organ", back_populates="system", cascade="all, delete-orphan", order_by="Organ.display_order")


class Nutrient(Base):
    """Nutrient database: vitamins, minerals, macronutrients, essential fatty acids."""
    __tablename__ = "nutrients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(80), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # vitamin, mineral, macronutrient, fatty_acid
    unit = Column(String(30), nullable=True)  # mg, mcg, g, IU
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    organ_nutrients = relationship("OrganNutrient", back_populates="nutrient", cascade="all, delete-orphan")


class MovementType(Base):
    """Movement / exercise type database: cardio, strength_training, walking, mobility, breathing, etc."""
    __tablename__ = "movement_types"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(80), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    organ_movements = relationship("OrganMovement", back_populates="movement_type", cascade="all, delete-orphan")


class Symptom(Base):
    """Symptom database: early warning signals and common symptoms."""
    __tablename__ = "symptoms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(80), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    stage = Column(String(30), nullable=True)  # early_warning, moderate, severe
    display_order = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    organ_symptoms = relationship("OrganSymptom", back_populates="symptom", cascade="all, delete-orphan")


class Organ(Base):
    __tablename__ = "organs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    system_id = Column(UUID(as_uuid=True), ForeignKey("body_systems.id", ondelete="CASCADE"), nullable=False)
    key = Column(String(80), nullable=False, index=True)
    slug = Column(String(80), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    detail_level = Column(String(20), nullable=True)  # full, medium, basic
    parent_organ_id = Column(UUID(as_uuid=True), ForeignKey("organs.id", ondelete="SET NULL"), nullable=True)
    anatomical_region = Column(String(80), nullable=True)
    organ_type = Column(String(50), nullable=True)
    has_custom_support_data = Column(Boolean, default=False, nullable=False)
    has_custom_metric_data = Column(Boolean, default=False, nullable=False)
    has_custom_signal_data = Column(Boolean, default=False, nullable=False)
    functions = Column(JSONB, nullable=True, default=list)
    nutrition_requirements = Column(JSONB, nullable=True, default=list)  # legacy / quick lookup
    movement_requirements = Column(JSONB, nullable=True, default=list)
    sleep_requirements = Column(JSONB, nullable=True, default=list)
    signals = Column(JSONB, nullable=True, default=list)
    symptoms = Column(JSONB, nullable=True, default=list)
    metric_keys = Column(JSONB, nullable=True, default=list)
    display_order = Column(Integer, default=0)
    map_region_id = Column(String(50), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    system = relationship("BodySystem", back_populates="organs")
    parent_organ = relationship("Organ", remote_side=[id], backref="child_organs")
    health_scores = relationship("OrganHealthScore", back_populates="organ", cascade="all, delete-orphan")
    organ_nutrients = relationship("OrganNutrient", back_populates="organ", cascade="all, delete-orphan")
    organ_movements = relationship("OrganMovement", back_populates="organ", cascade="all, delete-orphan")
    organ_symptoms = relationship("OrganSymptom", back_populates="organ", cascade="all, delete-orphan")


class OrganNutrient(Base):
    """Junction: which nutrients are critical/important for each organ."""
    __tablename__ = "organ_nutrients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organ_id = Column(UUID(as_uuid=True), ForeignKey("organs.id", ondelete="CASCADE"), nullable=False)
    nutrient_id = Column(UUID(as_uuid=True), ForeignKey("nutrients.id", ondelete="CASCADE"), nullable=False)
    importance = Column(String(30), nullable=True)  # critical, important, supportive
    notes = Column(Text, nullable=True)

    organ = relationship("Organ", back_populates="organ_nutrients")
    nutrient = relationship("Nutrient", back_populates="organ_nutrients")


class OrganMovement(Base):
    """Junction: which movement types each organ needs."""
    __tablename__ = "organ_movements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organ_id = Column(UUID(as_uuid=True), ForeignKey("organs.id", ondelete="CASCADE"), nullable=False)
    movement_type_id = Column(UUID(as_uuid=True), ForeignKey("movement_types.id", ondelete="CASCADE"), nullable=False)
    importance = Column(String(30), nullable=True)

    organ = relationship("Organ", back_populates="organ_movements")
    movement_type = relationship("MovementType", back_populates="organ_movements")


class OrganSymptom(Base):
    """Junction: early warning / symptoms associated with each organ."""
    __tablename__ = "organ_symptoms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organ_id = Column(UUID(as_uuid=True), ForeignKey("organs.id", ondelete="CASCADE"), nullable=False)
    symptom_id = Column(UUID(as_uuid=True), ForeignKey("symptoms.id", ondelete="CASCADE"), nullable=False)
    stage = Column(String(30), nullable=True)  # early_warning, moderate, severe

    organ = relationship("Organ", back_populates="organ_symptoms")
    symptom = relationship("Symptom", back_populates="organ_symptoms")


class OrganHealthScore(Base):
    """User-specific computed health score per organ."""
    __tablename__ = "organ_health_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    organ_id = Column(UUID(as_uuid=True), ForeignKey("organs.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)  # 0-100
    factors = Column(JSONB, nullable=True, default=dict)
    computed_at = Column(DateTime(timezone=True), server_default=func.now())

    organ = relationship("Organ", back_populates="health_scores")
