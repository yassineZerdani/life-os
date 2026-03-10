from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services import timeline_service

router = APIRouter()


@router.get("")
def get_timeline(
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    """Unified timeline combining LifeEvent, Experience, Achievement, XPEvent."""
    return timeline_service.get_timeline(db, limit)
