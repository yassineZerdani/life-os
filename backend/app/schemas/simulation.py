from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, Any


from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, Any


class SimulationScenarioInput(BaseModel):
    """Structured scenario for the life simulation engine."""
    activate_strategy: list[str] = []  # protocol IDs to activate in sim
    increase_habit_frequency: dict[str, float] = {}  # action_template_id -> completions per week
    reduce_behavior: dict[str, float] = {}  # action_template_id -> multiplier 0.0-1.0
    change_time_allocation: dict[str, float] = {}  # domain -> delta hours per week


class SimulationRunRequest(BaseModel):
    months: int = 6
    scenario: Optional[dict[str, Any]] = None  # SimulationScenarioInput as dict, or legacy shape


class DomainProjection(BaseModel):
    domain: str
    current_score: float
    predicted_score: float
    score_change: float
    current_level: int
    predicted_level: int
    current_xp: int
    predicted_xp: int
    weekly_xp_rate: float


class GoalPrediction(BaseModel):
    goal_id: int
    title: str
    domain: Optional[str] = None
    progress: float
    target: float
    months_to_complete: float
    message: str


class SimulationResult(BaseModel):
    months_ahead: int
    scenario: dict[str, Any]
    domains: list[DomainProjection]
    goal_predictions: list[GoalPrediction]
    analysis_period_days: int
    baseline_rates: Optional[dict[str, float]] = None
    weekly_series: Optional[list[dict[str, Any]]] = None
    health_trends: Optional[dict[str, list[float]]] = None
    finance_trends: Optional[dict[str, list[float]]] = None
    life_state_summary: Optional[dict[str, Any]] = None

    class Config:
        extra = "allow"


class SimulationRunResponse(BaseModel):
    domain: str
    current_score: float
    predicted_score: float
    score_change: float
    current_level: int
    predicted_level: int
    current_xp: int
    predicted_xp: int
    weekly_xp_rate: float


class GoalPrediction(BaseModel):
    goal_id: int
    title: str
    domain: Optional[str] = None
    progress: float
    target: float
    months_to_complete: float
    message: str


class SimulationResult(BaseModel):
    months_ahead: int
    scenario: dict[str, Any]
    domains: list[DomainProjection]
    goal_predictions: list[GoalPrediction]
    analysis_period_days: int


class SimulationRunResponse(BaseModel):
    id: str
    months_ahead: int
    scenario_parameters: dict[str, Any]
    result: dict[str, Any]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @field_validator("id", mode="before")
    @classmethod
    def id_to_str(cls, v):
        return str(v) if v is not None else ""
