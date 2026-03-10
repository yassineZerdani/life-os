"""
Life Decision Engine - recommends the most impactful actions to improve life balance.

Uses domain scores, time allocation, XP events, and goals to rank ActionTemplates
by opportunity score. Acts as a life optimization assistant.
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models import (
    DomainScore,
    XPEvent,
    TimeBlock,
    Goal,
    MetricEntry,
    ActionTemplate,
)


def _get_domain_deficits(db: Session) -> dict[str, float]:
    """Compute deficit = 100 - domain_score for each domain."""
    scores = db.query(DomainScore).all()
    return {r.domain: max(0, 100 - float(r.score or 0)) for r in scores}


def _get_hours_per_domain_last_n_days(db: Session, days: int) -> dict[str, float]:
    """Hours per domain in last N days."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    result = (
        db.query(TimeBlock.domain, func.sum(TimeBlock.duration_minutes).label('total'))
        .filter(TimeBlock.start_time >= cutoff)
        .group_by(TimeBlock.domain)
        .all()
    )
    return {r.domain: round(r.total / 60, 1) for r in result}


def _get_xp_per_domain_last_n_days(db: Session, days: int) -> dict[str, float]:
    """XP per domain in last N days."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    result = (
        db.query(XPEvent.domain, func.sum(XPEvent.xp_amount).label('total'))
        .filter(XPEvent.created_at >= cutoff)
        .group_by(XPEvent.domain)
        .all()
    )
    return {r.domain: r.total for r in result}


def _to_utc(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _get_last_activity_days_ago(db: Session, domain: str) -> int | None:
    """Days since last TimeBlock or XPEvent for domain."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=365)
    last_tb = (
        db.query(TimeBlock)
        .filter(TimeBlock.domain == domain, TimeBlock.start_time >= cutoff)
        .order_by(desc(TimeBlock.start_time))
        .first()
    )
    last_xp = (
        db.query(XPEvent)
        .filter(XPEvent.domain == domain, XPEvent.created_at >= cutoff)
        .order_by(desc(XPEvent.created_at))
        .first()
    )
    now = datetime.now(timezone.utc)
    days_tb = (now - _to_utc(last_tb.start_time)).days if last_tb and last_tb.start_time else None
    days_xp = (now - _to_utc(last_xp.created_at)).days if last_xp and last_xp.created_at else None
    if days_tb is not None and days_xp is not None:
        return min(days_tb, days_xp)
    return days_tb or days_xp


def _build_reason(
    domain: str,
    deficit: float,
    hours_this_week: float,
    xp_this_week: float,
    days_since_activity: int | None,
) -> str:
    """Generate contextual reason for recommending this action."""
    parts = []
    if deficit >= 30:
        parts.append(f"{domain.capitalize()} score is low")
    elif deficit >= 15:
        parts.append(f"{domain.capitalize()} could use a boost")
    if hours_this_week <= 0 and xp_this_week <= 0:
        if days_since_activity is not None and days_since_activity >= 7:
            parts.append(f"no {domain} activity in {days_since_activity} days")
        else:
            parts.append("no activity logged this week")
    elif hours_this_week <= 1 and domain in ("health", "skills", "relationships"):
        parts.append("limited time invested recently")
    if not parts:
        parts.append(f"good opportunity to strengthen {domain}")
    return " and ".join(parts) + "."


def get_recommendations(db: Session, limit: int = 5) -> list[dict]:
    """
    Return top recommended actions ranked by opportunity score.
    Each item: { action, domain, impact, reason }
    """
    deficits = _get_domain_deficits(db)
    hours_7d = _get_hours_per_domain_last_n_days(db, 7)
    xp_7d = _get_xp_per_domain_last_n_days(db, 7)

    # Domains with highest deficit first
    sorted_domains = sorted(deficits.keys(), key=lambda d: deficits[d], reverse=True)

    templates = db.query(ActionTemplate).all()
    if not templates:
        return []

    candidates = []
    for t in templates:
        deficit = deficits.get(t.domain, 50)
        hours = hours_7d.get(t.domain, 0)
        xp = xp_7d.get(t.domain, 0)
        days_since = _get_last_activity_days_ago(db, t.domain)

        time_cost = max(1, t.time_cost_minutes or 60)
        score_impact = t.estimated_score_impact or 1
        opportunity_score = (deficit * score_impact) / time_cost

        reason = _build_reason(t.domain, deficit, hours, xp, days_since)

        candidates.append({
            "action_template_id": str(t.id),
            "action": t.title,
            "domain": t.domain,
            "impact": round(opportunity_score, 1),
            "estimated_score_gain": t.estimated_score_impact or 0,
            "xp_reward": t.xp_reward or 0,
            "time_cost_minutes": t.time_cost_minutes or 0,
            "reason": reason,
            "opportunity_score": opportunity_score,
        })

    candidates.sort(key=lambda x: x["opportunity_score"], reverse=True)
    top = candidates[:limit]
    for c in top:
        del c["opportunity_score"]
    return top
