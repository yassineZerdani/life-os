"""
Build LifeState from the database — aggregates domains, scores, metrics, habits, strategies, goals, events, time.
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models import (
    Domain,
    DomainScore,
    MetricDefinition,
    MetricEntry,
    Goal,
    TimeBlock,
    XPEvent,
    LifeEvent,
    ActionTemplate,
    ActionCompletion,
    UserActiveProtocol,
    StrategyProtocol,
    ProtocolStep,
    StrategyLibraryItem,
)
from app.services.life_state import (
    LifeState,
    DomainScoreSnapshot,
    MetricSnapshot,
    HabitSnapshot,
    ActiveStrategySnapshot,
    GoalSnapshot,
    RecentEventSnapshot,
)

ANALYSIS_DAYS = 90


def _weeks_in_period(days: int) -> float:
    return max(1.0, days / 7.0)


def build_life_state(db: Session, as_of: datetime | None = None) -> LifeState:
    """Build current life state from all relevant tables."""
    as_of = as_of or datetime.now(timezone.utc)
    cutoff = as_of - timedelta(days=ANALYSIS_DAYS)

    # Domain scores
    domain_scores: dict[str, DomainScoreSnapshot] = {}
    for row in db.query(DomainScore).all():
        domain_scores[row.domain] = DomainScoreSnapshot(
            domain=row.domain,
            score=float(row.score or 0),
            level=int(row.level or 1),
            xp=int(row.xp or 0),
        )
    domains = [d.slug for d in db.query(Domain).all()]
    for d in domains:
        if d not in domain_scores:
            domain_scores[d] = DomainScoreSnapshot(domain=d, score=0.0, level=1, xp=0)

    # Metrics: latest value + trend per week
    metrics_list: list[MetricSnapshot] = []
    for m in db.query(MetricDefinition).all():
        latest = (
            db.query(MetricEntry)
            .filter(MetricEntry.metric_id == m.id, MetricEntry.timestamp >= cutoff)
            .order_by(desc(MetricEntry.timestamp))
            .first()
        )
        first = (
            db.query(MetricEntry)
            .filter(MetricEntry.metric_id == m.id, MetricEntry.timestamp >= cutoff)
            .order_by(MetricEntry.timestamp)
            .first()
        )
        value = float(latest.value) if latest else 0.0
        trend = 0.0
        if first and latest and first.id != latest.id and first.value != 0:
            weeks = _weeks_in_period(ANALYSIS_DAYS)
            trend = (latest.value - first.value) / weeks
        metrics_list.append(MetricSnapshot(
            metric_id=str(m.id),
            name=m.name or "",
            domain=m.domain or "",
            value=value,
            unit=m.unit or "",
            trend_per_week=trend,
        ))

    # Habits: action templates with completion frequency per week
    habits_list: list[HabitSnapshot] = []
    for t in db.query(ActionTemplate).all():
        count = (
            db.query(func.count(ActionCompletion.id))
            .filter(ActionCompletion.action_template_id == t.id, ActionCompletion.completed_at >= cutoff)
            .scalar() or 0
        )
        per_week = count / _weeks_in_period(ANALYSIS_DAYS)
        habits_list.append(HabitSnapshot(
            action_template_id=str(t.id),
            title=t.title or "",
            domain=t.domain or "",
            completions_per_week=round(per_week, 2),
            xp_per_completion=float(t.xp_reward or 0),
            estimated_score_impact=float(t.estimated_score_impact or 0),
        ))

    # Active strategies (user active protocols)
    strategies_list: list[ActiveStrategySnapshot] = []
    for uap in db.query(UserActiveProtocol).filter(UserActiveProtocol.active.is_(True)).all():
        prot = uap.protocol
        if not prot:
            continue
        strat = prot.strategy
        steps = db.query(ProtocolStep).filter(ProtocolStep.protocol_id == prot.id).all()
        xp_per = sum(float(s.xp_reward or 0) for s in steps)
        strategies_list.append(ActiveStrategySnapshot(
            protocol_id=str(prot.id),
            strategy_name=strat.name if strat else prot.name,
            domain_key=strat.domain_key if strat else "",
            adherence_score=float(uap.adherence_score or 0),
            steps_count=len(steps),
            xp_per_checkin=xp_per,
            cadence=prot.cadence or "weekly",
        ))

    # Goals with progress rate per week
    goals_list: list[GoalSnapshot] = []
    for g in db.query(Goal).filter(Goal.status == "active").all():
        domain_slug = None
        if g.domain_id:
            d = db.query(Domain).filter(Domain.id == g.domain_id).first()
            domain_slug = d.slug if d else None
        created = g.created_at or as_of
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        days = max(1, (as_of - created).days)
        progress_per_week = (float(g.progress or 0) / days) * 7
        goals_list.append(GoalSnapshot(
            goal_id=g.id,
            title=g.title or "Goal",
            domain=domain_slug,
            progress=float(g.progress or 0),
            target_value=float(g.target_value or 0),
            progress_per_week=progress_per_week,
        ))

    # Recent events (life events, last 30 days)
    recent_cutoff = as_of - timedelta(days=30)
    recent_events_list: list[RecentEventSnapshot] = []
    for e in (
        db.query(LifeEvent)
        .filter(LifeEvent.date >= recent_cutoff)
        .order_by(desc(LifeEvent.date))
        .limit(50)
    ):
        recent_events_list.append(RecentEventSnapshot(
            event_id=str(e.id),
            title=e.title or "",
            domain=e.domain or "",
            event_type=e.event_type or "",
            xp_awarded=float(e.xp_awarded or 0),
            date=e.date or as_of,
        ))

    # Time distribution: hours per domain per week (last 90 days)
    time_by_domain = (
        db.query(TimeBlock.domain, func.sum(TimeBlock.duration_minutes).label("total"))
        .filter(TimeBlock.start_time >= cutoff)
        .group_by(TimeBlock.domain)
        .all()
    )
    weeks = _weeks_in_period(ANALYSIS_DAYS)
    time_distribution = {r.domain: round(r.total / 60 / weeks, 1) for r in time_by_domain if r.domain}
    for d in domains:
        if d not in time_distribution:
            time_distribution[d] = 0.0

    # Baseline rates (named rates for simulation)
    baseline_rates = compute_baseline_rates(db, cutoff, as_of, weeks)

    return LifeState(
        snapshot_at=as_of,
        domain_scores=domain_scores,
        metrics=metrics_list,
        habits=habits_list,
        active_strategies=strategies_list,
        goals=goals_list,
        recent_events=recent_events_list,
        time_distribution=time_distribution,
        baseline_rates=baseline_rates,
    )


def compute_baseline_rates(
    db: Session,
    cutoff: datetime,
    as_of: datetime,
    weeks: float,
) -> dict[str, float]:
    """
    Compute baseline rates from past 90 days:
    workouts_per_week, learning_hours_per_week, social_contact_frequency,
    sleep_average, spending_rate, savings_rate, plus XP per domain per week.
    """
    rates: dict[str, float] = {}

    # XP per domain per week
    xp_rows = (
        db.query(XPEvent.domain, func.sum(XPEvent.xp_amount).label("total"))
        .filter(XPEvent.created_at >= cutoff)
        .group_by(XPEvent.domain)
        .all()
    )
    for r in xp_rows:
        rates[f"xp_{r.domain}"] = round((r.total or 0) / weeks, 1)
    rates["xp_total_per_week"] = round(sum(r.total or 0 for r in xp_rows) / weeks, 1)

    # Time per domain -> map to named rates by domain slug
    time_rows = (
        db.query(TimeBlock.domain, func.sum(TimeBlock.duration_minutes).label("total"))
        .filter(TimeBlock.start_time >= cutoff)
        .group_by(TimeBlock.domain)
        .all()
    )
    for r in time_rows:
        if r.domain:
            rates[f"hours_{r.domain}_per_week"] = round((r.total or 0) / 60 / weeks, 1)
    # Common aliases
    rates["workouts_per_week"] = rates.get("hours_health_per_week", 0) / 1.5
    rates["learning_hours_per_week"] = rates.get("hours_skills_per_week", 0) + rates.get("hours_work_per_week", 0) * 0.3
    rates["social_contact_frequency"] = rates.get("hours_network_per_week", 0) * 2

    # Metric-based: sleep, spending, savings from metric definitions
    for m in db.query(MetricDefinition).all():
        name_lower = (m.name or "").lower()
        last = (
            db.query(MetricEntry)
            .filter(MetricEntry.metric_id == m.id, MetricEntry.timestamp >= cutoff)
            .order_by(desc(MetricEntry.timestamp))
            .first()
        )
        if last is None:
            continue
        val = float(last.value)
        if "sleep" in name_lower:
            rates["sleep_average"] = val
        elif "spend" in name_lower or "expense" in name_lower:
            cnt = (
                db.query(func.count(MetricEntry.id))
                .filter(MetricEntry.metric_id == m.id, MetricEntry.timestamp >= cutoff)
                .scalar() or 0
            )
            rates["spending_rate"] = val * max(1, cnt) / weeks
        elif "savings" in name_lower or "saving" in name_lower:
            cnt = (
                db.query(func.count(MetricEntry.id))
                .filter(MetricEntry.metric_id == m.id, MetricEntry.timestamp >= cutoff)
                .scalar() or 0
            )
            rates["savings_rate"] = val * max(1, cnt) / weeks

    if "sleep_average" not in rates:
        rates["sleep_average"] = 0.0
    if "spending_rate" not in rates:
        rates["spending_rate"] = 0.0
    if "savings_rate" not in rates:
        rates["savings_rate"] = 0.0

    return rates
