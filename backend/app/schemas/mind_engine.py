"""Mind Engine API schemas."""
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel
from typing import Optional


# ----- EmotionalStateEntry -----
class EmotionalStateEntryCreate(BaseModel):
    date: date
    primary_emotion: str
    intensity: Optional[float] = None
    notes: Optional[str] = None


class EmotionalStateEntryUpdate(BaseModel):
    date: Optional[date] = None
    primary_emotion: Optional[str] = None
    intensity: Optional[float] = None
    notes: Optional[str] = None


class EmotionalStateEntryResponse(BaseModel):
    id: UUID
    user_id: int
    date: date
    primary_emotion: str
    intensity: Optional[float]
    notes: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- TriggerEntry -----
class TriggerEntryCreate(BaseModel):
    trigger_type: str
    description: Optional[str] = None
    date: date
    linked_emotion: Optional[str] = None
    linked_behavior: Optional[str] = None


class TriggerEntryResponse(BaseModel):
    id: UUID
    user_id: int
    trigger_type: str
    description: Optional[str]
    date: date
    linked_emotion: Optional[str]
    linked_behavior: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- ThoughtPattern -----
class ThoughtPatternCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    frequency_score: Optional[float] = None
    severity_score: Optional[float] = None


class ThoughtPatternUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    frequency_score: Optional[float] = None
    severity_score: Optional[float] = None


class ThoughtPatternResponse(BaseModel):
    id: UUID
    user_id: int
    title: str
    description: Optional[str]
    category: Optional[str]
    frequency_score: Optional[float]
    severity_score: Optional[float]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- BehaviorLoop -----
class BehaviorLoopCreate(BaseModel):
    title: str
    trigger_summary: Optional[str] = None
    emotional_sequence: Optional[str] = None
    behavioral_sequence: Optional[str] = None
    aftermath: Optional[str] = None
    notes: Optional[str] = None


class BehaviorLoopUpdate(BaseModel):
    title: Optional[str] = None
    trigger_summary: Optional[str] = None
    emotional_sequence: Optional[str] = None
    behavioral_sequence: Optional[str] = None
    aftermath: Optional[str] = None
    notes: Optional[str] = None


class BehaviorLoopResponse(BaseModel):
    id: UUID
    user_id: int
    title: str
    trigger_summary: Optional[str]
    emotional_sequence: Optional[str]
    behavioral_sequence: Optional[str]
    aftermath: Optional[str]
    notes: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- RegulationToolUse -----
class RegulationToolUseCreate(BaseModel):
    tool_name: str
    date: date
    effectiveness_score: Optional[float] = None
    notes: Optional[str] = None


class RegulationToolUseResponse(BaseModel):
    id: UUID
    user_id: int
    tool_name: str
    date: date
    effectiveness_score: Optional[float]
    notes: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- Dashboard & analytics -----
class MindEngineDashboardResponse(BaseModel):
    emotions_count: int
    triggers_count: int
    thought_patterns_count: int
    loops_count: int
    regulation_uses_count: int
    emotional_weather: list[dict]
    trend_insights: list[str]
    recent_emotions: list[EmotionalStateEntryResponse]
    recent_triggers: list[TriggerEntryResponse]
    top_tools: list[dict]
