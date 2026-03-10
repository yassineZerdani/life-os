"""
XP Service - handles XP rewards and level progression.

XP requirement formula: xp_required = 100 * level^1.5
When XP exceeds requirement: increase level, subtract required XP, keep remaining.
Each domain levels independently.
"""
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import XPEvent, DomainScore
from app.services.scoring_service import xp_required_for_level, update_domain_score_record, compute_domain_score


XP_AMOUNTS = {
    "gym_session": 40,
    "learning_1h": 25,
    "saving_money": 20,
    "networking_event": 30,
    "meaningful_conversation": 30,
    "travel_experience": 40,
    "career_milestone": 50,
}


def award_xp(
    db: Session,
    domain: str,
    xp_amount: float,
    reason: str,
    source_type: str,
    source_id=None,
) -> XPEvent:
    """Award XP to a domain. Creates XPEvent and updates DomainScore."""
    event = XPEvent(
        domain=domain,
        xp_amount=xp_amount,
        reason=reason,
        source_type=source_type,
        source_id=source_id,
    )
    db.add(event)
    db.flush()

    record = db.query(DomainScore).filter(DomainScore.domain == domain).first()
    if not record:
        score = compute_domain_score(db, domain)
        record = update_domain_score_record(db, domain, score, add_xp=0)

    old_level = record.level
    new_record = update_domain_score_record(db, domain, record.score, add_xp=xp_amount)
    if new_record.level > old_level:
        from app.services.insight_engine import _rule_level_up
        _rule_level_up(db, domain, new_record.level)
        db.commit()

    db.refresh(event)
    return event


def get_xp_events(db: Session, domain: str | None = None, limit: int = 50) -> list:
    """Get recent XP events."""
    q = db.query(XPEvent).order_by(desc(XPEvent.created_at)).limit(limit)
    if domain:
        q = q.filter(XPEvent.domain == domain)
    return q.all()


def get_xp_growth_by_domain(db: Session, domain: str, days: int = 30) -> list[dict]:
    """Get cumulative XP over time for charting."""
    from datetime import datetime, timedelta

    cutoff = datetime.utcnow() - timedelta(days=days)
    events = (
        db.query(XPEvent)
        .filter(XPEvent.domain == domain, XPEvent.created_at >= cutoff)
        .order_by(XPEvent.created_at)
        .all()
    )

    cumulative = 0
    result = []
    for e in events:
        cumulative += e.xp_amount
        result.append({
            "timestamp": e.created_at.isoformat() if e.created_at else None,
            "xp": e.xp_amount,
            "cumulative": cumulative,
        })
    return result
