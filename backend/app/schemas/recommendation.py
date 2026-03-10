from pydantic import BaseModel
from typing import Optional


class RecommendationOutput(BaseModel):
    action_template_id: str
    action: str
    domain: str
    impact: float
    estimated_score_gain: float
    xp_reward: float
    time_cost_minutes: int
    reason: str


class RecommendationsResponse(BaseModel):
    recommendations: list[RecommendationOutput]
