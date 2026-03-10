from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.scoring_service import get_life_score

router = APIRouter()


@router.get("")
def get_life_score_endpoint(db: Session = Depends(get_db)):
    """LifeScore = average(all domain scores). Returns 0-100."""
    score = get_life_score(db)
    return {"life_score": round(score, 1)}
