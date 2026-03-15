"""Life Work Engine API — missions, milestones, achievements, opportunities, leverage, energy."""
from datetime import date
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_user
from app.models import User
from app.models import (
    LifeWorkMission,
    LifeWorkMilestone,
    LifeWorkAchievement,
    LifeWorkOpportunity,
    CareerLeverage,
    EnergyPattern,
)
from app.schemas.career import (
    MissionCreate,
    MissionUpdate,
    MissionResponse,
    MilestoneCreate,
    MilestoneUpdate,
    MilestoneResponse,
    AchievementCreate,
    AchievementResponse,
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityResponse,
    CareerLeverageUpdate,
    CareerLeverageResponse,
    EnergyPatternCreate,
    EnergyPatternResponse,
    CareerDashboardResponse,
)
from app.services.career_service import (
    get_or_create_leverage,
    get_weakest_leverage,
    get_recommended_leverage_action,
    get_energy_insights,
)

router = APIRouter()


def _mission_to_response(m: LifeWorkMission) -> dict:
    return {
        "id": m.id,
        "user_id": m.user_id,
        "title": m.title,
        "description": m.description,
        "status": m.status,
        "phase": m.phase,
        "priority": m.priority,
        "target_date": m.target_date,
        "created_at": m.created_at,
        "updated_at": m.updated_at,
        "milestones": [MilestoneResponse.model_validate(x) for x in m.milestones],
    }


# ----- Dashboard -----
@router.get("/dashboard", response_model=CareerDashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    missions = (
        db.query(LifeWorkMission)
        .filter(LifeWorkMission.user_id == user.id)
        .order_by(LifeWorkMission.priority.asc(), LifeWorkMission.created_at.desc())
        .all()
    )
    for m in missions:
        _ = m.milestones
    achievements_recent = (
        db.query(LifeWorkAchievement)
        .filter(LifeWorkAchievement.user_id == user.id)
        .order_by(LifeWorkAchievement.date.desc())
        .limit(10)
        .all()
    )
    opps = db.query(LifeWorkOpportunity.status, func.count(LifeWorkOpportunity.id)).filter(
        LifeWorkOpportunity.user_id == user.id
    ).group_by(LifeWorkOpportunity.status).all()
    opportunities_by_status = {s: c for s, c in opps}
    leverage = get_or_create_leverage(db, user.id)
    weakest = get_weakest_leverage(leverage)
    recommended = get_recommended_leverage_action(weakest) if weakest else None
    energy_insights = get_energy_insights(db, user.id)
    return CareerDashboardResponse(
        missions=[MissionResponse(**_mission_to_response(m)) for m in missions],
        achievements_recent=[AchievementResponse.model_validate(a) for a in achievements_recent],
        opportunities_by_status=opportunities_by_status,
        leverage=[CareerLeverageResponse.model_validate(l) for l in leverage],
        weakest_leverage_area=weakest,
        recommended_leverage_action=recommended,
        energy_insights=energy_insights,
    )


# ----- Missions -----
@router.get("/missions", response_model=list[MissionResponse])
def list_missions(
    status: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(LifeWorkMission).filter(LifeWorkMission.user_id == user.id)
    if status:
        q = q.filter(LifeWorkMission.status == status)
    missions = q.order_by(LifeWorkMission.priority.asc(), LifeWorkMission.created_at.desc()).all()
    return [MissionResponse(**_mission_to_response(m)) for m in missions]


@router.post("/missions", response_model=MissionResponse)
def create_mission(
    body: MissionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    m = LifeWorkMission(
        user_id=user.id,
        title=body.title,
        description=body.description,
        status=body.status,
        phase=body.phase,
        priority=body.priority,
        target_date=body.target_date,
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return MissionResponse(**_mission_to_response(m))


@router.get("/missions/{mission_id}", response_model=MissionResponse)
def get_mission(
    mission_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    m = db.query(LifeWorkMission).filter(
        LifeWorkMission.id == mission_id,
        LifeWorkMission.user_id == user.id,
    ).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mission not found")
    return MissionResponse(**_mission_to_response(m))


@router.patch("/missions/{mission_id}", response_model=MissionResponse)
def update_mission(
    mission_id: UUID,
    body: MissionUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    m = db.query(LifeWorkMission).filter(
        LifeWorkMission.id == mission_id,
        LifeWorkMission.user_id == user.id,
    ).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mission not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(m, k, v)
    db.commit()
    db.refresh(m)
    return MissionResponse(**_mission_to_response(m))


@router.delete("/missions/{mission_id}", status_code=204)
def delete_mission(
    mission_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    m = db.query(LifeWorkMission).filter(
        LifeWorkMission.id == mission_id,
        LifeWorkMission.user_id == user.id,
    ).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mission not found")
    db.delete(m)
    db.commit()
    return None


# ----- Milestones -----
@router.post("/milestones", response_model=MilestoneResponse)
def create_milestone(
    body: MilestoneCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    mission = db.query(LifeWorkMission).filter(
        LifeWorkMission.id == body.mission_id,
        LifeWorkMission.user_id == user.id,
    ).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    ms = LifeWorkMilestone(
        mission_id=body.mission_id,
        title=body.title,
        description=body.description,
        status=body.status,
        order_index=body.order_index,
    )
    db.add(ms)
    db.commit()
    db.refresh(ms)
    return ms


@router.patch("/milestones/{milestone_id}", response_model=MilestoneResponse)
def update_milestone(
    milestone_id: UUID,
    body: MilestoneUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from datetime import datetime, timezone
    ms = (
        db.query(LifeWorkMilestone)
        .join(LifeWorkMission)
        .filter(
            LifeWorkMilestone.id == milestone_id,
            LifeWorkMission.user_id == user.id,
        )
        .first()
    )
    if not ms:
        raise HTTPException(status_code=404, detail="Milestone not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(ms, k, v)
    if ms.status == "completed" and ms.completed_at is None:
        ms.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(ms)
    return ms


@router.delete("/milestones/{milestone_id}", status_code=204)
def delete_milestone(
    milestone_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    ms = (
        db.query(LifeWorkMilestone)
        .join(LifeWorkMission)
        .filter(
            LifeWorkMilestone.id == milestone_id,
            LifeWorkMission.user_id == user.id,
        )
        .first()
    )
    if not ms:
        raise HTTPException(status_code=404, detail="Milestone not found")
    db.delete(ms)
    db.commit()
    return None


# ----- Achievements -----
@router.get("/achievements", response_model=list[AchievementResponse])
def list_achievements(
    category: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(LifeWorkAchievement).filter(LifeWorkAchievement.user_id == user.id)
    if category:
        q = q.filter(LifeWorkAchievement.category == category)
    return q.order_by(LifeWorkAchievement.date.desc()).limit(limit).all()


@router.post("/achievements", response_model=AchievementResponse)
def create_achievement(
    body: AchievementCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    a = LifeWorkAchievement(
        user_id=user.id,
        title=body.title,
        description=body.description,
        category=body.category,
        impact_level=body.impact_level,
        date=body.date,
        proof_url=body.proof_url,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return a


@router.delete("/achievements/{achievement_id}", status_code=204)
def delete_achievement(
    achievement_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    a = db.query(LifeWorkAchievement).filter(
        LifeWorkAchievement.id == achievement_id,
        LifeWorkAchievement.user_id == user.id,
    ).first()
    if not a:
        raise HTTPException(status_code=404, detail="Achievement not found")
    db.delete(a)
    db.commit()
    return None


# ----- Opportunities -----
@router.get("/opportunities", response_model=list[OpportunityResponse])
def list_opportunities(
    status: str | None = None,
    type_: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(LifeWorkOpportunity).filter(LifeWorkOpportunity.user_id == user.id)
    if status:
        q = q.filter(LifeWorkOpportunity.status == status)
    if type_:
        q = q.filter(LifeWorkOpportunity.type == type_)
    return q.order_by(LifeWorkOpportunity.created_at.desc()).all()


@router.post("/opportunities", response_model=OpportunityResponse)
def create_opportunity(
    body: OpportunityCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    o = LifeWorkOpportunity(
        user_id=user.id,
        title=body.title,
        type=body.type,
        source=body.source,
        status=body.status,
        value_estimate=body.value_estimate,
        notes=body.notes,
    )
    db.add(o)
    db.commit()
    db.refresh(o)
    return o


@router.patch("/opportunities/{opportunity_id}", response_model=OpportunityResponse)
def update_opportunity(
    opportunity_id: UUID,
    body: OpportunityUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    o = db.query(LifeWorkOpportunity).filter(
        LifeWorkOpportunity.id == opportunity_id,
        LifeWorkOpportunity.user_id == user.id,
    ).first()
    if not o:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(o, k, v)
    db.commit()
    db.refresh(o)
    return o


@router.delete("/opportunities/{opportunity_id}", status_code=204)
def delete_opportunity(
    opportunity_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    o = db.query(LifeWorkOpportunity).filter(
        LifeWorkOpportunity.id == opportunity_id,
        LifeWorkOpportunity.user_id == user.id,
    ).first()
    if not o:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    db.delete(o)
    db.commit()
    return None


# ----- Leverage -----
@router.get("/leverage", response_model=list[CareerLeverageResponse])
def list_leverage(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rows = get_or_create_leverage(db, user.id)
    return [CareerLeverageResponse.model_validate(r) for r in rows]


@router.patch("/leverage/{area}", response_model=CareerLeverageResponse)
def update_leverage(
    area: str,
    body: CareerLeverageUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    row = db.query(CareerLeverage).filter(
        CareerLeverage.user_id == user.id,
        CareerLeverage.area == area,
    ).first()
    if not row:
        row = CareerLeverage(user_id=user.id, area=area, score=5.0)
        db.add(row)
        db.commit()
        db.refresh(row)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


# ----- Energy patterns -----
@router.get("/energy-patterns", response_model=list[EnergyPatternResponse])
def list_energy_patterns(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(EnergyPattern)
        .filter(EnergyPattern.user_id == user.id)
        .order_by(EnergyPattern.recorded_at.desc())
        .limit(50)
        .all()
    )


@router.post("/energy-patterns", response_model=EnergyPatternResponse)
def create_energy_pattern(
    body: EnergyPatternCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    e = EnergyPattern(
        user_id=user.id,
        work_type=body.work_type,
        energy_effect=body.energy_effect,
        focus_quality=body.focus_quality,
        notes=body.notes,
    )
    db.add(e)
    db.commit()
    db.refresh(e)
    return e
