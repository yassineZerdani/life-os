from typing import Optional
from pydantic import BaseModel


class StrategyStepBase(BaseModel):
    title: str
    description: Optional[str] = None
    frequency: Optional[str] = None
    xp_reward: float = 0


class StrategyStepResponse(StrategyStepBase):
    id: str


class StrategyBase(BaseModel):
    domain: str
    name: str
    description: Optional[str] = None
    difficulty: str = "medium"
    estimated_impact: float = 0


class StrategyResponse(StrategyBase):
    id: str
    created_at: Optional[str] = None
    steps: list[StrategyStepResponse] = []


class StrategyRecommended(StrategyResponse):
    pass


class UserStrategyActivate(BaseModel):
    strategy_id: str


class ActiveStrategyResponse(BaseModel):
    id: str
    strategy_id: str
    domain: str
    name: str
    description: Optional[str] = None
    started_at: Optional[str] = None
    adherence_score: float
    steps: list[dict] = []
