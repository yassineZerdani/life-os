import uuid
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import Achievement
from app.schemas.achievement import AchievementCreate, AchievementUpdate


def get_achievements(db: Session, domain: str | None = None, limit: int = 50):
    q = db.query(Achievement)
    if domain:
        q = q.filter(Achievement.domain == domain)
    return q.order_by(desc(Achievement.date)).limit(limit).all()


def get_achievement_by_id(db: Session, achievement_id: str):
    return db.query(Achievement).filter(Achievement.id == uuid.UUID(str(achievement_id))).first()


def create_achievement(db: Session, achievement: AchievementCreate):
    db_ach = Achievement(**achievement.model_dump())
    db.add(db_ach)
    db.flush()
    from app.services.graph_integration import create_node_for_achievement
    create_node_for_achievement(db, db_ach)
    db.commit()
    db.refresh(db_ach)
    return db_ach


def update_achievement(db: Session, achievement_id: str, achievement: AchievementUpdate):
    db_ach = get_achievement_by_id(db, achievement_id)
    if not db_ach:
        return None
    update_data = achievement.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_ach, key, value)
    db.commit()
    db.refresh(db_ach)
    return db_ach


def delete_achievement(db: Session, achievement_id: str):
    db_ach = get_achievement_by_id(db, achievement_id)
    if db_ach:
        db.delete(db_ach)
        db.commit()
        return True
    return False
