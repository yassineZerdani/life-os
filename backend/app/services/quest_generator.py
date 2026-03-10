"""
Quest Generator - creates short-term missions based on user data.

Generates quests when:
- Health score < 70 -> "Do 3 workouts this week"
- Skills activity low -> "Study for 5 hours this week"
- No relationship activity -> "Contact a friend"
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import Quest, DomainScore, TimeBlock, XPEvent


def _get_workouts_this_week(db: Session) -> int:
    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=now.weekday())
    blocks = (
        db.query(TimeBlock)
        .filter(
            TimeBlock.domain == "health",
            TimeBlock.start_time >= week_start,
        )
        .all()
    )
    return sum(1 for b in blocks if b.title and any(
        x in (b.title or "").lower() for x in ["workout", "gym", "run", "exercise"]
    ))


def _get_skills_hours_this_week(db: Session) -> float:
    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=now.weekday())
    result = (
        db.query(func.sum(TimeBlock.duration_minutes))
        .filter(
            TimeBlock.domain == "skills",
            TimeBlock.start_time >= week_start,
        )
        .scalar()
    )
    return (result or 0) / 60


def _get_relationship_activity_days(db: Session) -> int:
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=14)
    last = (
        db.query(TimeBlock)
        .filter(
            TimeBlock.domain == "relationships",
            TimeBlock.start_time >= cutoff,
        )
        .order_by(TimeBlock.start_time.desc())
        .first()
    )
    if not last or not last.start_time:
        return 999
    dt = last.start_time
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return (now - dt).days


def _get_domain_score(db: Session, domain: str) -> float:
    r = db.query(DomainScore).filter(DomainScore.domain == domain).first()
    return float(r.score or 0) if r else 0


def generate_quests(db: Session) -> list[Quest]:
    """
    Generate new quests based on user patterns.
    Does not create duplicates for same quest type.
    """
    now = datetime.now(timezone.utc)
    week_end = now + timedelta(days=7 - now.weekday())
    created = []

    health_score = _get_domain_score(db, "health")
    workouts_this_week = _get_workouts_this_week(db)
    skills_hours = _get_skills_hours_this_week(db)
    rel_days = _get_relationship_activity_days(db)

    existing_titles = {q.title for q in db.query(Quest).filter(Quest.completed == False).all()}

    if health_score < 70 and "Do 3 workouts this week" not in existing_titles:
        q = Quest(
            title="Do 3 workouts this week",
            description="Improve your health score with regular exercise.",
            domain="health",
            xp_reward=120,
            target_value=3,
            progress=min(3, workouts_this_week),
            deadline=week_end,
        )
        db.add(q)
        db.flush()
        created.append(q)

    if skills_hours < 2 and "Study for 5 hours this week" not in existing_titles:
        q = Quest(
            title="Study for 5 hours this week",
            description="Invest in your skills.",
            domain="skills",
            xp_reward=125,
            target_value=5,
            progress=skills_hours,
            deadline=week_end,
        )
        db.add(q)
        db.flush()
        created.append(q)

    if rel_days >= 7 and "Contact a friend" not in existing_titles:
        q = Quest(
            title="Contact a friend",
            description="Reach out to someone you care about.",
            domain="relationships",
            xp_reward=30,
            target_value=1,
            progress=0,
            deadline=now + timedelta(days=3),
        )
        db.add(q)
        db.flush()
        created.append(q)

    db.commit()
    return created


def get_active_quests(db: Session) -> list[Quest]:
    """Return non-completed quests."""
    return db.query(Quest).filter(Quest.completed == False).order_by(Quest.deadline).all()


def complete_quest(db: Session, quest_id: str) -> dict | None:
    """Mark quest completed and award XP."""
    import uuid
    quest = db.query(Quest).filter(Quest.id == uuid.UUID(quest_id)).first()
    if not quest or quest.completed:
        return None
    quest.completed = True
    quest.progress = quest.target_value
    db.flush()
    from app.services import xp_service
    xp_service.award_xp(
        db,
        domain=quest.domain or "identity",
        xp_amount=quest.xp_reward or 0,
        reason=f"Quest: {quest.title}",
        source_type="quest",
        source_id=quest.id,
    )
    db.commit()
    return {"xp_awarded": quest.xp_reward, "title": quest.title}
