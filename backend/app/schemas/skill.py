"""Skill OS API schemas."""
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel
from typing import Optional, Any


# ----- Skill -----
class SkillCreate(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    parent_skill_id: Optional[UUID] = None
    active: str = "active"


class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    parent_skill_id: Optional[UUID] = None
    active: Optional[str] = None


class SkillProgressSchema(BaseModel):
    id: UUID
    skill_id: UUID
    level: int
    xp: int
    confidence_score: Optional[float]
    decay_risk: Optional[float]
    last_practiced_at: Optional[datetime]

    class Config:
        from_attributes = True


class SkillResponse(BaseModel):
    id: UUID
    user_id: int
    name: str
    category: Optional[str]
    description: Optional[str]
    parent_skill_id: Optional[UUID]
    active: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    progress: Optional[SkillProgressSchema] = None
    subskills: list["SkillResponse"] = []

    class Config:
        from_attributes = True


SkillResponse.model_rebuild()


# ----- PracticeSession -----
class PracticeSessionCreate(BaseModel):
    skill_id: UUID
    date: date
    duration_minutes: int = 0
    difficulty: Optional[str] = None
    focus_area: Optional[str] = None
    mistakes_notes: Optional[str] = None
    feedback_notes: Optional[str] = None
    energy_level: Optional[str] = None
    quality_score: Optional[float] = None


class PracticeSessionResponse(BaseModel):
    id: UUID
    skill_id: UUID
    date: date
    duration_minutes: int
    difficulty: Optional[str]
    focus_area: Optional[str]
    mistakes_notes: Optional[str]
    feedback_notes: Optional[str]
    energy_level: Optional[str]
    quality_score: Optional[float]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- Artifact -----
class ArtifactCreate(BaseModel):
    skill_id: UUID
    type: str  # code | design | essay | recording | presentation | certificate | note
    title: str
    description: Optional[str] = None
    file_url: Optional[str] = None
    link_url: Optional[str] = None


class ArtifactResponse(BaseModel):
    id: UUID
    skill_id: UUID
    type: str
    title: str
    description: Optional[str]
    file_url: Optional[str]
    link_url: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- Weakness -----
class WeaknessCreate(BaseModel):
    skill_id: UUID
    weakness_name: str
    severity: str = "medium"  # low | medium | high
    notes: Optional[str] = None


class WeaknessResponse(BaseModel):
    id: UUID
    skill_id: UUID
    weakness_name: str
    severity: str
    notes: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- Tree & Intelligence -----
class SkillTreeNode(BaseModel):
    skill: SkillResponse
    children: list["SkillTreeNode"] = []
    total_xp: int = 0
    session_count: int = 0
    days_since_practice: Optional[int] = None
    decay_risk: Optional[float] = None


SkillTreeNode.model_rebuild()


class IntelligenceInsight(BaseModel):
    type: str  # neglected_subskill | practice_imbalance | decay_warning | repeated_mistakes | growth_area | missing_proof
    skill_id: UUID
    skill_name: str
    message: str
    severity: str = "medium"  # low | medium | high
    payload: Optional[dict[str, Any]] = None


class RecommendedDrill(BaseModel):
    skill_id: UUID
    skill_name: str
    focus_area: Optional[str]
    reason: str
    priority: int  # 1 = highest


class SkillDashboardResponse(BaseModel):
    root_skills: list[SkillTreeNode]
    insights: list[IntelligenceInsight]
    recommended_drills: list[RecommendedDrill]
    decay_warnings: list[IntelligenceInsight]
