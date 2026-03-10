from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services.achievement_engine import run_achievement_engine, get_unlocked_achievements

router = APIRouter()


@router.get("/unlocked")
def list_unlocked_achievements(
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    """Return unlocked achievements (gamified milestones)."""
    return get_unlocked_achievements(db, limit=limit)


@router.post("/evaluate")
def evaluate_achievements(db: Session = Depends(get_db)):
    """Run achievement engine and return newly unlocked (for notifications)."""
    newly = run_achievement_engine(db)
    return {"newly_unlocked": newly}
