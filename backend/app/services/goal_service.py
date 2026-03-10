from sqlalchemy.orm import Session
from app.models import Goal
from app.schemas.goal import GoalCreate, GoalUpdate


def get_goals(db: Session, domain_id: int | None = None, status: str | None = None):
    q = db.query(Goal)
    if domain_id:
        q = q.filter(Goal.domain_id == domain_id)
    if status:
        q = q.filter(Goal.status == status)
    return q.order_by(Goal.created_at.desc()).all()


def get_goal_by_id(db: Session, goal_id: int):
    return db.query(Goal).filter(Goal.id == goal_id).first()


def create_goal(db: Session, goal: GoalCreate):
    db_goal = Goal(**goal.model_dump())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


def update_goal(db: Session, goal_id: int, goal: GoalUpdate):
    db_goal = get_goal_by_id(db, goal_id)
    if not db_goal:
        return None
    update_data = goal.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_goal, key, value)
    db.commit()
    db.refresh(db_goal)
    return db_goal


def delete_goal(db: Session, goal_id: int):
    db_goal = get_goal_by_id(db, goal_id)
    if db_goal:
        db.delete(db_goal)
        db.commit()
        return True
    return False
