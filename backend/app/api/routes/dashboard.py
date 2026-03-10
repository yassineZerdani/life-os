from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services import dashboard_service

router = APIRouter()


@router.get("/scores")
def get_domain_scores(db: Session = Depends(get_db)):
    return dashboard_service.get_domain_scores(db)


@router.get("/recent-activities")
def get_recent_activities(
    limit: int = Query(10, le=50),
    db: Session = Depends(get_db)
):
    return dashboard_service.get_recent_activities(db, limit)


@router.get("/metrics-trends")
def get_metrics_trends(
    days: int = Query(30, le=365),
    db: Session = Depends(get_db)
):
    return dashboard_service.get_metrics_trends(db, days)


@router.get("/goals-progress")
def get_goals_progress(db: Session = Depends(get_db)):
    return dashboard_service.get_goals_progress(db)


@router.get("/xp-growth")
def get_xp_growth(
    domain: str = Query(...),
    days: int = Query(30, le=365),
    db: Session = Depends(get_db),
):
    from app.services import xp_service
    return xp_service.get_xp_growth_by_domain(db, domain, days)
