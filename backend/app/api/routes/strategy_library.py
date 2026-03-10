"""Strategy Library and Protocol Engine API."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api.deps import get_db
from app.services.strategy_library_service import (
    list_all_strategies,
    list_strategies_by_domain,
    get_strategy_with_protocols,
    get_user_active_protocols,
    activate_protocol,
    deactivate_protocol,
    add_checkin,
    update_adherence,
)
from app.services.strategy_selection_engine import get_recommendations
from app.schemas.strategy_library import ProtocolCheckinCreate

router = APIRouter()


@router.get("")
def list_strategies(
    domain_key: str | None = Query(None),
    category: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """List all strategy library items, optionally filtered by domain/category."""
    strategies = list_all_strategies(db, domain_key=domain_key, category=category)
    return [
        {
            "id": str(s.id),
            "domain_key": s.domain_key,
            "module_key": s.module_key,
            "name": s.name,
            "category": s.category,
            "evidence_level": s.evidence_level,
            "impact_level": s.impact_level,
            "difficulty_level": s.difficulty_level,
            "description": s.description,
            "when_to_use": s.when_to_use,
            "contraindications": s.contraindications,
            "active": s.active,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in strategies
    ]


class ActivateProtocolBody(BaseModel):
    protocol_id: str


@router.get("/domains/{domain_key}")
def list_domain_strategies(
    domain_key: str,
    category: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """List strategies for a specific domain."""
    from app.models import StrategyProtocol
    strategies = list_strategies_by_domain(db, domain_key=domain_key, category=category)
    result = []
    for s in strategies:
        protocols = db.query(StrategyProtocol).filter(StrategyProtocol.strategy_id == s.id).all()
        result.append({
            "id": str(s.id),
            "domain_key": s.domain_key,
            "module_key": s.module_key,
            "name": s.name,
            "category": s.category,
            "evidence_level": s.evidence_level,
            "impact_level": s.impact_level,
            "difficulty_level": s.difficulty_level,
            "description": s.description,
            "when_to_use": s.when_to_use,
            "protocol_count": len(protocols),
        })
    return result


@router.get("/items/{strategy_id}")
def get_strategy_detail(strategy_id: str, db: Session = Depends(get_db)):
    """Get full strategy with protocols and steps."""
    data = get_strategy_with_protocols(db, strategy_id)
    if not data:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return data


@router.get("/recommendations")
def recommendations(
    limit: int = Query(10, ge=1, le=50),
    domain_key: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """Get ranked strategy recommendations from Selection Engine."""
    return get_recommendations(db, limit=limit, domain_key=domain_key)


@router.get("/protocols/active")
def active_protocols(db: Session = Depends(get_db)):
    """Get user's active protocols."""
    return get_user_active_protocols(db, active_only=True)


@router.post("/protocols/activate")
def activate_protocol_route(body: ActivateProtocolBody, db: Session = Depends(get_db)):
    """Activate a protocol for the user."""
    uap = activate_protocol(db, body.protocol_id)
    if not uap:
        raise HTTPException(status_code=404, detail="Protocol not found")
    return {
        "id": str(uap.id),
        "protocol_id": str(uap.protocol_id),
        "started_at": uap.started_at.isoformat() if uap.started_at else None,
        "active": uap.active,
    }


@router.post("/protocols/{user_active_protocol_id}/deactivate")
def deactivate_protocol_route(user_active_protocol_id: str, db: Session = Depends(get_db)):
    """Deactivate a protocol."""
    ok = deactivate_protocol(db, user_active_protocol_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Active protocol not found")
    return {"success": True}


@router.post("/protocols/{user_active_protocol_id}/checkin")
def protocol_checkin(
    user_active_protocol_id: str,
    body: ProtocolCheckinCreate,
    db: Session = Depends(get_db),
):
    """Record a protocol check-in."""
    checkin = add_checkin(
        db,
        user_active_protocol_id,
        body.completed_steps_json,
        body.adherence_value,
        body.notes,
    )
    if not checkin:
        raise HTTPException(status_code=404, detail="Active protocol not found")
    return {
        "id": str(checkin.id),
        "checked_at": checkin.checked_at.isoformat() if checkin.checked_at else None,
        "adherence_value": checkin.adherence_value,
    }


class AdherenceBody(BaseModel):
    score: float


@router.patch("/protocols/{user_active_protocol_id}/adherence")
def patch_adherence(
    user_active_protocol_id: str,
    body: AdherenceBody,
    db: Session = Depends(get_db),
):
    """Update adherence score for an active protocol."""
    ok = update_adherence(db, user_active_protocol_id, body.score)
    if not ok:
        raise HTTPException(status_code=404, detail="Active protocol not found")
    return {"success": True}
