"""Skill OS API — skills tree, progress, practice sessions, artifacts, weaknesses, intelligence."""
from datetime import date
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models import User, Skill, SkillProgress, PracticeSession, SkillArtifact, SkillWeakness
from app.schemas.skill import (
    SkillCreate,
    SkillUpdate,
    SkillResponse,
    SkillProgressSchema,
    SkillTreeNode,
    PracticeSessionCreate,
    PracticeSessionResponse,
    ArtifactCreate,
    ArtifactResponse,
    WeaknessCreate,
    WeaknessResponse,
    IntelligenceInsight,
    RecommendedDrill,
    SkillDashboardResponse,
)
from app.services.skill_intelligence_service import (
    build_tree_for_user,
    get_or_create_progress,
    get_skill_with_children,
    collect_insights,
    recommend_drills,
    add_xp_from_session,
    update_decay_risk,
)

router = APIRouter()


def _skill_to_response(skill: Skill, include_children: bool = False) -> dict:
    prog = skill.progress
    data = {
        "id": skill.id,
        "user_id": skill.user_id,
        "name": skill.name,
        "category": skill.category,
        "description": skill.description,
        "parent_skill_id": skill.parent_skill_id,
        "active": skill.active,
        "created_at": skill.created_at,
        "updated_at": skill.updated_at,
        "progress": SkillProgressSchema.model_validate(prog) if prog else None,
        "subskills": [],
    }
    if include_children and skill.subskills:
        data["subskills"] = [_skill_to_response(s, include_children=True) for s in skill.subskills]
    return data


def _build_tree_node(skill: Skill) -> dict:
    prog = skill.progress or SkillProgress(skill_id=skill.id, level=1, xp=0)
    from app.services.skill_intelligence_service import _days_since
    days = _days_since(prog.last_practiced_at)
    children = [_build_tree_node(s) for s in skill.subskills]
    total_xp = (prog.xp or 0) + sum(c.get("total_xp", 0) for c in children)
    session_count = len(getattr(skill, "practice_sessions", None) or [])
    return {
        "skill": _skill_to_response(skill),
        "children": children,
        "total_xp": total_xp,
        "session_count": session_count,
        "days_since_practice": days,
        "decay_risk": prog.decay_risk,
    }


# ----- Skills CRUD -----
@router.get("", response_model=list[SkillResponse])
def list_skills(
    active_only: bool = True,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    roots = build_tree_for_user(db, user.id, active_only=active_only)
    return [_skill_to_response(s, include_children=True) for s in roots]


@router.post("", response_model=SkillResponse)
def create_skill(
    body: SkillCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if body.parent_skill_id:
        parent = db.query(Skill).filter(
            Skill.id == body.parent_skill_id,
            Skill.user_id == user.id,
        ).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent skill not found")
    skill = Skill(
        user_id=user.id,
        name=body.name,
        category=body.category,
        description=body.description,
        parent_skill_id=body.parent_skill_id,
        active=body.active,
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)
    get_or_create_progress(db, skill)
    db.refresh(skill)
    return _skill_to_response(skill)


@router.get("/dashboard", response_model=SkillDashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    roots = build_tree_for_user(db, user.id, active_only=True)
    for r in roots:
        for s in r.subskills:
            get_or_create_progress(db, s)
        get_or_create_progress(db, r)
    insights, decay_warnings = collect_insights(db, user.id)
    drills = recommend_drills(db, user.id, limit=5)
    tree_nodes = []
    for r in roots:
        r_full = get_skill_with_children(db, r.id, user.id)
        if r_full:
            tree_nodes.append(SkillTreeNode(**_build_tree_node(r_full)))
    return SkillDashboardResponse(
        root_skills=tree_nodes,
        insights=[IntelligenceInsight(**i) for i in insights],
        recommended_drills=[RecommendedDrill(**d) for d in drills],
        decay_warnings=[IntelligenceInsight(**w) for w in decay_warnings],
    )


@router.get("/tree", response_model=list[SkillTreeNode])
def get_tree(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    roots = build_tree_for_user(db, user.id, active_only=True)
    for r in roots:
        get_or_create_progress(db, r)
        for s in r.subskills:
            get_or_create_progress(db, s)
    result = []
    for r in roots:
        r_full = get_skill_with_children(db, r.id, user.id)
        if r_full:
            result.append(SkillTreeNode(**_build_tree_node(r_full)))
    return result


@router.get("/artifacts/vault", response_model=list[ArtifactResponse])
def list_all_artifacts(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    arts = (
        db.query(SkillArtifact)
        .join(Skill)
        .filter(Skill.user_id == user.id)
        .order_by(SkillArtifact.created_at.desc())
        .all()
    )
    return arts


@router.get("/{skill_id}", response_model=SkillResponse)
def get_skill(
    skill_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    skill = get_skill_with_children(db, skill_id, user.id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    prog = get_or_create_progress(db, skill)
    db.refresh(skill)
    return _skill_to_response(skill, include_children=True)


@router.patch("/{skill_id}", response_model=SkillResponse)
def update_skill(
    skill_id: UUID,
    body: SkillUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(skill, k, v)
    db.commit()
    db.refresh(skill)
    return _skill_to_response(skill, include_children=True)


@router.delete("/{skill_id}", status_code=204)
def delete_skill(
    skill_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(skill)
    db.commit()
    return None


# ----- Practice sessions -----
@router.get("/{skill_id}/sessions", response_model=list[PracticeSessionResponse])
def list_sessions(
    skill_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    sessions = db.query(PracticeSession).filter(PracticeSession.skill_id == skill_id).order_by(PracticeSession.date.desc()).limit(50).all()
    return sessions


@router.post("/sessions", response_model=PracticeSessionResponse)
def create_session(
    body: PracticeSessionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    skill = db.query(Skill).filter(Skill.id == body.skill_id, Skill.user_id == user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    session = PracticeSession(
        skill_id=body.skill_id,
        date=body.date,
        duration_minutes=body.duration_minutes,
        difficulty=body.difficulty,
        focus_area=body.focus_area,
        mistakes_notes=body.mistakes_notes,
        feedback_notes=body.feedback_notes,
        energy_level=body.energy_level,
        quality_score=body.quality_score,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    prog = get_or_create_progress(db, skill)
    prog.last_practiced_at = session.created_at
    add_xp_from_session(db, skill.id, body.duration_minutes, body.quality_score)
    update_decay_risk(db, skill.id)
    db.commit()
    return session


# ----- Artifacts -----
@router.get("/{skill_id}/artifacts", response_model=list[ArtifactResponse])
def list_artifacts(
    skill_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return db.query(SkillArtifact).filter(SkillArtifact.skill_id == skill_id).order_by(SkillArtifact.created_at.desc()).all()


@router.post("/artifacts", response_model=ArtifactResponse)
def create_artifact(
    body: ArtifactCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    skill = db.query(Skill).filter(Skill.id == body.skill_id, Skill.user_id == user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    art = SkillArtifact(
        skill_id=body.skill_id,
        type=body.type,
        title=body.title,
        description=body.description,
        file_url=body.file_url,
        link_url=body.link_url,
    )
    db.add(art)
    db.commit()
    db.refresh(art)
    return art


@router.delete("/artifacts/{artifact_id}", status_code=204)
def delete_artifact(
    artifact_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    art = (
        db.query(SkillArtifact)
        .join(Skill)
        .filter(SkillArtifact.id == artifact_id, Skill.user_id == user.id)
        .first()
    )
    if not art:
        raise HTTPException(status_code=404, detail="Artifact not found")
    db.delete(art)
    db.commit()
    return None


# ----- Weaknesses -----
@router.get("/{skill_id}/weaknesses", response_model=list[WeaknessResponse])
def list_weaknesses(
    skill_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return db.query(SkillWeakness).filter(SkillWeakness.skill_id == skill_id).all()


@router.post("/weaknesses", response_model=WeaknessResponse)
def create_weakness(
    body: WeaknessCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    skill = db.query(Skill).filter(Skill.id == body.skill_id, Skill.user_id == user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    w = SkillWeakness(
        skill_id=body.skill_id,
        weakness_name=body.weakness_name,
        severity=body.severity,
        notes=body.notes,
    )
    db.add(w)
    db.commit()
    db.refresh(w)
    return w


@router.delete("/weaknesses/{weakness_id}", status_code=204)
def delete_weakness(
    weakness_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    w = (
        db.query(SkillWeakness)
        .join(Skill)
        .filter(SkillWeakness.id == weakness_id, Skill.user_id == user.id)
        .first()
    )
    if not w:
        raise HTTPException(status_code=404, detail="Weakness not found")
    db.delete(w)
    db.commit()
    return None
