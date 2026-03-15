"""Family Command Center API — members, interactions, responsibilities, memories, dynamics."""
from datetime import date
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_user
from app.models import User
from app.models import (
    FamilyMember,
    FamilyInteraction,
    FamilyResponsibility,
    FamilyMemory,
    FamilyDynamicNote,
)
from app.schemas.family import (
    FamilyMemberCreate,
    FamilyMemberUpdate,
    FamilyMemberResponse,
    FamilyInteractionCreate,
    FamilyInteractionResponse,
    FamilyResponsibilityCreate,
    FamilyResponsibilityUpdate,
    FamilyResponsibilityResponse,
    FamilyMemoryCreate,
    FamilyMemoryResponse,
    FamilyDynamicNoteCreate,
    FamilyDynamicNoteResponse,
    FamilyDashboardResponse,
)

router = APIRouter()


# ----- Dashboard -----
@router.get("/dashboard", response_model=FamilyDashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    members = (
        db.query(FamilyMember)
        .filter(FamilyMember.user_id == user.id)
        .order_by(FamilyMember.relationship_type, FamilyMember.name)
        .all()
    )
    responsibilities_pending = (
        db.query(func.count(FamilyResponsibility.id))
        .filter(
            FamilyResponsibility.user_id == user.id,
            FamilyResponsibility.status.in_(["pending", "in_progress"]),
        )
        .scalar() or 0
    )
    recent_interactions = (
        db.query(func.count(FamilyInteraction.id))
        .filter(FamilyInteraction.user_id == user.id)
        .scalar() or 0
    )
    memories_count = (
        db.query(func.count(FamilyMemory.id))
        .filter(FamilyMemory.user_id == user.id)
        .scalar() or 0
    )
    high_support = [m for m in members if m.support_level in ("high", "critical")]
    return FamilyDashboardResponse(
        members=[FamilyMemberResponse.model_validate(m) for m in members],
        responsibilities_pending=responsibilities_pending,
        recent_interactions_count=recent_interactions,
        memories_count=memories_count,
        high_support_members=[FamilyMemberResponse.model_validate(m) for m in high_support],
    )


# ----- Family members -----
@router.get("/members", response_model=list[FamilyMemberResponse])
def list_members(
    relationship_type: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(FamilyMember).filter(FamilyMember.user_id == user.id)
    if relationship_type:
        q = q.filter(FamilyMember.relationship_type == relationship_type)
    return q.order_by(FamilyMember.relationship_type, FamilyMember.name).all()


@router.post("/members", response_model=FamilyMemberResponse)
def create_member(
    body: FamilyMemberCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if body.parent_id:
        parent = db.query(FamilyMember).filter(
            FamilyMember.id == body.parent_id,
            FamilyMember.user_id == user.id,
        ).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent member not found")
    m = FamilyMember(
        user_id=user.id,
        name=body.name,
        relationship_type=body.relationship_type,
        birth_date=body.birth_date,
        contact_info=body.contact_info,
        notes=body.notes,
        closeness_score=body.closeness_score,
        tension_score=body.tension_score,
        support_level=body.support_level,
        parent_id=body.parent_id,
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.get("/members/{member_id}", response_model=FamilyMemberResponse)
def get_member(
    member_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    m = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.user_id == user.id,
    ).first()
    if not m:
        raise HTTPException(status_code=404, detail="Family member not found")
    return m


@router.patch("/members/{member_id}", response_model=FamilyMemberResponse)
def update_member(
    member_id: UUID,
    body: FamilyMemberUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    m = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.user_id == user.id,
    ).first()
    if not m:
        raise HTTPException(status_code=404, detail="Family member not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(m, k, v)
    db.commit()
    db.refresh(m)
    return m


@router.delete("/members/{member_id}", status_code=204)
def delete_member(
    member_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    m = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.user_id == user.id,
    ).first()
    if not m:
        raise HTTPException(status_code=404, detail="Family member not found")
    db.delete(m)
    db.commit()
    return None


# ----- Interactions -----
@router.get("/members/{member_id}/interactions", response_model=list[FamilyInteractionResponse])
def list_interactions(
    member_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    m = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.user_id == user.id,
    ).first()
    if not m:
        raise HTTPException(status_code=404, detail="Family member not found")
    return (
        db.query(FamilyInteraction)
        .filter(FamilyInteraction.family_member_id == member_id)
        .order_by(FamilyInteraction.date.desc())
        .limit(50)
        .all()
    )


@router.post("/interactions", response_model=FamilyInteractionResponse)
def create_interaction(
    body: FamilyInteractionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    m = db.query(FamilyMember).filter(
        FamilyMember.id == body.family_member_id,
        FamilyMember.user_id == user.id,
    ).first()
    if not m:
        raise HTTPException(status_code=404, detail="Family member not found")
    i = FamilyInteraction(
        user_id=user.id,
        family_member_id=body.family_member_id,
        interaction_type=body.interaction_type,
        date=body.date,
        emotional_tone=body.emotional_tone,
        notes=body.notes,
    )
    db.add(i)
    db.commit()
    db.refresh(i)
    return i


# ----- Responsibilities -----
@router.get("/responsibilities", response_model=list[FamilyResponsibilityResponse])
def list_responsibilities(
    status: str | None = None,
    family_member_id: UUID | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(FamilyResponsibility).filter(FamilyResponsibility.user_id == user.id)
    if status:
        q = q.filter(FamilyResponsibility.status == status)
    if family_member_id:
        q = q.filter(FamilyResponsibility.family_member_id == family_member_id)
    return q.order_by(FamilyResponsibility.due_date.asc().nulls_last()).all()


@router.post("/responsibilities", response_model=FamilyResponsibilityResponse)
def create_responsibility(
    body: FamilyResponsibilityCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if body.family_member_id:
        m = db.query(FamilyMember).filter(
            FamilyMember.id == body.family_member_id,
            FamilyMember.user_id == user.id,
        ).first()
        if not m:
            raise HTTPException(status_code=404, detail="Family member not found")
    r = FamilyResponsibility(
        user_id=user.id,
        family_member_id=body.family_member_id,
        title=body.title,
        description=body.description,
        due_date=body.due_date,
        status=body.status,
        category=body.category,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@router.patch("/responsibilities/{resp_id}", response_model=FamilyResponsibilityResponse)
def update_responsibility(
    resp_id: UUID,
    body: FamilyResponsibilityUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    r = db.query(FamilyResponsibility).filter(
        FamilyResponsibility.id == resp_id,
        FamilyResponsibility.user_id == user.id,
    ).first()
    if not r:
        raise HTTPException(status_code=404, detail="Responsibility not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return r


@router.delete("/responsibilities/{resp_id}", status_code=204)
def delete_responsibility(
    resp_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    r = db.query(FamilyResponsibility).filter(
        FamilyResponsibility.id == resp_id,
        FamilyResponsibility.user_id == user.id,
    ).first()
    if not r:
        raise HTTPException(status_code=404, detail="Responsibility not found")
    db.delete(r)
    db.commit()
    return None


# ----- Memories -----
@router.get("/memories", response_model=list[FamilyMemoryResponse])
def list_memories(
    family_member_id: UUID | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(FamilyMemory).filter(FamilyMemory.user_id == user.id)
    if family_member_id:
        q = q.filter(FamilyMemory.family_member_id == family_member_id)
    return q.order_by(FamilyMemory.date.desc().nulls_last()).limit(limit).all()


@router.post("/memories", response_model=FamilyMemoryResponse)
def create_memory(
    body: FamilyMemoryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if body.family_member_id:
        m = db.query(FamilyMember).filter(
            FamilyMember.id == body.family_member_id,
            FamilyMember.user_id == user.id,
        ).first()
        if not m:
            raise HTTPException(status_code=404, detail="Family member not found")
    mem = FamilyMemory(
        user_id=user.id,
        family_member_id=body.family_member_id,
        title=body.title,
        description=body.description,
        date=body.date,
        media_url=body.media_url,
        tags=body.tags or [],
    )
    db.add(mem)
    db.commit()
    db.refresh(mem)
    return mem


@router.delete("/memories/{memory_id}", status_code=204)
def delete_memory(
    memory_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    mem = db.query(FamilyMemory).filter(
        FamilyMemory.id == memory_id,
        FamilyMemory.user_id == user.id,
    ).first()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")
    db.delete(mem)
    db.commit()
    return None


# ----- Dynamic notes -----
@router.get("/dynamic-notes", response_model=list[FamilyDynamicNoteResponse])
def list_dynamic_notes(
    family_member_id: UUID | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(FamilyDynamicNote).filter(FamilyDynamicNote.user_id == user.id)
    if family_member_id:
        q = q.filter(FamilyDynamicNote.family_member_id == family_member_id)
    return q.order_by(FamilyDynamicNote.created_at.desc()).all()


@router.post("/dynamic-notes", response_model=FamilyDynamicNoteResponse)
def create_dynamic_note(
    body: FamilyDynamicNoteCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if body.family_member_id:
        m = db.query(FamilyMember).filter(
            FamilyMember.id == body.family_member_id,
            FamilyMember.user_id == user.id,
        ).first()
        if not m:
            raise HTTPException(status_code=404, detail="Family member not found")
    n = FamilyDynamicNote(
        user_id=user.id,
        family_member_id=body.family_member_id,
        pattern_type=body.pattern_type,
        trigger_notes=body.trigger_notes,
        safe_topics=body.safe_topics,
        difficult_topics=body.difficult_topics,
        notes=body.notes,
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    return n


@router.delete("/dynamic-notes/{note_id}", status_code=204)
def delete_dynamic_note(
    note_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    n = db.query(FamilyDynamicNote).filter(
        FamilyDynamicNote.id == note_id,
        FamilyDynamicNote.user_id == user.id,
    ).first()
    if not n:
        raise HTTPException(status_code=404, detail="Dynamic note not found")
    db.delete(n)
    db.commit()
    return None
