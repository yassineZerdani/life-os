"""Control Room API - aggregated dashboard endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.control_room_service import (
    get_control_room_summary,
    get_control_room_alerts,
    get_control_room_recommendations,
    get_control_room_forecast,
    get_control_room_full,
)

router = APIRouter()


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    """Global life score hero and domain command cards."""
    return get_control_room_summary(db)


@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    """Urgent alerts and warnings."""
    return get_control_room_alerts(db)


@router.get("/recommendations")
def get_recommendations(
    limit: int = 5,
    db: Session = Depends(get_db),
):
    """Top recommended actions from Life Decision Engine."""
    return get_control_room_recommendations(db, limit=limit)


@router.get("/forecast")
def get_forecast(
    months: int = 6,
    db: Session = Depends(get_db),
):
    """Future simulation preview."""
    return get_control_room_forecast(db, months=months)


@router.get("/full")
def get_full(db: Session = Depends(get_db)):
    """Full control room payload - all panels in one request."""
    return get_control_room_full(db)
