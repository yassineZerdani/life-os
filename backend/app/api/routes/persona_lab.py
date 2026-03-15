"""Persona Lab API — profile, values, principles, narrative, aspects, drift, dashboard."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models import User
from app.models import (
    PersonaValue,
    PersonaPrinciple,
    PersonaNarrativeEntry,
    PersonaAspect,
    IdentityDriftSignal,
)
from app.schemas.persona_lab import (
    PersonaIdentityProfileUpdate,
    PersonaIdentityProfileResponse,
    PersonaValueCreate,
    PersonaValueUpdate,
    PersonaValueResponse,
    PersonaPrincipleCreate,
    PersonaPrincipleUpdate,
    PersonaPrincipleResponse,
    PersonaNarrativeEntryCreate,
    PersonaNarrativeEntryResponse,
    PersonaAspectCreate,
    PersonaAspectUpdate,
    PersonaAspectResponse,
    IdentityDriftSignalCreate,
    IdentityDriftSignalResponse,
    PersonaDashboardResponse,
)
from app.services.persona_lab_service import (
    get_or_create_persona_profile,
    collect_alignment_insights,
    get_recent_drift_signals,
)

router = APIRouter()


@router.get("/dashboard", response_model=PersonaDashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = get_or_create_persona_profile(db, user.id)
    values_count = (
        db.query(PersonaValue).filter(PersonaValue.user_id == user.id).count()
    )
    principles_count = (
        db.query(PersonaPrinciple)
        .filter(PersonaPrinciple.user_id == user.id)
        .count()
    )
    narrative_count = (
        db.query(PersonaNarrativeEntry)
        .filter(PersonaNarrativeEntry.user_id == user.id)
        .count()
    )
    aspects_count = (
        db.query(PersonaAspect)
        .filter(PersonaAspect.user_id == user.id)
        .count()
    )
    drift_list = get_recent_drift_signals(db, user.id, limit=10)
    drift_signals_count = (
        db.query(IdentityDriftSignal)
        .filter(IdentityDriftSignal.user_id == user.id)
        .count()
    )
    alignment_insights = collect_alignment_insights(db, user.id)
    return PersonaDashboardResponse(
        profile=PersonaIdentityProfileResponse.model_validate(profile),
        values_count=values_count,
        principles_count=principles_count,
        narrative_count=narrative_count,
        aspects_count=aspects_count,
        drift_signals_count=drift_signals_count,
        alignment_insights=alignment_insights,
        drift_signals=[
            IdentityDriftSignalResponse.model_validate(s)
            for s in drift_list
        ],
    )


# ----- Identity profile -----
@router.get("/profile", response_model=PersonaIdentityProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = get_or_create_persona_profile(db, user.id)
    return PersonaIdentityProfileResponse.model_validate(profile)


@router.patch("/profile", response_model=PersonaIdentityProfileResponse)
def update_profile(
    body: PersonaIdentityProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = get_or_create_persona_profile(db, user.id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return PersonaIdentityProfileResponse.model_validate(profile)


# ----- Values -----
@router.get("/values", response_model=list[PersonaValueResponse])
def list_values(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(PersonaValue)
        .filter(PersonaValue.user_id == user.id)
        .order_by(
            PersonaValue.priority_score.desc().nulls_last(),
            PersonaValue.name,
        )
        .all()
    )


@router.post("/values", response_model=PersonaValueResponse)
def create_value(
    body: PersonaValueCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    v = PersonaValue(
        user_id=user.id,
        name=body.name,
        description=body.description,
        priority_score=body.priority_score,
    )
    db.add(v)
    db.commit()
    db.refresh(v)
    return PersonaValueResponse.model_validate(v)


@router.patch("/values/{value_id}", response_model=PersonaValueResponse)
def update_value(
    value_id: UUID,
    body: PersonaValueUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    v = db.query(PersonaValue).filter(
        PersonaValue.id == value_id,
        PersonaValue.user_id == user.id,
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Value not found")
    for k, val in body.model_dump(exclude_unset=True).items():
        setattr(v, k, val)
    db.commit()
    db.refresh(v)
    return PersonaValueResponse.model_validate(v)


@router.delete("/values/{value_id}", status_code=204)
def delete_value(
    value_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    v = db.query(PersonaValue).filter(
        PersonaValue.id == value_id,
        PersonaValue.user_id == user.id,
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Value not found")
    db.delete(v)
    db.commit()
    return None


# ----- Principles -----
@router.get("/principles", response_model=list[PersonaPrincipleResponse])
def list_principles(
    active_only: bool = False,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(PersonaPrinciple).filter(PersonaPrinciple.user_id == user.id)
    if active_only:
        q = q.filter(PersonaPrinciple.active.is_(True))
    return q.order_by(PersonaPrinciple.title).all()


@router.post("/principles", response_model=PersonaPrincipleResponse)
def create_principle(
    body: PersonaPrincipleCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    p = PersonaPrinciple(
        user_id=user.id,
        title=body.title,
        description=body.description,
        active=body.active,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return PersonaPrincipleResponse.model_validate(p)


@router.patch("/principles/{principle_id}", response_model=PersonaPrincipleResponse)
def update_principle(
    principle_id: UUID,
    body: PersonaPrincipleUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    p = db.query(PersonaPrinciple).filter(
        PersonaPrinciple.id == principle_id,
        PersonaPrinciple.user_id == user.id,
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Principle not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return PersonaPrincipleResponse.model_validate(p)


@router.delete("/principles/{principle_id}", status_code=204)
def delete_principle(
    principle_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    p = db.query(PersonaPrinciple).filter(
        PersonaPrinciple.id == principle_id,
        PersonaPrinciple.user_id == user.id,
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Principle not found")
    db.delete(p)
    db.commit()
    return None


# ----- Narrative -----
@router.get("/narrative", response_model=list[PersonaNarrativeEntryResponse])
def list_narrative(
    type_: str | None = Query(None, alias="type"),
    limit: int = 100,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(PersonaNarrativeEntry).filter(
        PersonaNarrativeEntry.user_id == user.id
    )
    if type_:
        q = q.filter(PersonaNarrativeEntry.type == type_)
    return q.order_by(PersonaNarrativeEntry.created_at.desc()).limit(limit).all()


@router.post("/narrative", response_model=PersonaNarrativeEntryResponse)
def create_narrative(
    body: PersonaNarrativeEntryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    n = PersonaNarrativeEntry(
        user_id=user.id,
        title=body.title,
        description=body.description,
        time_period=body.time_period,
        type=body.type,
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    return PersonaNarrativeEntryResponse.model_validate(n)


@router.delete("/narrative/{entry_id}", status_code=204)
def delete_narrative(
    entry_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    n = db.query(PersonaNarrativeEntry).filter(
        PersonaNarrativeEntry.id == entry_id,
        PersonaNarrativeEntry.user_id == user.id,
    ).first()
    if not n:
        raise HTTPException(status_code=404, detail="Narrative entry not found")
    db.delete(n)
    db.commit()
    return None


# ----- Persona aspects -----
@router.get("/aspects", response_model=list[PersonaAspectResponse])
def list_aspects(
    active_only: bool = False,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(PersonaAspect).filter(PersonaAspect.user_id == user.id)
    if active_only:
        q = q.filter(PersonaAspect.active.is_(True))
    return q.order_by(PersonaAspect.name).all()


@router.post("/aspects", response_model=PersonaAspectResponse)
def create_aspect(
    body: PersonaAspectCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    a = PersonaAspect(
        user_id=user.id,
        name=body.name,
        description=body.description,
        strength_score=body.strength_score,
        tension_score=body.tension_score,
        active=body.active,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return PersonaAspectResponse.model_validate(a)


@router.patch("/aspects/{aspect_id}", response_model=PersonaAspectResponse)
def update_aspect(
    aspect_id: UUID,
    body: PersonaAspectUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    a = db.query(PersonaAspect).filter(
        PersonaAspect.id == aspect_id,
        PersonaAspect.user_id == user.id,
    ).first()
    if not a:
        raise HTTPException(status_code=404, detail="Aspect not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(a, k, v)
    db.commit()
    db.refresh(a)
    return PersonaAspectResponse.model_validate(a)


@router.delete("/aspects/{aspect_id}", status_code=204)
def delete_aspect(
    aspect_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    a = db.query(PersonaAspect).filter(
        PersonaAspect.id == aspect_id,
        PersonaAspect.user_id == user.id,
    ).first()
    if not a:
        raise HTTPException(status_code=404, detail="Aspect not found")
    db.delete(a)
    db.commit()
    return None


# ----- Drift signals -----
@router.get("/drift", response_model=list[IdentityDriftSignalResponse])
def list_drift_signals(
    limit: int = 20,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(IdentityDriftSignal)
        .filter(IdentityDriftSignal.user_id == user.id)
        .order_by(IdentityDriftSignal.detected_at.desc())
        .limit(limit)
        .all()
    )


@router.post("/drift", response_model=IdentityDriftSignalResponse)
def create_drift_signal(
    body: IdentityDriftSignalCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    s = IdentityDriftSignal(
        user_id=user.id,
        source=body.source,
        description=body.description,
        severity=body.severity,
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return IdentityDriftSignalResponse.model_validate(s)


@router.delete("/drift/{signal_id}", status_code=204)
def delete_drift_signal(
    signal_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    s = db.query(IdentityDriftSignal).filter(
        IdentityDriftSignal.id == signal_id,
        IdentityDriftSignal.user_id == user.id,
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Signal not found")
    db.delete(s)
    db.commit()
    return None
