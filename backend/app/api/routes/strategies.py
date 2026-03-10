"""Strategy API - list, recommend, activate."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.strategy_engine import (
    get_all_strategies,
    get_recommended_strategies,
    activate_strategy,
    get_active_user_strategies,
)
from app.schemas.strategy import UserStrategyActivate

router = APIRouter()


@router.get("")
def list_strategies(db: Session = Depends(get_db)):
    """Return all strategies with steps."""
    strategies = get_all_strategies(db)
    return [
        {
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
                for st in s.steps
            ],
        }
        for s in strategies
    ]


@router.get("/recommended")
def recommended_strategies(
    limit: int = 10,
    db: Session = Depends(get_db),
):
    """Return recommended strategies based on domain deficits."""
    return get_recommended_strategies(db, limit=limit)


@router.get("/active")
def active_strategies(db: Session = Depends(get_db)):
    """Return user's active strategies."""
    return get_active_user_strategies(db)


@router.post("/activate")
def activate(body: UserStrategyActivate, db: Session = Depends(get_db)):
    """Activate a strategy for the user."""
    us = activate_strategy(db, body.strategy_id)
    if not us:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return {
        "id": str(us.id),
        "strategy_id": str(us.strategy_id),
        "started_at": us.started_at.isoformat() if us.started_at else None,
        "active": us.active,
    }
