"""
Skill Intelligence Engine: decay detection, practice imbalance,
neglected subskills, recommended drills, tree building.
"""
from datetime import date, datetime, timezone, timedelta
from collections import defaultdict

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_

from app.models import Skill, SkillProgress, PracticeSession, SkillArtifact, SkillWeakness


# Decay: assume "half-life" of ~14 days without practice (confidence/XP decay proxy)
DECAY_DAYS_THRESHOLD = 14
DECAY_RISK_AFTER_DAYS = 21


def _days_since(d: datetime | date | None) -> int | None:
    if not d:
        return None
    if isinstance(d, datetime):
        d = d.date()
    delta = date.today() - d
    return max(0, delta.days)


def _compute_decay_risk(last_practiced: datetime | date | None, confidence: float | None) -> float:
    days = _days_since(last_practiced)
    if days is None:
        return 0.85
    if days <= 7:
        return 0.0
    if days >= DECAY_RISK_AFTER_DAYS:
        return min(1.0, 0.5 + (days - DECAY_RISK_AFTER_DAYS) / 60.0)
    return 0.2 + 0.3 * (days - 7) / (DECAY_RISK_AFTER_DAYS - 7)


def get_or_create_progress(db: Session, skill: Skill) -> SkillProgress:
    prog = db.query(SkillProgress).filter(SkillProgress.skill_id == skill.id).first()
    if prog:
        return prog
    prog = SkillProgress(skill_id=skill.id, level=1, xp=0)
    db.add(prog)
    db.commit()
    db.refresh(prog)
    return prog


def update_decay_risk(db: Session, skill_id) -> None:
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        return
    prog = get_or_create_progress(db, skill)
    last = prog.last_practiced_at
    risk = _compute_decay_risk(last, prog.confidence_score)
    prog.decay_risk = risk
    db.commit()


def build_tree_for_user(db: Session, user_id: int, active_only: bool = True) -> list[Skill]:
    q = (
        db.query(Skill)
        .filter(Skill.user_id == user_id)
        .filter(Skill.parent_skill_id.is_(None))
    )
    if active_only:
        q = q.filter(Skill.active == "active")
    roots = q.options(
        joinedload(Skill.progress),
        joinedload(Skill.subskills).joinedload(Skill.progress),
    ).all()
    return list(roots)


def get_skill_with_children(db: Session, skill_id, user_id: int):
    skill = (
        db.query(Skill)
        .filter(Skill.id == skill_id, Skill.user_id == user_id)
        .options(
            joinedload(Skill.progress),
            joinedload(Skill.subskills).joinedload(Skill.progress),
            joinedload(Skill.practice_sessions),
            joinedload(Skill.artifacts),
            joinedload(Skill.weaknesses),
        )
        .first()
    )
    return skill


def session_counts_by_skill(db: Session, user_id: int) -> dict:
    rows = (
        db.query(PracticeSession.skill_id, func.count(PracticeSession.id).label("cnt"))
        .join(Skill)
        .filter(Skill.user_id == user_id)
        .group_by(PracticeSession.skill_id)
        .all()
    )
    return {str(r.skill_id): r.cnt for r in rows}


def practice_minutes_by_skill(db: Session, user_id: int) -> dict:
    rows = (
        db.query(PracticeSession.skill_id, func.coalesce(func.sum(PracticeSession.duration_minutes), 0).label("mins"))
        .join(Skill)
        .filter(Skill.user_id == user_id)
        .group_by(PracticeSession.skill_id)
        .all()
    )
    return {str(r.skill_id): int(r.mins) for r in rows}


def last_practiced_by_skill(db: Session, user_id: int) -> dict:
    rows = (
        db.query(
            PracticeSession.skill_id,
            func.max(PracticeSession.date).label("last_date"),
        )
        .join(Skill)
        .filter(Skill.user_id == user_id)
        .group_by(PracticeSession.skill_id)
        .all()
    )
    return {str(r.skill_id): r.last_date for r in rows}


def collect_insights(
    db: Session,
    user_id: int,
) -> tuple[list[dict], list[dict]]:
    """Returns (insights, decay_warnings)."""
    insights = []
    decay_warnings = []
    roots = build_tree_for_user(db, user_id, active_only=True)
    session_counts = session_counts_by_skill(db, user_id)
    practice_mins = practice_minutes_by_skill(db, user_id)
    last_dates = last_practiced_by_skill(db, user_id)

    def walk(skill: Skill):
        sid = str(skill.id)
        prog = get_or_create_progress(db, skill)
        days = _days_since(prog.last_practiced_at)
        decay_risk = _compute_decay_risk(prog.last_practiced_at, prog.confidence_score)
        prog.decay_risk = decay_risk
        if days is not None and days >= DECAY_DAYS_THRESHOLD and decay_risk > 0.3:
            decay_warnings.append({
                "type": "decay_warning",
                "skill_id": skill.id,
                "skill_name": skill.name,
                "message": f"This skill has not been practiced in {days} days and may be decaying.",
                "severity": "high" if days >= DECAY_RISK_AFTER_DAYS else "medium",
                "payload": {"days_since_practice": days, "decay_risk": decay_risk},
            })
        if not session_counts.get(sid) and skill.subskills:
            sub_with_practice = [s for s in skill.subskills if session_counts.get(str(s.id))]
            if sub_with_practice:
                insights.append({
                    "type": "practice_imbalance",
                    "skill_id": skill.id,
                    "skill_name": skill.name,
                    "message": f"You practice subskills of {skill.name} but not the root skill itself.",
                    "severity": "medium",
                    "payload": {},
                })
        for sub in skill.subskills:
            walk(sub)

    for root in roots:
        walk(root)

    # Neglected subskills: root has lots of practice, one subskill has little/none
    for root in roots:
        root_sid = str(root.id)
        root_sessions = session_counts.get(root_sid, 0)
        root_mins = practice_mins.get(root_sid, 0)
        for sub in root.subskills:
            sub_sid = str(sub.id)
            sub_sessions = session_counts.get(sub_sid, 0)
            sub_mins = practice_mins.get(sub_sid, 0)
            if root_sessions >= 3 and sub_sessions == 0:
                insights.append({
                    "type": "neglected_subskill",
                    "skill_id": sub.id,
                    "skill_name": sub.name,
                    "message": f"'{sub.name}' is a subskill of {root.name} but has no practice logged.",
                    "severity": "medium",
                    "payload": {"parent_name": root.name},
                })
            elif root_mins > 60 and sub_mins < 10:
                insights.append({
                    "type": "practice_imbalance",
                    "skill_id": sub.id,
                    "skill_name": sub.name,
                    "message": f"You practice {root.name} often but '{sub.name}' gets little time.",
                    "severity": "low",
                    "payload": {"parent_name": root.name},
                })

    # Missing proof: skill has sessions but no artifacts
    all_skills_flat = []
    def flatten(s: Skill):
        all_skills_flat.append(s)
        for c in s.subskills:
            flatten(c)
    for root in roots:
        flatten(root)
    for s in all_skills_flat:
        sid = str(s.id)
        if session_counts.get(sid, 0) >= 2:
            artifact_count = db.query(SkillArtifact).filter(SkillArtifact.skill_id == s.id).count()
            if artifact_count == 0:
                insights.append({
                    "type": "missing_proof",
                    "skill_id": s.id,
                    "skill_name": s.name,
                    "message": f"'{s.name}' has practice sessions but no proof/artifacts yet.",
                    "severity": "low",
                    "payload": {},
                })

    db.commit()
    return insights, decay_warnings


def recommend_drills(db: Session, user_id: int, limit: int = 5) -> list[dict]:
    """Recommend next drills: decay first, then neglected, then least recently practiced."""
    _, decay_warnings = collect_insights(db, user_id)
    recommended = []
    seen = set()

    for w in decay_warnings:
        sid = w["skill_id"]
        if sid not in seen:
            seen.add(sid)
            skill = db.query(Skill).filter(Skill.id == sid).first()
            if skill:
                recommended.append({
                    "skill_id": sid,
                    "skill_name": skill.name,
                    "focus_area": None,
                    "reason": w["message"],
                    "priority": 1,
                })
    if len(recommended) >= limit:
        return recommended[:limit]

    roots = build_tree_for_user(db, user_id, active_only=True)
    last_dates = last_practiced_by_skill(db, user_id)
    session_counts = session_counts_by_skill(db, user_id)

    candidates = []
    def collect(skill: Skill):
        sid = str(skill.id)
        if sid in seen:
            return
        last = last_dates.get(sid)
        days = _days_since(last) if last else 999
        candidates.append((skill, days, session_counts.get(sid, 0)))
        for c in skill.subskills:
            collect(c)
    for root in roots:
        collect(root)

    candidates.sort(key=lambda x: (-x[1], x[2]))
    for skill, days, _ in candidates:
        if len(recommended) >= limit:
            break
        if skill.id not in seen:
            seen.add(skill.id)
            reason = f"Not practiced in {days} days." if days > 0 else "No practice logged yet."
            recommended.append({
                "skill_id": skill.id,
                "skill_name": skill.name,
                "focus_area": None,
                "reason": reason,
                "priority": 2,
            })
    return recommended[:limit]


def add_xp_from_session(db: Session, skill_id, duration_minutes: int, quality_score: float | None) -> None:
    prog = db.query(SkillProgress).filter(SkillProgress.skill_id == skill_id).first()
    if not prog:
        skill = db.query(Skill).filter(Skill.id == skill_id).first()
        if skill:
            prog = get_or_create_progress(db, skill)
    if prog:
        base_xp = min(60, duration_minutes)  # cap 60 per session for simplicity
        if quality_score is not None:
            base_xp = int(base_xp * (0.5 + quality_score))
        prog.xp = (prog.xp or 0) + base_xp
        # Simple level: 100 * level for next level
        while (prog.level * 100) <= (prog.xp or 0):
            prog.level += 1
        db.commit()
