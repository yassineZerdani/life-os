"""
Life State — snapshot of the full life system for simulation.
Aggregates domain scores, metrics, habits (action completions), strategies, goals, events, time.
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any
from uuid import UUID


@dataclass
class DomainScoreSnapshot:
    domain: str
    score: float
    level: int
    xp: int


@dataclass
class MetricSnapshot:
    metric_id: str
    name: str
    domain: str
    value: float
    unit: str
    trend_per_week: float  # delta per week over baseline period


@dataclass
class HabitSnapshot:
    """Action template + completion frequency (completions per week)."""
    action_template_id: str
    title: str
    domain: str
    completions_per_week: float
    xp_per_completion: float
    estimated_score_impact: float


@dataclass
class ActiveStrategySnapshot:
    protocol_id: str
    strategy_name: str
    domain_key: str
    adherence_score: float
    steps_count: int
    xp_per_checkin: float
    cadence: str  # daily, weekly


@dataclass
class GoalSnapshot:
    goal_id: int
    title: str
    domain: str | None
    progress: float
    target_value: float
    progress_per_week: float  # from baseline


@dataclass
class RecentEventSnapshot:
    event_id: str
    title: str
    domain: str
    event_type: str
    xp_awarded: float
    date: datetime


@dataclass
class LifeState:
    """Full life system state at a point in time."""
    snapshot_at: datetime
    domain_scores: dict[str, DomainScoreSnapshot] = field(default_factory=dict)
    metrics: list[MetricSnapshot] = field(default_factory=list)
    habits: list[HabitSnapshot] = field(default_factory=list)
    active_strategies: list[ActiveStrategySnapshot] = field(default_factory=list)
    goals: list[GoalSnapshot] = field(default_factory=list)
    recent_events: list[RecentEventSnapshot] = field(default_factory=list)
    time_distribution: dict[str, float] = field(default_factory=dict)  # domain -> hours per week
    # Computed baseline rates (from past 90 days)
    baseline_rates: dict[str, float] = field(default_factory=dict)

    def domain_list(self) -> list[str]:
        return sorted(set(self.domain_scores.keys()) | set(self.time_distribution.keys()))
