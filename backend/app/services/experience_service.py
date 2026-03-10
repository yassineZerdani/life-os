from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import Experience
from app.schemas.experience import ExperienceCreate, ExperienceUpdate


def get_experiences(db: Session, limit: int = 50):
    return (
        db.query(Experience)
        .order_by(desc(Experience.date))
        .limit(limit)
        .all()
    )


def get_experience_by_id(db: Session, experience_id: int):
    return db.query(Experience).filter(Experience.id == experience_id).first()


def create_experience(db: Session, experience: ExperienceCreate):
    db_exp = Experience(**experience.model_dump())
    db.add(db_exp)
    db.flush()
    from app.services.graph_integration import create_nodes_for_experience
    create_nodes_for_experience(db, db_exp)
    db.commit()
    db.refresh(db_exp)
    return db_exp


def update_experience(db: Session, experience_id: int, experience: ExperienceUpdate):
    db_exp = get_experience_by_id(db, experience_id)
    if not db_exp:
        return None
    update_data = experience.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_exp, key, value)
    db.commit()
    db.refresh(db_exp)
    return db_exp


def delete_experience(db: Session, experience_id: int):
    db_exp = get_experience_by_id(db, experience_id)
    if db_exp:
        db.delete(db_exp)
        db.commit()
        return True
    return False
