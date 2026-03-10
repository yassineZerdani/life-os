"""
Life Simulation Engine — full life evolution simulator.

Uses LifeState (domain scores, metrics, habits, strategies, goals, time distribution),
applies scenario changes (activate strategy, habit frequency, behavior reduction, time allocation),
and simulates week-by-week evolution. Returns domain projections, XP, goal completion, health/finance trends.
"""
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from typing import Any
from sqlalchemy.orm import Session

from app.models import Domain, Goal, ProtocolStep, StrategyProtocol, StrategyLibraryItem
from app.services.scoring_service import xp_required_for_level
from app.services.life_state import (
    LifeState,
    DomainScoreSnapshot,
    HabitSnapshot,
    MetricSnapshot,
    GoalSnapshot,
)
from app.services.life_state_builder import build_life_state, compute_baseline_rates, ANALYSIS_DAYS
from app.services.simulation_scenario import SimulationScenario

# XP per hour of time allocation (by domain) — approximate
XP_PER_HOUR_BY_DOMAIN: dict[str, float] = {
    "health": 25,
    "skills": 30,
    "work": 20,
    "network": 35,
    "finance": 15,
    "mindset": 28,
    "fun": 18,
}
DEFAULT_XP_PER_HOUR = 20


def _level_from_xp(xp: float) -> int:
    level = 1
    remaining = xp
    while remaining >= xp_required_for_level(level):
        remaining -= xp_required_for_level(level)
        level += 1
    return level


def _get_protocol_effects(db: Session, protocol_ids: list[str]) -> list[tuple[str, float]]:
    """Return (domain_key, xp_per_week) for each protocol. Weekly cadence = 1x steps XP; daily = 7x."""
    result: list[tuple[str, float]] = []
    for pid in protocol_ids:
        prot = db.query(StrategyProtocol).filter(StrategyProtocol.id == pid).first()
        if not prot:
            continue
        strat = prot.strategy
        domain_key = strat.domain_key if strat else ""
        steps = db.query(ProtocolStep).filter(ProtocolStep.protocol_id == prot.id).all()
        xp_per_checkin = sum(float(s.xp_reward or 0) for s in steps)
        cadence = (prot.cadence or "weekly").lower()
        if "day" in cadence or cadence == "daily":
            xp_per_week = xp_per_checkin * 7
        else:
            xp_per_week = xp_per_checkin
        result.append((domain_key, xp_per_week))
    return result


def _apply_scenario_to_state(state: LifeState, scenario: SimulationScenario, db: Session) -> LifeState:
    """Apply scenario deltas to state: effective habits, time distribution, and extra XP from new strategies."""
    state = deepcopy(state)
    # Time allocation: add deltas to time_distribution
    for domain, delta in scenario.change_time_allocation.items():
        state.time_distribution[domain] = state.time_distribution.get(domain, 0) + delta
    # Habit frequency overrides
    habit_by_id = {h.action_template_id: h for h in state.habits}
    for tid, per_week in scenario.increase_habit_frequency.items():
        if tid in habit_by_id:
            h = habit_by_id[tid]
            state.habits = [x for x in state.habits if x.action_template_id != tid]
            state.habits.append(HabitSnapshot(
                action_template_id=h.action_template_id,
                title=h.title,
                domain=h.domain,
                completions_per_week=per_week,
                xp_per_completion=h.xp_per_completion,
                estimated_score_impact=h.estimated_score_impact,
            ))
            habit_by_id[tid] = state.habits[-1]
    # Reduce behavior: scale completions_per_week
    for tid, factor in scenario.reduce_behavior.items():
        if tid in habit_by_id:
            h = habit_by_id[tid]
            new_per_week = max(0, h.completions_per_week * factor)
            state.habits = [x for x in state.habits if x.action_template_id != tid]
            state.habits.append(HabitSnapshot(
                action_template_id=h.action_template_id,
                title=h.title,
                domain=h.domain,
                completions_per_week=new_per_week,
                xp_per_completion=h.xp_per_completion,
                estimated_score_impact=h.estimated_score_impact,
            ))
    # Store scenario-derived XP per domain for new strategies (computed in run_week)
    state.baseline_rates["_scenario_xp_per_domain"] = {}  # filled below
    protocol_effects = _get_protocol_effects(db, scenario.activate_strategy)
    for domain_key, xp_per_week in protocol_effects:
        state.baseline_rates["_scenario_xp_per_domain"][domain_key] = (
            state.baseline_rates["_scenario_xp_per_domain"].get(domain_key, 0) + xp_per_week
        )
    return state


def _weekly_xp_from_state(state: LifeState) -> dict[str, float]:
    """Compute XP per domain per week from habits, time distribution, baseline XP, and scenario strategy XP."""
    xp_per_domain: dict[str, float] = {}
    for d in state.domain_list():
        xp_per_domain[d] = state.baseline_rates.get(f"xp_{d}", 0.0)
    for h in state.habits:
        if h.domain:
            xp_per_domain[h.domain] = xp_per_domain.get(h.domain, 0) + h.completions_per_week * h.xp_per_completion
    for domain, hours in state.time_distribution.items():
        rate = XP_PER_HOUR_BY_DOMAIN.get(domain, DEFAULT_XP_PER_HOUR)
        xp_per_domain[domain] = xp_per_domain.get(domain, 0) + hours * rate
    scenario_xp = state.baseline_rates.get("_scenario_xp_per_domain") or {}
    for d, xp in scenario_xp.items():
        if d:
            xp_per_domain[d] = xp_per_domain.get(d, 0) + xp
    return xp_per_domain


def _run_one_week(current: LifeState) -> LifeState:
    """Advance state by one week: XP, levels, scores, goal progress, metric trends."""
    xp_rates = _weekly_xp_from_state(current)
    next_scores: dict[str, DomainScoreSnapshot] = {}
    for domain, snap in current.domain_scores.items():
        xp_gain = xp_rates.get(domain, 0)
        new_xp = snap.xp + int(xp_gain)
        new_level = _level_from_xp(new_xp)
        # Score: small improvement from XP gain and from metric trend
        metric_trend = next(
            (m.trend_per_week for m in current.metrics if m.domain == domain),
            0.0,
        )
        score_delta = min(2.0, xp_gain / 50 + metric_trend * 0.5)
        new_score = min(100, max(0, snap.score + score_delta))
        next_scores[domain] = DomainScoreSnapshot(
            domain=domain,
            score=round(new_score, 1),
            level=new_level,
            xp=new_xp,
        )
    # Goals: progress += progress_per_week
    next_goals = []
    for g in current.goals:
        new_progress = min(g.target_value, g.progress + g.progress_per_week)
        next_goals.append(GoalSnapshot(
            goal_id=g.goal_id,
            title=g.title,
            domain=g.domain,
            progress=new_progress,
            target_value=g.target_value,
            progress_per_week=g.progress_per_week,
        ))
    # Build next state (shallow copy, replace scores and goals)
    next_state = deepcopy(current)
    next_state.domain_scores = next_scores
    next_state.goals = next_goals
    next_state.snapshot_at = current.snapshot_at + timedelta(weeks=1)
    # Metric values: value += trend_per_week (simplified)
    next_metrics = []
    for m in current.metrics:
        next_metrics.append(MetricSnapshot(
            metric_id=m.metric_id,
            name=m.name,
            domain=m.domain,
            value=round(m.value + m.trend_per_week, 2),
            unit=m.unit,
            trend_per_week=m.trend_per_week,
        ))
    next_state.metrics = next_metrics
    return next_state


def run_simulation(
    db: Session,
    months_ahead: int,
    scenario_parameters: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Run the full life simulation:
    1. Build LifeState from DB
    2. Apply scenario
    3. Simulate week by week
    4. Return projections, weekly series, goal predictions, health/finance trends.
    """
    scenario = SimulationScenario.from_dict(scenario_parameters)
    weeks_ahead = months_ahead * 4

    state = build_life_state(db)
    state = _apply_scenario_to_state(state, scenario, db)

    weekly_snapshots: list[dict[str, Any]] = []
    current = state
    for week in range(weeks_ahead):
        current = _run_one_week(current)
        weekly_snapshots.append({
            "week": week + 1,
            "domain_scores": {d: s.score for d, s in current.domain_scores.items()},
            "domain_levels": {d: s.level for d, s in current.domain_scores.items()},
            "domain_xp": {d: s.xp for d, s in current.domain_scores.items()},
            "goal_progress": {g.goal_id: g.progress for g in current.goals},
            "metrics": {m.metric_id: m.value for m in current.metrics},
        })

    # Final projections (same shape as legacy API)
    domains = state.domain_list()
    final = current
    projections = []
    for domain in domains:
        snap = final.domain_scores.get(domain)
        initial = state.domain_scores.get(domain)
        if not snap:
            continue
        if not initial:
            initial = DomainScoreSnapshot(domain=domain, score=0.0, level=1, xp=0)
        xp_rate = _weekly_xp_from_state(state).get(domain, 0)
        projections.append({
            "domain": domain,
            "current_score": round(initial.score, 1),
            "predicted_score": round(snap.score, 1),
            "score_change": round(snap.score - initial.score, 1),
            "current_level": initial.level,
            "predicted_level": snap.level,
            "current_xp": initial.xp,
            "predicted_xp": snap.xp,
            "weekly_xp_rate": round(xp_rate, 1),
        })

    # Goal predictions
    goal_predictions = []
    for g in final.goals:
        if g.target_value <= 0:
            continue
        remaining = g.target_value - g.progress
        rate = g.progress_per_week / 7 if g.progress_per_week else 0
        months_to_complete = (remaining / (rate * 30)) if rate > 0 else 999
        domain_slug = g.domain
        goal_predictions.append({
            "goal_id": g.goal_id,
            "title": g.title,
            "domain": domain_slug,
            "progress": g.progress,
            "target": g.target_value,
            "months_to_complete": round(months_to_complete, 1),
            "message": f"Your '{g.title}' will be reached in ~{int(months_to_complete)} months.",
        })

    # Health/finance trends from metrics (last snapshot)
    health_metrics = [m for m in final.metrics if m.domain == "health" or "sleep" in (m.name or "").lower()]
    finance_metrics = [m for m in final.metrics if m.domain == "finance" or "spend" in (m.name or "").lower() or "savings" in (m.name or "").lower()]
    health_trend = [weekly_snapshots[i].get("metrics", {}) for i in range(len(weekly_snapshots))]
    # Simplify: just list metric values over time per key metric
    health_trend_series = {}
    for m in health_metrics:
        health_trend_series[m.metric_id] = [s["metrics"].get(m.metric_id, m.value) for s in weekly_snapshots]
    finance_trend_series = {}
    for m in finance_metrics:
        finance_trend_series[m.metric_id] = [s["metrics"].get(m.metric_id, m.value) for s in weekly_snapshots]

    return {
        "months_ahead": months_ahead,
        "scenario": scenario.to_dict(),
        "domains": projections,
        "goal_predictions": goal_predictions,
        "analysis_period_days": ANALYSIS_DAYS,
        "baseline_rates": {k: v for k, v in state.baseline_rates.items() if not k.startswith("_")},
        "weekly_series": weekly_snapshots,
        "health_trends": health_trend_series,
        "finance_trends": finance_trend_series,
        "life_state_summary": {
            "domain_scores": {d: s.score for d, s in state.domain_scores.items()},
            "time_distribution": state.time_distribution,
            "habits_count": len(state.habits),
            "active_strategies_count": len(state.active_strategies),
            "goals_count": len(state.goals),
        },
    }


# Re-export for control_room and any code that imports run_simulation
__all__ = ["run_simulation", "ANALYSIS_DAYS"]
