"""
Timeline Service - unified life timeline combining LifeEvent, XPEvent, Achievement, Experience.
"""
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from typing import List, Dict, Any
from app.models import LifeEvent, XPEvent, Achievement, Experience


def get_timeline(db: Session, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Get unified timeline of events sorted by date (most recent first).
    Combines: LifeEvent, XPEvent, Achievement, Experience
    """
    events: List[Dict[str, Any]] = []

    life_events = db.query(LifeEvent).order_by(desc(LifeEvent.date)).limit(limit).all()
    for e in life_events:
        events.append({
            "type": "life_event",
            "id": str(e.id),
            "timestamp": e.date,
            "title": e.title,
            "description": e.description,
            "domain": e.domain,
            "event_type": e.event_type,
            "xp_awarded": e.xp_awarded,
        })

    xp_events = db.query(XPEvent).order_by(desc(XPEvent.created_at)).limit(limit).all()
    for e in xp_events:
        events.append({
            "type": "xp_event",
            "id": str(e.id),
            "timestamp": e.created_at,
            "title": f"+{e.xp_amount} XP: {e.reason}",
            "description": None,
            "domain": e.domain,
            "event_type": "xp",
            "xp_awarded": e.xp_amount,
        })

    achievements = db.query(Achievement).order_by(desc(Achievement.date)).limit(limit).all()
    for e in achievements:
        events.append({
            "type": "achievement",
            "id": str(e.id),
            "timestamp": e.date,
            "title": e.title,
            "description": e.description,
            "domain": e.domain,
            "event_type": "achievement",
            "xp_awarded": e.xp_awarded or 0,
        })

    experiences = db.query(Experience).order_by(desc(Experience.date)).limit(limit).all()
    for e in experiences:
        events.append({
            "type": "experience",
            "id": str(e.id),
            "timestamp": e.date,
            "title": e.title,
            "description": e.description,
            "domain": e.domain if hasattr(e, 'domain') else None,
            "event_type": "experience",
            "xp_awarded": 0,
        })

    events.sort(key=lambda x: x["timestamp"] or datetime.min, reverse=True)
    return events[:limit]
