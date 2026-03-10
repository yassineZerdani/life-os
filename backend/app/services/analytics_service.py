"""
Analytics Service - time distribution and balance queries.

Structured for reuse by future AI insight features.
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import TimeBlock


def get_time_distribution(
    db: Session,
    start_date: datetime,
    end_date: datetime,
) -> dict[str, float]:
    """
    Return total hours per domain for a date range.
    Values are in hours.
    """
    result = (
        db.query(TimeBlock.domain, func.sum(TimeBlock.duration_minutes).label('total'))
        .filter(
            TimeBlock.start_time >= start_date,
            TimeBlock.start_time <= end_date,
        )
        .group_by(TimeBlock.domain)
        .all()
    )
    return {row.domain: round(row.total / 60, 1) for row in result}


def get_weekly_balance(
    db: Session,
    start_date: datetime,
    end_date: datetime,
    weeks: int = 12,
) -> list[dict]:
    """
    Return weekly domain distribution.
    Each item: { "week": "2026-W10", "health": 5, "career": 38, ... }
    Values are in hours.
    """
    from sqlalchemy import cast, Date

    week_start = func.date_trunc('week', TimeBlock.start_time)
    rows = (
        db.query(
            week_start.label('week_start'),
            TimeBlock.domain,
            func.sum(TimeBlock.duration_minutes).label('total'),
        )
        .filter(
            TimeBlock.start_time >= start_date,
            TimeBlock.start_time <= end_date,
        )
        .group_by(week_start, TimeBlock.domain)
        .order_by(week_start)
        .limit(weeks * 10)
        .all()
    )

    by_week: dict[str, dict] = {}
    for row in rows:
        dt = row.week_start
        if hasattr(dt, 'isocalendar'):
            y, w, _ = dt.isocalendar()
            week_str = f"{y}-W{w:02d}"
        else:
            week_str = str(dt)[:10]
        if week_str not in by_week:
            by_week[week_str] = {'week': week_str}
        by_week[week_str][row.domain] = round(row.total / 60, 1)

    return sorted(by_week.values(), key=lambda x: x['week'])


def get_daily_heatmap_data(
    db: Session,
    start_date: datetime,
    end_date: datetime,
) -> list[dict]:
    """
    Return daily total minutes for heatmap.
    Each item: { "date": "2026-03-08", "total_minutes": 480, "domains": {...} }
    """
    day_trunc = func.date_trunc('day', TimeBlock.start_time)
    result = (
        db.query(
            day_trunc.label('day'),
            TimeBlock.domain,
            func.sum(TimeBlock.duration_minutes).label('total'),
        )
        .filter(
            TimeBlock.start_time >= start_date,
            TimeBlock.start_time <= end_date,
        )
        .group_by(day_trunc, TimeBlock.domain)
        .all()
    )

    by_date: dict[str, dict] = {}
    for row in result:
        dt = row.day
        day_str = dt.strftime('%Y-%m-%d') if hasattr(dt, 'strftime') else str(dt)[:10]
        if day_str not in by_date:
            by_date[day_str] = {'date': day_str, 'total_minutes': 0, 'domains': {}}
        by_date[day_str]['total_minutes'] += row.total
        by_date[day_str]['domains'][row.domain] = round(row.total / 60, 1)

    return sorted(by_date.values(), key=lambda x: x['date'])
