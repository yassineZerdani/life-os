"""Mind Engine API: emotions, triggers, thought patterns, loops, regulation."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models import User
from app.models import (
    EmotionalStateEntry,
    TriggerEntry,
    ThoughtPattern,
    BehaviorLoop,
    RegulationToolUse,
)
from app.schemas.mind_engine import (
    EmotionalStateEntryCreate,
    EmotionalStateEntryUpdate,
    EmotionalStateEntryResponse,
    TriggerEntryCreate,
    TriggerEntryResponse,
    ThoughtPatternCreate,
    ThoughtPatternUpdate,
    ThoughtPatternResponse,
    BehaviorLoopCreate,
    BehaviorLoopUpdate,
    BehaviorLoopResponse,
    RegulationToolUseCreate,
    RegulationToolUseResponse,
    MindEngineDashboardResponse,
)
from app.services.mind_engine_service import (
    get_dashboard as get_mind_dashboard,
)

router = APIRouter()


@router.get("/dashboard", response_model=MindEngineDashboardResponse)
def get_dashboard(
    weather_days: int = Query(14, ge=7, le=90),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    raw = get_mind_dashboard(
        db, user.id, weather_days=weather_days, recent_limit=10
    )
    return MindEngineDashboardResponse(
        emotions_count=raw["emotions_count"],
        triggers_count=raw["triggers_count"],
        thought_patterns_count=raw["thought_patterns_count"],
        loops_count=raw["loops_count"],
        regulation_uses_count=raw["regulation_uses_count"],
        emotional_weather=raw["emotional_weather"],
        trend_insights=raw["trend_insights"],
        recent_emotions=[
            EmotionalStateEntryResponse.model_validate(e)
            for e in raw["recent_emotions"]
        ],
        recent_triggers=[
            TriggerEntryResponse.model_validate(t)
            for t in raw["recent_triggers"]
        ],
        top_tools=raw["top_tools"],
    )


# ----- Emotional state entries -----
@router.get("/emotions", response_model=list[EmotionalStateEntryResponse])
def list_emotions(
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from datetime import date, timedelta
    since = date.today() - timedelta(days=days)
    return (
        db.query(EmotionalStateEntry)
        .filter(
            EmotionalStateEntry.user_id == user.id,
            EmotionalStateEntry.date >= since,
        )
        .order_by(
            EmotionalStateEntry.date.desc(),
            EmotionalStateEntry.created_at.desc(),
        )
        .limit(limit)
        .all()
    )


@router.post("/emotions", response_model=EmotionalStateEntryResponse)
def create_emotion(
    body: EmotionalStateEntryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    e = EmotionalStateEntry(
        user_id=user.id,
        date=body.date,
        primary_emotion=body.primary_emotion,
        intensity=body.intensity,
        notes=body.notes,
    )
    db.add(e)
    db.commit()
    db.refresh(e)
    return EmotionalStateEntryResponse.model_validate(e)


@router.patch("/emotions/{entry_id}", response_model=EmotionalStateEntryResponse)
def update_emotion(
    entry_id: UUID,
    body: EmotionalStateEntryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    e = db.query(EmotionalStateEntry).filter(
        EmotionalStateEntry.id == entry_id,
        EmotionalStateEntry.user_id == user.id,
    ).first()
    if not e:
        raise HTTPException(status_code=404, detail="Entry not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(e, k, v)
    db.commit()
    db.refresh(e)
    return EmotionalStateEntryResponse.model_validate(e)


@router.delete("/emotions/{entry_id}", status_code=204)
def delete_emotion(
    entry_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    e = db.query(EmotionalStateEntry).filter(
        EmotionalStateEntry.id == entry_id,
        EmotionalStateEntry.user_id == user.id,
    ).first()
    if not e:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(e)
    db.commit()
    return None


# ----- Trigger entries -----
@router.get("/triggers", response_model=list[TriggerEntryResponse])
def list_triggers(
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from datetime import date, timedelta
    since = date.today() - timedelta(days=days)
    return (
        db.query(TriggerEntry)
        .filter(
            TriggerEntry.user_id == user.id,
            TriggerEntry.date >= since,
        )
        .order_by(TriggerEntry.date.desc(), TriggerEntry.created_at.desc())
        .limit(limit)
        .all()
    )


@router.post("/triggers", response_model=TriggerEntryResponse)
def create_trigger(
    body: TriggerEntryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    t = TriggerEntry(
        user_id=user.id,
        trigger_type=body.trigger_type,
        description=body.description,
        date=body.date,
        linked_emotion=body.linked_emotion,
        linked_behavior=body.linked_behavior,
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return TriggerEntryResponse.model_validate(t)


@router.delete("/triggers/{entry_id}", status_code=204)
def delete_trigger(
    entry_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    t = db.query(TriggerEntry).filter(
        TriggerEntry.id == entry_id,
        TriggerEntry.user_id == user.id,
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Trigger not found")
    db.delete(t)
    db.commit()
    return None


# ----- Thought patterns -----
@router.get("/thought-patterns", response_model=list[ThoughtPatternResponse])
def list_thought_patterns(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(ThoughtPattern)
        .filter(ThoughtPattern.user_id == user.id)
        .order_by(ThoughtPattern.title)
        .all()
    )


@router.post("/thought-patterns", response_model=ThoughtPatternResponse)
def create_thought_pattern(
    body: ThoughtPatternCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    p = ThoughtPattern(
        user_id=user.id,
        title=body.title,
        description=body.description,
        category=body.category,
        frequency_score=body.frequency_score,
        severity_score=body.severity_score,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return ThoughtPatternResponse.model_validate(p)


@router.patch("/thought-patterns/{pattern_id}", response_model=ThoughtPatternResponse)
def update_thought_pattern(
    pattern_id: UUID,
    body: ThoughtPatternUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    p = db.query(ThoughtPattern).filter(
        ThoughtPattern.id == pattern_id,
        ThoughtPattern.user_id == user.id,
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Thought pattern not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return ThoughtPatternResponse.model_validate(p)


@router.delete("/thought-patterns/{pattern_id}", status_code=204)
def delete_thought_pattern(
    pattern_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    p = db.query(ThoughtPattern).filter(
        ThoughtPattern.id == pattern_id,
        ThoughtPattern.user_id == user.id,
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Thought pattern not found")
    db.delete(p)
    db.commit()
    return None


# ----- Behavior loops -----
@router.get("/loops", response_model=list[BehaviorLoopResponse])
def list_loops(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(BehaviorLoop)
        .filter(BehaviorLoop.user_id == user.id)
        .order_by(BehaviorLoop.title)
        .all()
    )


@router.post("/loops", response_model=BehaviorLoopResponse)
def create_loop(
    body: BehaviorLoopCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    b = BehaviorLoop(
        user_id=user.id,
        title=body.title,
        trigger_summary=body.trigger_summary,
        emotional_sequence=body.emotional_sequence,
        behavioral_sequence=body.behavioral_sequence,
        aftermath=body.aftermath,
        notes=body.notes,
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return BehaviorLoopResponse.model_validate(b)


@router.patch("/loops/{loop_id}", response_model=BehaviorLoopResponse)
def update_loop(
    loop_id: UUID,
    body: BehaviorLoopUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    b = db.query(BehaviorLoop).filter(
        BehaviorLoop.id == loop_id,
        BehaviorLoop.user_id == user.id,
    ).first()
    if not b:
        raise HTTPException(status_code=404, detail="Loop not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(b, k, v)
    db.commit()
    db.refresh(b)
    return BehaviorLoopResponse.model_validate(b)


@router.delete("/loops/{loop_id}", status_code=204)
def delete_loop(
    loop_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    b = db.query(BehaviorLoop).filter(
        BehaviorLoop.id == loop_id,
        BehaviorLoop.user_id == user.id,
    ).first()
    if not b:
        raise HTTPException(status_code=404, detail="Loop not found")
    db.delete(b)
    db.commit()
    return None


# ----- Regulation tool uses -----
@router.get("/regulation", response_model=list[RegulationToolUseResponse])
def list_regulation_uses(
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from datetime import date, timedelta
    since = date.today() - timedelta(days=days)
    return (
        db.query(RegulationToolUse)
        .filter(
            RegulationToolUse.user_id == user.id,
            RegulationToolUse.date >= since,
        )
        .order_by(RegulationToolUse.date.desc(), RegulationToolUse.created_at.desc())
        .limit(limit)
        .all()
    )


@router.post("/regulation", response_model=RegulationToolUseResponse)
def create_regulation_use(
    body: RegulationToolUseCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    r = RegulationToolUse(
        user_id=user.id,
        tool_name=body.tool_name,
        date=body.date,
        effectiveness_score=body.effectiveness_score,
        notes=body.notes,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return RegulationToolUseResponse.model_validate(r)


@router.delete("/regulation/{use_id}", status_code=204)
def delete_regulation_use(
    use_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    r = db.query(RegulationToolUse).filter(
        RegulationToolUse.id == use_id,
        RegulationToolUse.user_id == user.id,
    ).first()
    if not r:
        raise HTTPException(status_code=404, detail="Regulation use not found")
    db.delete(r)
    db.commit()
    return None
