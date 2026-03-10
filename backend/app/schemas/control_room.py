"""Control Room schemas for aggregated dashboard API."""
from typing import Optional
from pydantic import BaseModel


class DomainCard(BaseModel):
    domain: str
    domain_name: str
    score: float
    level: int
    xp: int
    xp_required: float
    xp_progress: float
    trend: float
    last_activity: Optional[str] = None
    risk: str


class ControlRoomSummary(BaseModel):
    life_score: float
    total_level: int
    total_xp: int
    score_trend_week: float
    score_trend_month: float
    status: str
    summary: str
    domains: list[DomainCard]


class Alert(BaseModel):
    id: str
    message: str
    severity: str
    domain: Optional[str] = None


class Recommendation(BaseModel):
    action_template_id: str
    action: str
    domain: str
    impact: float
    estimated_score_gain: float
    xp_reward: float
    time_cost_minutes: float
    reason: str


class ForecastDomain(BaseModel):
    domain: str
    current_score: float
    predicted_score: float
    score_change: float


class Forecast(BaseModel):
    months_ahead: int
    domains: list[ForecastDomain]
    summary: str


class InsightCard(BaseModel):
    id: str
    type: str
    severity: str
    domain: Optional[str] = None
    message: str


class TimelineEvent(BaseModel):
    type: str
    id: str
    timestamp: Optional[str] = None
    title: str
    description: Optional[str] = None
    domain: Optional[str] = None
    event_type: Optional[str] = None
    xp_awarded: Optional[float] = None


class QuestCard(BaseModel):
    id: str
    title: str
    progress: float
    target_value: float
    xp_reward: float


class AchievementCard(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    domain: Optional[str] = None
    xp_reward: Optional[float] = None
    unlocked_at: Optional[str] = None


class GraphNodePreview(BaseModel):
    id: str
    type: str
    name: str
    metadata: dict = {}
    created_at: Optional[str] = None


class GraphEdgePreview(BaseModel):
    id: str
    source_id: str
    target_id: str
    relation_type: str
    metadata: dict = {}
    created_at: Optional[str] = None


class GraphPreview(BaseModel):
    nodes: list[GraphNodePreview]
    edges: list[GraphEdgePreview]


class ActiveStrategyCard(BaseModel):
    id: str
    strategy_id: str
    domain: str
    name: str
    description: Optional[str] = None
    started_at: Optional[str] = None
    adherence_score: float
    steps: list[dict] = []


class ControlRoomFull(BaseModel):
    summary: ControlRoomSummary
    alerts: list[Alert]
    recommendations: list[Recommendation]
    forecast: Forecast
    weekly_time: dict[str, float]
    weekly_balance: list[dict]
    balance_score: float
    insights: list[InsightCard]
    timeline: list[TimelineEvent]
    quests: list[QuestCard]
    achievements: list[AchievementCard]
    active_strategies: list[ActiveStrategyCard] = []
    graph_preview: GraphPreview
