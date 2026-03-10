"""Quest service - CRUD and progress updates."""
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models import Quest, TimeBlock


def get_active_quests(db: Session) -> list[Quest]:
    """Return non-completed quests."""
    return db.query(Quest).filter(Quest.completed == False).order_by(Quest.deadline).all()


def update_quest_progress(db: Session) -> None:
    """Update quest progress based on recent activity."""
    now = datetime.now(timezone.utc)
    from datetime import timedelta
    week_start = now.replace(hour=0, minute=0, second=0) - timedelta(days=now.weekday())
    quests = db.query(Quest).filter(Quest.completed == False).all()

    for q in quests:
        if "workout" in (q.title or "").lower():
            blocks = db.query(TimeBlock).filter(
                TimeBlock.domain == "health",
                TimeBlock.start_time >= week_start,
            ).all()
            count = sum(1 for b in blocks if b.title and any(
                x in (b.title or "").lower() for x in ["workout", "gym", "run", "exercise"]
            ))
            q.progress = min(q.target_value, count)
        elif "study" in (q.title or "").lower() or "hour" in (q.title or "").lower():
            result = db.query(TimeBlock).filter(
                TimeBlock.domain == "skills",
                TimeBlock.start_time >= week_start,
            ).all()
            hours = sum((b.duration_minutes or 0) / 60 for b in result)
            q.progress = min(q.target_value, round(hours, 1))
        elif "contact" in (q.title or "").lower() or "friend" in (q.title or "").lower():
            blocks = db.query(TimeBlock).filter(
                TimeBlock.domain == "relationships",
                TimeBlock.start_time >= week_start,
            ).count()
            q.progress = 1 if blocks > 0 else 0
    db.commit()
