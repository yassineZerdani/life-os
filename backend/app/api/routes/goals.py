from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse
from app.services import goal_service

router = APIRouter()


@router.get("", response_model=list[GoalResponse])
def list_goals(
    domain_id: int | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db)
):
    return goal_service.get_goals(db, domain_id, status)


@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = goal_service.get_goal_by_id(db, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.post("", response_model=GoalResponse)
def create_goal(goal: GoalCreate, db: Session = Depends(get_db)):
    return goal_service.create_goal(db, goal)


@router.patch("/{goal_id}", response_model=GoalResponse)
def update_goal(goal_id: int, goal: GoalUpdate, db: Session = Depends(get_db)):
    result = goal_service.update_goal(db, goal_id, goal)
    if not result:
        raise HTTPException(status_code=404, detail="Goal not found")
    return result


@router.delete("/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    if not goal_service.delete_goal(db, goal_id):
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"ok": True}
