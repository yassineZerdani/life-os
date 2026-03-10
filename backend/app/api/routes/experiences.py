from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.experience import ExperienceCreate, ExperienceUpdate, ExperienceResponse
from app.services import experience_service

router = APIRouter()


@router.get("", response_model=list[ExperienceResponse])
def list_experiences(
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    return experience_service.get_experiences(db, limit)


@router.get("/{experience_id}", response_model=ExperienceResponse)
def get_experience(experience_id: int, db: Session = Depends(get_db)):
    exp = experience_service.get_experience_by_id(db, experience_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    return exp


@router.post("", response_model=ExperienceResponse)
def create_experience(experience: ExperienceCreate, db: Session = Depends(get_db)):
    return experience_service.create_experience(db, experience)


@router.patch("/{experience_id}", response_model=ExperienceResponse)
def update_experience(experience_id: int, experience: ExperienceUpdate, db: Session = Depends(get_db)):
    result = experience_service.update_experience(db, experience_id, experience)
    if not result:
        raise HTTPException(status_code=404, detail="Experience not found")
    return result


@router.delete("/{experience_id}")
def delete_experience(experience_id: int, db: Session = Depends(get_db)):
    if not experience_service.delete_experience(db, experience_id):
        raise HTTPException(status_code=404, detail="Experience not found")
    return {"ok": True}
