from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID


class BodySystemResponse(BaseModel):
    id: UUID
    key: str
    slug: str
    name: str
    description: Optional[str] = None
    display_order: int
    default_support_profile_json: Optional[dict] = None
    default_metrics_json: Optional[list] = None
    default_signal_profile_json: Optional[dict] = None

    class Config:
        from_attributes = True


class OrganResponse(BaseModel):
    id: UUID
    system_id: UUID
    key: str
    slug: str
    name: str
    description: Optional[str] = None
    detail_level: Optional[str] = None  # full, medium, basic
    parent_organ_id: Optional[UUID] = None
    anatomical_region: Optional[str] = None
    organ_type: Optional[str] = None
    has_custom_support_data: bool = False
    has_custom_metric_data: bool = False
    has_custom_signal_data: bool = False
    functions: list = []
    nutrition_requirements: list = []
    movement_requirements: list = []
    sleep_requirements: list = []
    signals: list = []
    symptoms: list = []
    metric_keys: list = []
    display_order: int = 0
    map_region_id: Optional[str] = None

    class Config:
        from_attributes = True


class OrganWithSystemResponse(OrganResponse):
    system: Optional[BodySystemResponse] = None


class OrganHealthScoreResponse(BaseModel):
    score: float
    factors: dict = {}
    computed_at: Optional[datetime] = None


class OrganDashboardResponse(BaseModel):
    organ: OrganWithSystemResponse
    health_score: Optional[OrganHealthScoreResponse] = None
    tracked_metrics: list = []
    risk_signals: list = []
    ai_insights: Optional[list] = None
