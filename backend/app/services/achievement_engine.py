"""
Achievement Engine - evaluates conditions and unlocks achievements.

Supports condition expressions like:
- workout_count >= 1
- learning_hours >= 100
- domain_level.health >= 5
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import (
    AchievementDefinition,
    AchievementUnlock,
    TimeBlock,
    XPEvent,
    DomainScore,
    MetricEntry,
    MetricDefinition,
)
from app.services import xp_service
from app.services.scoring_service import xp_required_for_level


def _get_context(db: Session) -> dict:
    """Compute all values used in condition expressions."""
    now = datetime.now(timezone.utc)
    cutoff_7d = now - timedelta(days=7)
    cutoff_30d = now - timedelta(days=30)
    cutoff_all = now - timedelta(days=365 * 10)

    workout_count = 0
    learning_hours = 0.0
    xp_total: dict[str, float] = {}
    domain_level: dict[str, int] = {}
    saving_amount = 0.0

    for row in (
        db.query(TimeBlock.domain, TimeBlock.title, TimeBlock.duration_minutes)
        .filter(TimeBlock.start_time >= cutoff_all)
        .all()
    ):
        if row.title and ("workout" in row.title.lower() or "gym" in row.title.lower() or "run" in row.title.lower()):
            workout_count += 1
        if row.domain == "skills":
            learning_hours += (row.duration_minutes or 0) / 60

    for row in db.query(XPEvent.domain, func.sum(XPEvent.xp_amount)).group_by(XPEvent.domain).all():
        xp_total[row.domain] = row[1] or 0

    for r in db.query(DomainScore).all():
        domain_level[r.domain] = r.level or 1

    metrics = db.query(MetricDefinition).filter(MetricDefinition.domain == "wealth").all()
    for m in metrics:
        if "sav" in m.name.lower() or "net" in m.name.lower():
            last = db.query(MetricEntry).filter(MetricEntry.metric_id == m.id).order_by(MetricEntry.timestamp.desc()).first()
            if last:
                saving_amount = max(saving_amount, last.value or 0)

    return {
        "workout_count": workout_count,
        "learning_hours": round(learning_hours, 1),
        "domain_level": domain_level,
        "xp_total": xp_total,
        "saving_amount": saving_amount,
    }


def _evaluate_condition(expr: str, ctx: dict) -> bool:
    """Simple condition evaluator. Supports: var >= N, var <= N, var == N, domain_level.domain >= N."""
    expr = expr.strip()
    for op in [">=", "<=", "==", ">", "<"]:
        if op in expr:
            left, right = expr.split(op, 1)
            left = left.strip()
            right = right.strip()
            if "." in left:
                parts = left.split(".")
                if parts[0] == "domain_level" and len(parts) == 2:
                    val = ctx.get("domain_level", {}).get(parts[1], 0)
                else:
                    val = 0
            else:
                val = ctx.get(left, 0)
            try:
                rhs = float(right)
            except ValueError:
                rhs = 0
            if op == ">=":
                return val >= rhs
            if op == "<=":
                return val <= rhs
            if op == "==":
                return val == rhs
            if op == ">":
                return val > rhs
            if op == "<":
                return val < rhs
    return False


def run_achievement_engine(db: Session) -> list[dict]:
    """
    Evaluate all achievement definitions and unlock any that are satisfied.
    Returns list of newly unlocked achievements with notification info.
    """
    ctx = _get_context(db)
    unlocked_ids = {u.achievement_id for u in db.query(AchievementUnlock).all()}
    newly_unlocked = []

    for defn in db.query(AchievementDefinition).all():
        if defn.id in unlocked_ids:
            continue
        if _evaluate_condition(defn.condition_expression, ctx):
            unlock = AchievementUnlock(achievement_id=defn.id)
            db.add(unlock)
            db.flush()
            xp_service.award_xp(
                db,
                domain=defn.domain or "identity",
                xp_amount=defn.xp_reward or 0,
                reason=f"Achievement: {defn.title}",
                source_type="achievement_unlock",
                source_id=defn.id,
            )
            newly_unlocked.append({
                "id": str(unlock.id),
                "title": defn.title,
                "xp_reward": defn.xp_reward,
                "message": f"🏆 Achievement unlocked: {defn.title} (+{int(defn.xp_reward or 0)} XP)",
            })
            unlocked_ids.add(defn.id)

    db.commit()
    return newly_unlocked


def get_unlocked_achievements(db: Session, limit: int = 50) -> list[dict]:
    """Return unlocked achievements with definition details."""
    unlocks = (
        db.query(AchievementUnlock, AchievementDefinition)
        .join(AchievementDefinition, AchievementUnlock.achievement_id == AchievementDefinition.id)
        .order_by(AchievementUnlock.unlocked_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": str(u.id),
            "title": d.title,
            "description": d.description,
            "domain": d.domain,
            "xp_reward": d.xp_reward,
            "unlocked_at": u.unlocked_at.isoformat() if u.unlocked_at else None,
        }
        for u, d in unlocks
    ]
