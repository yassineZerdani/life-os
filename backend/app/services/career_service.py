"""
Life Work Engine service: dashboard aggregation, leverage recommendation, energy insights.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import (
    LifeWorkMission,
    LifeWorkMilestone,
    LifeWorkAchievement,
    LifeWorkOpportunity,
    CareerLeverage,
    EnergyPattern,
)

LEVERAGE_AREAS = ["skills", "reputation", "network", "assets_projects"]
DEFAULT_SCORE = 5.0


def get_or_create_leverage(db: Session, user_id: int) -> list[CareerLeverage]:
    """Return one row per area, creating with default score if missing."""
    existing = {r.area: r for r in db.query(CareerLeverage).filter(CareerLeverage.user_id == user_id).all()}
    result = []
    for area in LEVERAGE_AREAS:
        if area in existing:
            result.append(existing[area])
        else:
            row = CareerLeverage(user_id=user_id, area=area, score=DEFAULT_SCORE)
            db.add(row)
            result.append(row)
    db.commit()
    for r in result:
        db.refresh(r)
    return result


def get_weakest_leverage(rows: list[CareerLeverage]) -> str | None:
    if not rows:
        return None
    return min(rows, key=lambda x: x.score).area


def get_recommended_leverage_action(area: str) -> str:
    actions = {
        "skills": "Invest in deliberate practice or a course to level up this lever.",
        "reputation": "Ship something visible, write, or speak to build credibility.",
        "network": "Reach out to 2–3 people who could open doors or collaborate.",
        "assets_projects": "Create or polish one project that compounds over time.",
    }
    return actions.get(area, "Focus on this area to increase career leverage.")


def get_energy_insights(db: Session, user_id: int, limit: int = 5) -> list[str]:
    """Turn energy patterns into readable insights."""
    patterns = (
        db.query(EnergyPattern)
        .filter(EnergyPattern.user_id == user_id)
        .order_by(EnergyPattern.recorded_at.desc())
        .limit(20)
        .all()
    )
    insights = []
    seen = set()
    for p in patterns:
        key = (p.work_type, p.energy_effect)
        if key in seen:
            continue
        seen.add(key)
        work_label = p.work_type.replace("_", " ").title()
        if p.energy_effect == "energizes":
            insights.append(f"{work_label} gives you high energy" + (f" and {p.focus_quality} focus." if p.focus_quality else "."))
        elif p.energy_effect == "drains":
            insights.append(f"{work_label} consistently drains you.")
        if len(insights) >= limit:
            break
    return insights
