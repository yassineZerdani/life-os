"""
Strategy Engine - recommends strategies based on domain deficits,
tracks adherence, and computes strategy effectiveness.
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models import Strategy, StrategyStep, UserStrategy, DomainScore, TimeBlock, XPEvent


def _get_domain_deficits(db: Session) -> dict[str, float]:
    """Domain deficit = 100 - score. Higher deficit = more need."""
    scores = db.query(DomainScore).all()
    return {r.domain: max(0, 100 - float(r.score or 0)) for r in scores}


def get_all_strategies(db: Session) -> list[Strategy]:
    """Return all strategies with steps."""
    return db.query(Strategy).order_by(Strategy.domain, Strategy.name).all()


def get_recommended_strategies(db: Session, limit: int = 10) -> list[dict]:
    """
    Recommend strategies based on domain deficits.
    Prioritizes domains with highest deficit.
    """
    deficits = _get_domain_deficits(db)
    strategies = get_all_strategies(db)

    if not strategies:
        return []

    scored = []
    for s in strategies:
        deficit = deficits.get(s.domain, 50)
        impact = float(s.estimated_impact or 0)
        score = deficit * (1 + impact / 100)
        scored.append((score, s))

    scored.sort(key=lambda x: x[0], reverse=True)

    result = []
    for _, s in scored[:limit]:
        steps = db.query(StrategyStep).filter(StrategyStep.strategy_id == s.id).order_by(StrategyStep.id).all()
        result.append({
            "id": str(s.id),
            "domain": s.domain,
            "name": s.name,
            "description": s.description,
            "difficulty": s.difficulty,
            "estimated_impact": s.estimated_impact,
            "steps": [
                {
                    "id": str(st.id),
                    "title": st.title,
                    "description": st.description,
                    "frequency": st.frequency,
                    "xp_reward": st.xp_reward,
                }
                for st in steps
            ],
        })
    return result


def activate_strategy(db: Session, strategy_id: str) -> UserStrategy | None:
    """Activate a strategy for the user."""
    import uuid
    try:
        sid = uuid.UUID(strategy_id)
    except ValueError:
        return None

    strategy = db.query(Strategy).filter(Strategy.id == sid).first()
    if not strategy:
        return None

    existing = db.query(UserStrategy).filter(
        UserStrategy.strategy_id == sid,
        UserStrategy.active == True,
    ).first()
    if existing:
        return existing

    us = UserStrategy(strategy_id=sid, active=True, adherence_score=0)
    db.add(us)
    db.commit()
    db.refresh(us)
    return us


def deactivate_strategy(db: Session, user_strategy_id: str) -> bool:
    """Deactivate a user strategy."""
    import uuid
    try:
        uid = uuid.UUID(user_strategy_id)
    except ValueError:
        return False

    us = db.query(UserStrategy).filter(UserStrategy.id == uid).first()
    if not us:
        return False
    us.active = False
    db.commit()
    return True


def get_active_user_strategies(db: Session) -> list[dict]:
    """Return all active user strategies with strategy details."""
    rows = (
        db.query(UserStrategy, Strategy)
        .join(Strategy, UserStrategy.strategy_id == Strategy.id)
        .filter(UserStrategy.active == True)
        .all()
    )

    result = []
    for us, s in rows:
        steps = db.query(StrategyStep).filter(StrategyStep.strategy_id == s.id).all()
        result.append({
            "id": str(us.id),
            "strategy_id": str(s.id),
            "domain": s.domain,
            "name": s.name,
            "description": s.description,
            "started_at": us.started_at.isoformat() if us.started_at else None,
            "adherence_score": us.adherence_score or 0,
            "steps": [
                {
                    "id": str(st.id),
                    "title": st.title,
                    "frequency": st.frequency,
                    "xp_reward": st.xp_reward,
                }
                for st in steps
            ],
        })
    return result


def update_adherence(db: Session, user_strategy_id: str, score: float) -> bool:
    """Update adherence score for a user strategy (0-100)."""
    import uuid
    try:
        uid = uuid.UUID(user_strategy_id)
    except ValueError:
        return False

    us = db.query(UserStrategy).filter(UserStrategy.id == uid).first()
    if not us:
        return False
    us.adherence_score = min(100, max(0, score))
    db.commit()
    return True


def compute_adherence(db: Session, user_strategy: UserStrategy) -> float:
    """
    Compute adherence score based on recent activity.
    Uses TimeBlock and XPEvent for the strategy's domain.
    """
    strategy = db.query(Strategy).filter(Strategy.id == user_strategy.strategy_id).first()
    if not strategy:
        return 0

    domain = strategy.domain
    steps = db.query(StrategyStep).filter(StrategyStep.strategy_id == strategy.id).all()
    if not steps:
        return 50  # neutral if no steps

    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=7)

    # Simple heuristic: activity in domain this week
    tb_hours = (
        db.query(func.sum(TimeBlock.duration_minutes))
        .filter(
            TimeBlock.domain == domain,
            TimeBlock.start_time >= week_start,
        )
        .scalar() or 0
    ) / 60

    xp_week = (
        db.query(func.sum(XPEvent.xp_amount))
        .filter(
            XPEvent.domain == domain,
            XPEvent.created_at >= week_start,
        )
        .scalar() or 0
    )

    # Target: ~3h/week or 50 XP for "active" adherence
    target_hours = 3
    target_xp = 50
    hour_score = min(100, (tb_hours / target_hours) * 50) if target_hours > 0 else 0
    xp_score = min(100, (xp_week / target_xp) * 50) if target_xp > 0 else 0
    return min(100, (hour_score + xp_score) / 2)
