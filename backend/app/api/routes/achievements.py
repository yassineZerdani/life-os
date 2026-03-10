from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.achievement import AchievementCreate, AchievementUpdate, AchievementResponse
from app.services import achievement_service

router = APIRouter()


@router.get("", response_model=list[AchievementResponse])
def list_achievements(
    domain: str | None = Query(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    return achievement_service.get_achievements(db, domain, limit)


@router.get("/{achievement_id}", response_model=AchievementResponse)
def get_achievement(achievement_id: str, db: Session = Depends(get_db)):
    ach = achievement_service.get_achievement_by_id(db, achievement_id)
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement not found")
    return ach


@router.post("", response_model=AchievementResponse)
def create_achievement(achievement: AchievementCreate, db: Session = Depends(get_db)):
    return achievement_service.create_achievement(db, achievement)


@router.patch("/{achievement_id}", response_model=AchievementResponse)
def update_achievement(achievement_id: str, achievement: AchievementUpdate, db: Session = Depends(get_db)):
    result = achievement_service.update_achievement(db, achievement_id, achievement)
    if not result:
        raise HTTPException(status_code=404, detail="Achievement not found")
    return result


@router.delete("/{achievement_id}")
def delete_achievement(achievement_id: str, db: Session = Depends(get_db)):
    if not achievement_service.delete_achievement(db, achievement_id):
        raise HTTPException(status_code=404, detail="Achievement not found")
    return {"ok": True}
