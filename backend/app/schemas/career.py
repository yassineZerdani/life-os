"""Life Work Engine API schemas."""
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel
from typing import Optional


# ----- Mission -----
class MissionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "active"
    phase: Optional[str] = None
    priority: Optional[int] = None
    target_date: Optional[date] = None


class MissionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    phase: Optional[str] = None
    priority: Optional[int] = None
    target_date: Optional[date] = None


class MilestoneCreate(BaseModel):
    mission_id: UUID
    title: str
    description: Optional[str] = None
    status: str = "pending"
    order_index: int = 0


class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    completed_at: Optional[datetime] = None
    order_index: Optional[int] = None


class MilestoneResponse(BaseModel):
    id: UUID
    mission_id: UUID
    title: str
    description: Optional[str]
    status: str
    completed_at: Optional[datetime]
    order_index: int

    class Config:
        from_attributes = True


class MissionResponse(BaseModel):
    id: UUID
    user_id: int
    title: str
    description: Optional[str]
    status: str
    phase: Optional[str]
    priority: Optional[int]
    target_date: Optional[date]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    milestones: list[MilestoneResponse] = []

    class Config:
        from_attributes = True


# ----- Achievement -----
class AchievementCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str  # business | technical | financial | social_professional | personal_growth
    impact_level: Optional[str] = None  # low | medium | high | transformative
    date: date
    proof_url: Optional[str] = None


class AchievementResponse(BaseModel):
    id: UUID
    user_id: int
    title: str
    description: Optional[str]
    category: str
    impact_level: Optional[str]
    date: date
    proof_url: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- Opportunity -----
class OpportunityCreate(BaseModel):
    title: str
    type: str  # freelance_lead | job | partnership | startup_idea | collaboration | investment
    source: Optional[str] = None
    status: str = "open"
    value_estimate: Optional[str] = None
    notes: Optional[str] = None


class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    value_estimate: Optional[str] = None
    notes: Optional[str] = None


class OpportunityResponse(BaseModel):
    id: UUID
    user_id: int
    title: str
    type: str
    source: Optional[str]
    status: str
    value_estimate: Optional[str]
    notes: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- Career Leverage -----
class CareerLeverageCreate(BaseModel):
    area: str  # skills | reputation | network | assets_projects
    score: float = 0.0
    notes: Optional[str] = None


class CareerLeverageUpdate(BaseModel):
    score: Optional[float] = None
    notes: Optional[str] = None


class CareerLeverageResponse(BaseModel):
    id: UUID
    user_id: int
    area: str
    score: float
    notes: Optional[str]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- Energy Pattern -----
class EnergyPatternCreate(BaseModel):
    work_type: str
    energy_effect: str  # energizes | drains | neutral
    focus_quality: Optional[str] = None  # high | medium | low
    notes: Optional[str] = None


class EnergyPatternResponse(BaseModel):
    id: UUID
    user_id: int
    work_type: str
    energy_effect: str
    focus_quality: Optional[str]
    notes: Optional[str]
    recorded_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- Dashboard -----
class CareerDashboardResponse(BaseModel):
    missions: list[MissionResponse]
    achievements_recent: list[AchievementResponse]
    opportunities_by_status: dict[str, int]
    leverage: list[CareerLeverageResponse]
    weakest_leverage_area: Optional[str] = None
    recommended_leverage_action: Optional[str] = None
    energy_insights: list[str] = []
