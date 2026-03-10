from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.analytics_service import (
    get_time_distribution,
    get_weekly_balance,
    get_daily_heatmap_data,
)

router = APIRouter()


@router.get("/time-distribution")
def time_distribution(
    start_date: str = Query(..., description="ISO date YYYY-MM-DD"),
    end_date: str = Query(..., description="ISO date YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    """Total hours per domain for date range."""
    start_dt = datetime.fromisoformat(start_date)
    end_dt = datetime.fromisoformat(end_date + "T23:59:59")
    return get_time_distribution(db, start_dt, end_dt)


@router.get("/weekly-balance")
def weekly_balance(
    start_date: str = Query(..., description="ISO date YYYY-MM-DD"),
    end_date: str = Query(..., description="ISO date YYYY-MM-DD"),
    weeks: int = Query(12, le=52),
    db: Session = Depends(get_db),
):
    """Weekly domain distribution."""
    start_dt = datetime.fromisoformat(start_date)
    end_dt = datetime.fromisoformat(end_date + "T23:59:59")
    return get_weekly_balance(db, start_dt, end_dt, weeks)


@router.get("/daily-heatmap")
def daily_heatmap(
    start_date: str = Query(..., description="ISO date YYYY-MM-DD"),
    end_date: str = Query(..., description="ISO date YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    """Daily activity intensity for heatmap."""
    start_dt = datetime.fromisoformat(start_date)
    end_dt = datetime.fromisoformat(end_date + "T23:59:59")
    return get_daily_heatmap_data(db, start_dt, end_dt)
