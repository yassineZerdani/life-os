"""
Insight Engine - analyzes user data and generates life insights.

Runs periodically (daily) or manually. Structured for easy addition of new rules.
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Insight, TimeBlock, DomainScore, XPEvent, MetricEntry, MetricDefinition, Goal
from app.services.analytics_service import get_time_distribution


def _create_insight(
    db: Session,
    type: str,
    message: str,
    domain: str | None = None,
    severity: str = "medium",
) -> Insight:
    """Helper to create and persist an insight."""
    insight = Insight(
        type=type,
        domain=domain,
        message=message,
        severity=severity,
    )
    db.add(insight)
    db.flush()
    return insight


def _rule_time_imbalance(db: Session) -> list[Insight]:
    """If a domain takes more than 60% of weekly time, generate imbalance insight."""
    now = datetime.utcnow()
    week_start = now - timedelta(days=7)
    dist = get_time_distribution(db, week_start, now)
    total_hours = sum(dist.values())
    if total_hours == 0:
        return []

    insights = []
    for domain, hours in dist.items():
        pct = (hours / total_hours) * 100
        if pct > 60:
            insights.append(
                _create_insight(
                    db,
                    type="imbalance",
                    message=f"You spent {pct:.0f}% of your time on {domain.title()} this week.",
                    domain=domain,
                    severity="medium",
                )
            )
    return insights


def _rule_health_neglect(db: Session) -> list[Insight]:
    """If no health activity in 5 days, generate warning."""
    now = datetime.utcnow()
    cutoff = now - timedelta(days=5)

    # Health activity: TimeBlocks in health domain or MetricEntry for health metrics
    has_time = (
        db.query(TimeBlock)
        .filter(
            TimeBlock.domain == "health",
            TimeBlock.start_time >= cutoff,
        )
        .first()
    )
    if has_time:
        return []

    has_metric = (
        db.query(MetricEntry)
        .join(MetricDefinition, MetricEntry.metric_id == MetricDefinition.id)
        .filter(
            MetricDefinition.domain == "health",
            MetricEntry.timestamp >= cutoff,
        )
        .first()
    )
    if has_metric:
        return []

    has_xp = (
        db.query(XPEvent)
        .filter(
            XPEvent.domain == "health",
            XPEvent.created_at >= cutoff,
        )
        .first()
    )
    if has_xp:
        return []

    return [
        _create_insight(
            db,
            type="warning",
            message="You haven't logged any health activity in 5 days.",
            domain="health",
            severity="high",
        )
    ]


def _rule_xp_growth_trend(db: Session) -> list[Insight]:
    """Compare XP gained this month vs last month. If increase > 30%, generate trend insight."""
    now = datetime.utcnow()
    this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month_start = (this_month_start.replace(day=1) - timedelta(days=1)).replace(day=1)

    domains = db.query(XPEvent.domain).distinct().all()
    domains = [d[0] for d in domains if d[0]]

    insights = []
    for domain in domains:
        this_month = (
            db.query(func.sum(XPEvent.xp_amount))
            .filter(
                XPEvent.domain == domain,
                XPEvent.created_at >= this_month_start,
            )
            .scalar()
            or 0
        )
        last_month = (
            db.query(func.sum(XPEvent.xp_amount))
            .filter(
                XPEvent.domain == domain,
                XPEvent.created_at >= last_month_start,
                XPEvent.created_at < this_month_start,
            )
            .scalar()
            or 0
        )

        if last_month > 0 and this_month > 0:
            increase_pct = ((this_month - last_month) / last_month) * 100
            if increase_pct > 30:
                insights.append(
                    _create_insight(
                        db,
                        type="trend",
                        message=f"Your {domain.title()} XP increased {increase_pct:.0f}% this month.",
                        domain=domain,
                        severity="low",
                    )
                )
    return insights


def _rule_level_up(db: Session, domain: str, new_level: int) -> Insight | None:
    """Generate achievement insight when domain level increases. Called from XP service."""
    return _create_insight(
        db,
        type="achievement",
        message=f"You reached Level {new_level} in {domain.title()}.",
        domain=domain,
        severity="low",
    )


def _rule_goal_prediction(db: Session) -> list[Insight]:
    """Estimate goal completion time from progress rate."""
    goals = (
        db.query(Goal)
        .filter(
            Goal.status == "active",
            Goal.target_value.isnot(None),
            Goal.target_value > 0,
        )
        .all()
    )

    insights = []
    for goal in goals:
        target = goal.target_value
        progress = goal.progress or 0
        if progress >= target:
            continue

        remaining = target - progress
        now = datetime.now(timezone.utc)
        created = goal.created_at or now
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        days_since_created = (now - created).days
        if days_since_created < 1:
            continue

        rate_per_day = progress / days_since_created
        if rate_per_day <= 0:
            continue

        days_to_goal = remaining / rate_per_day
        months = days_to_goal / 30
        if months < 0.5:
            continue

        from app.models import Domain
        domain = None
        if goal.domain_id:
            dom = db.query(Domain).filter(Domain.id == goal.domain_id).first()
            domain = dom.slug if dom else None

        title = goal.title or "your goal"
        insights.append(
            _create_insight(
                db,
                type="prediction",
                message=f"You will reach '{title}' in ~{int(months)} months.",
                domain=domain,
                severity="low",
            )
        )
    return insights


def run_insight_engine(db: Session) -> list[Insight]:
    """
    Run all insight rules and return generated insights.
    Designed for easy extension: add new _rule_* functions and call them here.
    """
    all_insights = []

    all_insights.extend(_rule_time_imbalance(db))
    all_insights.extend(_rule_health_neglect(db))
    all_insights.extend(_rule_xp_growth_trend(db))
    all_insights.extend(_rule_goal_prediction(db))

    db.commit()
    for i in all_insights:
        db.refresh(i)
    return all_insights
