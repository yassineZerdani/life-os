from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.models import Domain, Goal, MetricEntry, MetricDefinition, Experience, Achievement
from app.models import XPEvent, LifeEvent
from app.services.scoring_service import get_domain_scores_with_details, recalculate_all_domain_scores


def get_domain_scores(db: Session) -> List[Dict[str, Any]]:
    """Get domain scores from RPG scoring system."""
    scores = get_domain_scores_with_details(db)
    if not scores:
        recalculate_all_domain_scores(db)
        scores = get_domain_scores_with_details(db)
    return scores


def get_recent_activities(db: Session, limit: int = 10) -> List[Dict[str, Any]]:
    """Get recent events for dashboard."""
    events = []

    metric_entries = (
        db.query(MetricEntry, MetricDefinition)
        .join(MetricDefinition, MetricEntry.metric_id == MetricDefinition.id)
        .order_by(desc(MetricEntry.timestamp))
        .limit(limit)
        .all()
    )
    for entry, metric in metric_entries:
        events.append({
            "type": "metric",
            "id": str(entry.id),
            "timestamp": entry.timestamp,
            "title": f"{metric.name}: {entry.value} {metric.unit}",
            "domain": metric.domain,
        })

    experiences = db.query(Experience).order_by(desc(Experience.date)).limit(limit).all()
    for exp in experiences:
        events.append({
            "type": "experience",
            "id": str(exp.id),
            "timestamp": exp.date,
            "title": exp.title,
            "domain": None,
        })

    achievements = db.query(Achievement).order_by(desc(Achievement.date)).limit(limit).all()
    for ach in achievements:
        events.append({
            "type": "achievement",
            "id": str(ach.id),
            "timestamp": ach.date,
            "title": ach.title,
            "domain": ach.domain,
        })

    xp_events = db.query(XPEvent).order_by(desc(XPEvent.created_at)).limit(limit).all()
    for e in xp_events:
        events.append({
            "type": "xp_event",
            "id": str(e.id),
            "timestamp": e.created_at,
            "title": f"+{e.xp_amount} XP: {e.reason}",
            "domain": e.domain,
        })

    life_events = db.query(LifeEvent).order_by(desc(LifeEvent.date)).limit(limit).all()
    for e in life_events:
        events.append({
            "type": "life_event",
            "id": str(e.id),
            "timestamp": e.date,
            "title": e.title,
            "domain": e.domain,
        })

    events.sort(key=lambda x: x["timestamp"] or datetime.min, reverse=True)
    return events[:limit]


def get_metrics_trends(db: Session, days: int = 30) -> List[Dict[str, Any]]:
    """Get metric trends for dashboard charts."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    entries = (
        db.query(MetricEntry, MetricDefinition)
        .join(MetricDefinition, MetricEntry.metric_id == MetricDefinition.id)
        .filter(MetricEntry.timestamp >= cutoff)
        .order_by(MetricEntry.timestamp)
        .all()
    )

    by_metric: Dict = {}
    for entry, metric in entries:
        if metric.id not in by_metric:
            by_metric[metric.id] = {"name": metric.name, "unit": metric.unit, "data": []}
        by_metric[metric.id]["data"].append({
            "timestamp": entry.timestamp.isoformat() if entry.timestamp else None,
            "value": entry.value,
        })

    return list(by_metric.values())


def get_goals_progress(db: Session) -> List[Dict[str, Any]]:
    """Get active goals with progress for dashboard."""
    goals = (
        db.query(Goal)
        .filter(Goal.status == "active")
        .order_by(desc(Goal.deadline))
        .limit(10)
        .all()
    )

    return [
        {
            "id": g.id,
            "title": g.title,
            "progress": g.progress,
            "target_value": g.target_value,
            "target_unit": g.target_unit,
            "deadline": g.deadline.isoformat() if g.deadline else None,
            "domain_id": g.domain_id,
        }
        for g in goals
    ]
