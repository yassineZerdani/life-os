from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import LifeEvent
from app.schemas.life_event import LifeEventCreate, LifeEventUpdate
from app.services.xp_service import award_xp


def get_life_events(db: Session, domain: str | None = None, limit: int = 50):
    q = db.query(LifeEvent).order_by(desc(LifeEvent.date)).limit(limit)
    if domain:
        q = q.filter(LifeEvent.domain == domain)
    return q.all()


def get_life_event_by_id(db: Session, event_id):
    import uuid
    return db.query(LifeEvent).filter(LifeEvent.id == uuid.UUID(str(event_id))).first()


def create_life_event(db: Session, event: LifeEventCreate):
    db_event = LifeEvent(**event.model_dump())
    db.add(db_event)
    db.flush()

    if event.xp_awarded and event.xp_awarded > 0:
        award_xp(
            db, event.domain, event.xp_awarded,
            reason=event.title,
            source_type="life_event",
            source_id=db_event.id,
        )

    db.commit()
    db.refresh(db_event)
    return db_event


def update_life_event(db: Session, event_id, event: LifeEventUpdate):
    db_event = get_life_event_by_id(db, event_id)
    if not db_event:
        return None
    update_data = event.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)
    db.commit()
    db.refresh(db_event)
    return db_event


def delete_life_event(db: Session, event_id: str):
    db_event = get_life_event_by_id(db, event_id)
    if db_event:
        db.delete(db_event)
        db.commit()
        return True
    return False
