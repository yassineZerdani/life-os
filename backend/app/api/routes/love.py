"""Relationship Depth System API — profile, pulse, memories, conflicts, vision, reconnect."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models import User
from app.models import (
    LoveProfile,
    LovePulseEntry,
    LoveMemory,
    ConflictEntry,
    SharedVisionItem,
    ReconnectAction,
)
from app.schemas.love import (
    LoveProfileCreate,
    LoveProfileUpdate,
    LoveProfileResponse,
    LovePulseEntryCreate,
    LovePulseEntryResponse,
    LoveMemoryCreate,
    LoveMemoryResponse,
    ConflictEntryCreate,
    ConflictEntryUpdate,
    ConflictEntryResponse,
    SharedVisionItemCreate,
    SharedVisionItemUpdate,
    SharedVisionItemResponse,
    ReconnectActionCreate,
    ReconnectActionUpdate,
    ReconnectActionResponse,
    LoveDashboardResponse,
)
from app.services.love_service import (
    get_or_create_love_profile,
    get_latest_pulse,
    collect_insights,
)

router = APIRouter()


# ----- Dashboard -----
@router.get("/dashboard", response_model=LoveDashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = get_or_create_love_profile(db, user.id)
    latest_pulse = get_latest_pulse(db, user.id)
    conflicts_pending = (
        db.query(ConflictEntry)
        .filter(
            ConflictEntry.user_id == user.id,
            ConflictEntry.status != "reconnected",
        )
        .count()
    )
    reconnect_pending = (
        db.query(ReconnectAction)
        .filter(ReconnectAction.user_id == user.id, ReconnectAction.completed == False)
        .count()
    )
    insights = collect_insights(db, user.id)
    return LoveDashboardResponse(
        profile=LoveProfileResponse.model_validate(profile),
        latest_pulse=LovePulseEntryResponse.model_validate(latest_pulse) if latest_pulse else None,
        conflicts_pending_repair=conflicts_pending,
        reconnect_pending=reconnect_pending,
        insights=insights,
    )


# ----- Profile -----
@router.get("/profile", response_model=LoveProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = get_or_create_love_profile(db, user.id)
    return LoveProfileResponse.model_validate(profile)


@router.patch("/profile", response_model=LoveProfileResponse)
def update_profile(
    body: LoveProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = get_or_create_love_profile(db, user.id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return LoveProfileResponse.model_validate(profile)


# ----- Pulse -----
@router.get("/pulse", response_model=list[LovePulseEntryResponse])
def list_pulse_entries(
    limit: int = 30,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(LovePulseEntry)
        .filter(LovePulseEntry.user_id == user.id)
        .order_by(LovePulseEntry.date.desc())
        .limit(limit)
        .all()
    )


@router.post("/pulse", response_model=LovePulseEntryResponse)
def create_pulse_entry(
    body: LovePulseEntryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    entry = LovePulseEntry(
        user_id=user.id,
        date=body.date,
        closeness_score=body.closeness_score,
        communication_score=body.communication_score,
        trust_score=body.trust_score,
        tension_score=body.tension_score,
        support_score=body.support_score,
        future_alignment_score=body.future_alignment_score,
        notes=body.notes,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


# ----- Memories -----
@router.get("/memories", response_model=list[LoveMemoryResponse])
def list_memories(
    category: str | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(LoveMemory).filter(LoveMemory.user_id == user.id)
    if category:
        q = q.filter(LoveMemory.category == category)
    return q.order_by(LoveMemory.date.desc().nulls_last()).limit(limit).all()


@router.post("/memories", response_model=LoveMemoryResponse)
def create_memory(
    body: LoveMemoryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    m = LoveMemory(
        user_id=user.id,
        title=body.title,
        description=body.description,
        date=body.date,
        category=body.category,
        media_url=body.media_url,
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.delete("/memories/{memory_id}", status_code=204)
def delete_memory(
    memory_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    m = db.query(LoveMemory).filter(LoveMemory.id == memory_id, LoveMemory.user_id == user.id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Memory not found")
    db.delete(m)
    db.commit()
    return None


# ----- Conflicts -----
@router.get("/conflicts", response_model=list[ConflictEntryResponse])
def list_conflicts(
    status: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(ConflictEntry).filter(ConflictEntry.user_id == user.id)
    if status:
        q = q.filter(ConflictEntry.status == status)
    return q.order_by(ConflictEntry.date.desc()).limit(limit).all()


@router.post("/conflicts", response_model=ConflictEntryResponse)
def create_conflict(
    body: ConflictEntryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = ConflictEntry(
        user_id=user.id,
        date=body.date,
        trigger=body.trigger,
        what_i_felt=body.what_i_felt,
        what_they_may_have_felt=body.what_they_may_have_felt,
        what_happened=body.what_happened,
        repair_needed=body.repair_needed,
        status=body.status,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.patch("/conflicts/{conflict_id}", response_model=ConflictEntryResponse)
def update_conflict(
    conflict_id: UUID,
    body: ConflictEntryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = db.query(ConflictEntry).filter(ConflictEntry.id == conflict_id, ConflictEntry.user_id == user.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conflict entry not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c


@router.delete("/conflicts/{conflict_id}", status_code=204)
def delete_conflict(
    conflict_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = db.query(ConflictEntry).filter(ConflictEntry.id == conflict_id, ConflictEntry.user_id == user.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conflict entry not found")
    db.delete(c)
    db.commit()
    return None


# ----- Shared vision -----
@router.get("/shared-vision", response_model=list[SharedVisionItemResponse])
def list_shared_vision(
    status: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(SharedVisionItem).filter(SharedVisionItem.user_id == user.id)
    if status:
        q = q.filter(SharedVisionItem.status == status)
    if category:
        q = q.filter(SharedVisionItem.category == category)
    return q.order_by(SharedVisionItem.target_date.asc().nulls_last()).all()


@router.post("/shared-vision", response_model=SharedVisionItemResponse)
def create_shared_vision(
    body: SharedVisionItemCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    v = SharedVisionItem(
        user_id=user.id,
        category=body.category,
        title=body.title,
        description=body.description,
        target_date=body.target_date,
        status=body.status,
    )
    db.add(v)
    db.commit()
    db.refresh(v)
    return v


@router.patch("/shared-vision/{item_id}", response_model=SharedVisionItemResponse)
def update_shared_vision(
    item_id: UUID,
    body: SharedVisionItemUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    v = db.query(SharedVisionItem).filter(SharedVisionItem.id == item_id, SharedVisionItem.user_id == user.id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Item not found")
    for k, val in body.model_dump(exclude_unset=True).items():
        setattr(v, k, val)
    db.commit()
    db.refresh(v)
    return v


@router.delete("/shared-vision/{item_id}", status_code=204)
def delete_shared_vision(
    item_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    v = db.query(SharedVisionItem).filter(SharedVisionItem.id == item_id, SharedVisionItem.user_id == user.id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(v)
    db.commit()
    return None


# ----- Reconnect actions -----
@router.get("/reconnect", response_model=list[ReconnectActionResponse])
def list_reconnect(
    completed: bool | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(ReconnectAction).filter(ReconnectAction.user_id == user.id)
    if completed is not None:
        q = q.filter(ReconnectAction.completed == completed)
    return q.order_by(ReconnectAction.due_date.asc().nulls_last()).all()


@router.post("/reconnect", response_model=ReconnectActionResponse)
def create_reconnect(
    body: ReconnectActionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    r = ReconnectAction(
        user_id=user.id,
        title=body.title,
        description=body.description,
        category=body.category,
        due_date=body.due_date,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@router.patch("/reconnect/{action_id}", response_model=ReconnectActionResponse)
def update_reconnect(
    action_id: UUID,
    body: ReconnectActionUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    r = db.query(ReconnectAction).filter(ReconnectAction.id == action_id, ReconnectAction.user_id == user.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reconnect action not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return r


@router.delete("/reconnect/{action_id}", status_code=204)
def delete_reconnect(
    action_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    r = db.query(ReconnectAction).filter(ReconnectAction.id == action_id, ReconnectAction.user_id == user.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reconnect action not found")
    db.delete(r)
    db.commit()
    return None
