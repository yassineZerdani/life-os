"""Pydantic schemas for Strategy Library and Protocol Engine."""
from typing import Optional
from pydantic import BaseModel


# --- Strategy Library Item ---
class StrategyLibraryItemBase(BaseModel):
    domain_key: str
    module_key: Optional[str] = None
    name: str
    category: str
    evidence_level: str
    impact_level: str
    difficulty_level: str
    description: Optional[str] = None
    when_to_use: Optional[str] = None
    contraindications: Optional[str] = None
    active: bool = True


class StrategyLibraryItemResponse(StrategyLibraryItemBase):
    id: str
    created_at: Optional[str] = None


# --- Protocol Step ---
class ProtocolStepBase(BaseModel):
    order_index: int = 0
    title: str
    description: Optional[str] = None
    frequency: Optional[str] = None
    target_metric_key: Optional[str] = None
    xp_reward: float = 0


class ProtocolStepResponse(ProtocolStepBase):
    id: str


# --- Strategy Protocol ---
class StrategyProtocolBase(BaseModel):
    name: str
    cadence: str
    duration_days: Optional[int] = None
    instructions_json: Optional[dict] = None


class StrategyProtocolResponse(StrategyProtocolBase):
    id: str
    strategy_id: str
    created_at: Optional[str] = None
    steps: list[ProtocolStepResponse] = []


class StrategyWithProtocolsResponse(StrategyLibraryItemResponse):
    protocols: list[StrategyProtocolResponse] = []


# --- User Active Protocol ---
class UserActiveProtocolBase(BaseModel):
    protocol_id: str
    notes: Optional[str] = None


class UserActiveProtocolResponse(BaseModel):
    id: str
    protocol_id: str
    started_at: Optional[str] = None
    active: bool
    adherence_score: float
    effectiveness_score: Optional[float] = None
    notes: Optional[str] = None


class ActiveProtocolDetailResponse(UserActiveProtocolResponse):
    strategy_name: str
    protocol_name: str
    domain_key: str
    category: str
    evidence_level: str
    impact_level: str
    difficulty_level: str
    module_key: Optional[str] = None
    steps: list[ProtocolStepResponse] = []


# --- Protocol Checkin ---
class ProtocolCheckinCreate(BaseModel):
    completed_steps_json: Optional[list] = None
    adherence_value: Optional[float] = None
    notes: Optional[str] = None


class ProtocolCheckinResponse(BaseModel):
    id: str
    user_active_protocol_id: str
    checked_at: Optional[str] = None
    adherence_value: Optional[float] = None
    notes: Optional[str] = None


# --- Recommendation ---
class StrategyRecommendation(BaseModel):
    strategy_id: str
    strategy_name: str
    protocol_id: str
    protocol_name: str
    why_recommended: str
    evidence_level: str
    estimated_benefit: str
    estimated_effort: str
    domain_key: str
    module_source: Optional[str] = None
    category: str
