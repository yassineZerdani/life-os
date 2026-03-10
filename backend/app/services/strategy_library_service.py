"""
Strategy Library Service - CRUD and queries for strategy library items and protocols.
"""
from sqlalchemy.orm import Session
import uuid

from app.models import (
    StrategyLibraryItem,
    StrategyProtocol,
    ProtocolStep,
    UserActiveProtocol,
    ProtocolCheckin,
)


def get_strategy_by_id(db: Session, strategy_id: str) -> StrategyLibraryItem | None:
    try:
        sid = uuid.UUID(strategy_id)
    except ValueError:
        return None
    return db.query(StrategyLibraryItem).filter(StrategyLibraryItem.id == sid).first()


def get_protocol_by_id(db: Session, protocol_id: str) -> StrategyProtocol | None:
    try:
        pid = uuid.UUID(protocol_id)
    except ValueError:
        return None
    return db.query(StrategyProtocol).filter(StrategyProtocol.id == pid).first()


def list_strategies_by_domain(
    db: Session,
    domain_key: str,
    category: str | None = None,
    active_only: bool = True,
) -> list[StrategyLibraryItem]:
    q = db.query(StrategyLibraryItem).filter(
        StrategyLibraryItem.domain_key == domain_key,
        StrategyLibraryItem.active == True if active_only else StrategyLibraryItem.active,
    )
    if category:
        q = q.filter(StrategyLibraryItem.category == category)
    return q.order_by(StrategyLibraryItem.category, StrategyLibraryItem.name).all()


def list_all_strategies(
    db: Session,
    domain_key: str | None = None,
    category: str | None = None,
    active_only: bool = True,
) -> list[StrategyLibraryItem]:
    q = db.query(StrategyLibraryItem)
    if active_only:
        q = q.filter(StrategyLibraryItem.active == True)
    if domain_key:
        q = q.filter(StrategyLibraryItem.domain_key == domain_key)
    if category:
        q = q.filter(StrategyLibraryItem.category == category)
    return q.order_by(StrategyLibraryItem.domain_key, StrategyLibraryItem.category, StrategyLibraryItem.name).all()


def get_strategy_with_protocols(db: Session, strategy_id: str) -> dict | None:
    strategy = get_strategy_by_id(db, strategy_id)
    if not strategy:
        return None

    protocols = db.query(StrategyProtocol).filter(StrategyProtocol.strategy_id == strategy.id).all()
    protocol_list = []
    for p in protocols:
        steps = db.query(ProtocolStep).filter(ProtocolStep.protocol_id == p.id).order_by(ProtocolStep.order_index).all()
        protocol_list.append({
            "id": str(p.id),
            "name": p.name,
            "cadence": p.cadence,
            "duration_days": p.duration_days,
            "instructions_json": p.instructions_json,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "steps": [
                {
                    "id": str(s.id),
                    "order_index": s.order_index,
                    "title": s.title,
                    "description": s.description,
                    "frequency": s.frequency,
                    "target_metric_key": s.target_metric_key,
                    "xp_reward": s.xp_reward or 0,
                }
                for s in steps
            ],
        })

    return {
        "id": str(strategy.id),
        "domain_key": strategy.domain_key,
        "module_key": strategy.module_key,
        "name": strategy.name,
        "category": strategy.category,
        "evidence_level": strategy.evidence_level,
        "impact_level": strategy.impact_level,
        "difficulty_level": strategy.difficulty_level,
        "description": strategy.description,
        "when_to_use": strategy.when_to_use,
        "contraindications": strategy.contraindications,
        "active": strategy.active,
        "created_at": strategy.created_at.isoformat() if strategy.created_at else None,
        "protocols": protocol_list,
    }


def get_user_active_protocols(db: Session, active_only: bool = True) -> list[dict]:
    q = (
        db.query(UserActiveProtocol, StrategyProtocol, StrategyLibraryItem)
        .join(StrategyProtocol, UserActiveProtocol.protocol_id == StrategyProtocol.id)
        .join(StrategyLibraryItem, StrategyProtocol.strategy_id == StrategyLibraryItem.id)
    )
    if active_only:
        q = q.filter(UserActiveProtocol.active == True)

    rows = q.all()
    result = []
    for uap, proto, strat in rows:
        steps = db.query(ProtocolStep).filter(ProtocolStep.protocol_id == proto.id).order_by(ProtocolStep.order_index).all()
        result.append({
            "id": str(uap.id),
            "protocol_id": str(proto.id),
            "strategy_id": str(strat.id),
            "strategy_name": strat.name,
            "protocol_name": proto.name,
            "domain_key": strat.domain_key,
            "category": strat.category,
            "evidence_level": strat.evidence_level,
            "impact_level": strat.impact_level,
            "difficulty_level": strat.difficulty_level,
            "module_key": strat.module_key,
            "started_at": uap.started_at.isoformat() if uap.started_at else None,
            "active": uap.active,
            "adherence_score": uap.adherence_score or 0,
            "effectiveness_score": uap.effectiveness_score,
            "notes": uap.notes,
            "steps": [
                {
                    "id": str(s.id),
                    "order_index": s.order_index,
                    "title": s.title,
                    "description": s.description,
                    "frequency": s.frequency,
                    "target_metric_key": s.target_metric_key,
                    "xp_reward": s.xp_reward or 0,
                }
                for s in steps
            ],
        })
    return result


def activate_protocol(db: Session, protocol_id: str) -> UserActiveProtocol | None:
    protocol = get_protocol_by_id(db, protocol_id)
    if not protocol:
        return None

    try:
        pid = uuid.UUID(protocol_id)
    except ValueError:
        return None

    existing = db.query(UserActiveProtocol).filter(
        UserActiveProtocol.protocol_id == pid,
        UserActiveProtocol.active == True,
    ).first()
    if existing:
        return existing

    uap = UserActiveProtocol(protocol_id=pid, active=True, adherence_score=0)
    db.add(uap)
    db.commit()
    db.refresh(uap)
    return uap


def deactivate_protocol(db: Session, user_active_protocol_id: str) -> bool:
    try:
        uid = uuid.UUID(user_active_protocol_id)
    except ValueError:
        return False

    uap = db.query(UserActiveProtocol).filter(UserActiveProtocol.id == uid).first()
    if not uap:
        return False
    uap.active = False
    db.commit()
    return True


def add_checkin(
    db: Session,
    user_active_protocol_id: str,
    completed_steps: list | None,
    adherence_value: float | None,
    notes: str | None,
) -> ProtocolCheckin | None:
    try:
        uid = uuid.UUID(user_active_protocol_id)
    except ValueError:
        return None

    uap = db.query(UserActiveProtocol).filter(UserActiveProtocol.id == uid).first()
    if not uap:
        return None

    checkin = ProtocolCheckin(
        user_active_protocol_id=uid,
        completed_steps_json=completed_steps,
        adherence_value=adherence_value,
        notes=notes,
    )
    db.add(checkin)

    if adherence_value is not None:
        uap.adherence_score = adherence_value

    db.commit()
    db.refresh(checkin)
    return checkin


def update_adherence(db: Session, user_active_protocol_id: str, score: float) -> bool:
    try:
        uid = uuid.UUID(user_active_protocol_id)
    except ValueError:
        return False

    uap = db.query(UserActiveProtocol).filter(UserActiveProtocol.id == uid).first()
    if not uap:
        return False
    uap.adherence_score = min(100, max(0, score))
    db.commit()
    return True
