"""Life Memory Engine API — experiences, people, media, seasons, tags,
dashboard, map."""
from datetime import date
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models import User
from app.models import (
    LifeExperience,
    LifeExperiencePerson,
    LifeExperienceMedia,
    SeasonOfLife,
    LifeExperienceTag,
)
from app.schemas.life_memory import (
    LifeExperienceCreate,
    LifeExperienceUpdate,
    LifeExperienceResponse,
    LifeExperiencePersonCreate,
    LifeExperiencePersonResponse,
    LifeExperienceMediaCreate,
    LifeExperienceMediaResponse,
    SeasonOfLifeCreate,
    SeasonOfLifeUpdate,
    SeasonOfLifeResponse,
    LifeExperienceTagCreate,
    LifeExperienceTagResponse,
    LifeMemoryDashboardResponse,
    ExperienceWithRelations,
    MapPoint,
)
from app.services.life_memory_service import (
    get_peak_aliveness,
    get_peak_meaning,
    collect_insights,
    future_suggestions,
    get_map_points,
)

router = APIRouter()


@router.get("/dashboard", response_model=LifeMemoryDashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    count = (
        db.query(LifeExperience).filter(LifeExperience.user_id == user.id).count()
    )
    peak_alive = get_peak_aliveness(db, user.id, limit=100)
    peak_meaning_list = get_peak_meaning(db, user.id, limit=100)
    insights = collect_insights(db, user.id)
    suggestions = future_suggestions(db, user.id)
    return LifeMemoryDashboardResponse(
        experiences_count=count,
        peak_aliveness_count=len(peak_alive),
        peak_meaning_count=len(peak_meaning_list),
        insights=insights,
        future_suggestions=suggestions,
    )


@router.get(
    "/experiences/timeline", response_model=list[ExperienceWithRelations]
)
def get_timeline(
    limit: int = Query(100, le=200),
    category: str | None = None,
    emotional_tone: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(LifeExperience).filter(LifeExperience.user_id == user.id)
    if category:
        q = q.filter(LifeExperience.category == category)
    if emotional_tone:
        q = q.filter(LifeExperience.emotional_tone == emotional_tone)
    exps = (
        q.order_by(LifeExperience.date.desc()).limit(limit).all()
    )
    result = []
    for e in exps:
        people = db.query(LifeExperiencePerson).filter(
            LifeExperiencePerson.experience_id == e.id
        ).all()
        media = db.query(LifeExperienceMedia).filter(
            LifeExperienceMedia.experience_id == e.id
        ).all()
        tags = [
            t.tag
            for t in db.query(LifeExperienceTag).filter(
                LifeExperienceTag.experience_id == e.id
            ).all()
        ]
        result.append(
            ExperienceWithRelations(
                experience=LifeExperienceResponse.model_validate(e),
                people=[
                    LifeExperiencePersonResponse.model_validate(p)
                    for p in people
                ],
                media=[
                    LifeExperienceMediaResponse.model_validate(m)
                    for m in media
                ],
                tags=tags,
            )
        )
    return result


@router.get("/experiences/map", response_model=list[MapPoint])
def get_map(
    emotional_tone: str | None = None,
    category: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    exps = get_map_points(
        db, user.id, emotional_tone, category, start_date, end_date
    )
    return [
        MapPoint(
            id=str(e.id),
            title=e.title,
            latitude=e.latitude,
            longitude=e.longitude,
            date=e.date,
            category=e.category,
            emotional_tone=e.emotional_tone,
            aliveness_score=e.aliveness_score,
            meaning_score=e.meaning_score,
        )
        for e in exps
    ]


@router.get("/experiences", response_model=list[LifeExperienceResponse])
def list_experiences(
    category: str | None = None,
    emotional_tone: str | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(LifeExperience).filter(LifeExperience.user_id == user.id)
    if category:
        q = q.filter(LifeExperience.category == category)
    if emotional_tone:
        q = q.filter(LifeExperience.emotional_tone == emotional_tone)
    return q.order_by(LifeExperience.date.desc()).limit(limit).all()


@router.post("/experiences", response_model=LifeExperienceResponse)
def create_experience(
    body: LifeExperienceCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    e = LifeExperience(
        user_id=user.id,
        title=body.title,
        description=body.description,
        date=body.date,
        location_name=body.location_name,
        latitude=body.latitude,
        longitude=body.longitude,
        category=body.category,
        emotional_tone=body.emotional_tone,
        intensity_score=body.intensity_score,
        meaning_score=body.meaning_score,
        aliveness_score=body.aliveness_score,
        lesson_note=body.lesson_note,
    )
    db.add(e)
    db.commit()
    db.refresh(e)
    return LifeExperienceResponse.model_validate(e)


@router.get("/experiences/{exp_id}", response_model=ExperienceWithRelations)
def get_experience(
    exp_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    e = db.query(LifeExperience).filter(
        LifeExperience.id == exp_id,
        LifeExperience.user_id == user.id,
    ).first()
    if not e:
        raise HTTPException(status_code=404, detail="Experience not found")
    people = (
        db.query(LifeExperiencePerson)
        .filter(LifeExperiencePerson.experience_id == e.id)
        .all()
    )
    media = (
        db.query(LifeExperienceMedia)
        .filter(LifeExperienceMedia.experience_id == e.id)
        .all()
    )
    tags = [
        t.tag
        for t in db.query(LifeExperienceTag).filter(
            LifeExperienceTag.experience_id == e.id
        ).all()
    ]
    return ExperienceWithRelations(
        experience=LifeExperienceResponse.model_validate(e),
        people=[LifeExperiencePersonResponse.model_validate(p) for p in people],
        media=[LifeExperienceMediaResponse.model_validate(m) for m in media],
        tags=tags,
    )


@router.patch("/experiences/{exp_id}", response_model=LifeExperienceResponse)
def update_experience(
    exp_id: UUID,
    body: LifeExperienceUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    e = db.query(LifeExperience).filter(
        LifeExperience.id == exp_id,
        LifeExperience.user_id == user.id,
    ).first()
    if not e:
        raise HTTPException(status_code=404, detail="Experience not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(e, k, v)
    db.commit()
    db.refresh(e)
    return LifeExperienceResponse.model_validate(e)


@router.delete("/experiences/{exp_id}", status_code=204)
def delete_experience(
    exp_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    e = db.query(LifeExperience).filter(
        LifeExperience.id == exp_id,
        LifeExperience.user_id == user.id,
    ).first()
    if not e:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(e)
    db.commit()
    return None


@router.post("/experiences/people", response_model=LifeExperiencePersonResponse)
def add_person(
    body: LifeExperiencePersonCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    e = db.query(LifeExperience).filter(
        LifeExperience.id == body.experience_id,
        LifeExperience.user_id == user.id,
    ).first()
    if not e:
        raise HTTPException(status_code=404, detail="Experience not found")
    p = LifeExperiencePerson(
        experience_id=body.experience_id,
        person_name=body.person_name,
        relationship_type=body.relationship_type,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return LifeExperiencePersonResponse.model_validate(p)


@router.post("/experiences/media", response_model=LifeExperienceMediaResponse)
def add_media(
    body: LifeExperienceMediaCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    e = db.query(LifeExperience).filter(
        LifeExperience.id == body.experience_id,
        LifeExperience.user_id == user.id,
    ).first()
    if not e:
        raise HTTPException(status_code=404, detail="Experience not found")
    m = LifeExperienceMedia(
        experience_id=body.experience_id,
        media_type=body.media_type,
        media_url=body.media_url,
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return LifeExperienceMediaResponse.model_validate(m)


@router.post("/experiences/tags", response_model=LifeExperienceTagResponse)
def add_tag(
    body: LifeExperienceTagCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    e = db.query(LifeExperience).filter(
        LifeExperience.id == body.experience_id,
        LifeExperience.user_id == user.id,
    ).first()
    if not e:
        raise HTTPException(status_code=404, detail="Experience not found")
    t = LifeExperienceTag(experience_id=body.experience_id, tag=body.tag)
    db.add(t)
    db.commit()
    db.refresh(t)
    return LifeExperienceTagResponse.model_validate(t)


# ----- Seasons -----
@router.get("/seasons", response_model=list[SeasonOfLifeResponse])
def list_seasons(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(SeasonOfLife)
        .filter(SeasonOfLife.user_id == user.id)
        .order_by(SeasonOfLife.start_date.desc())
        .all()
    )


@router.post("/seasons", response_model=SeasonOfLifeResponse)
def create_season(
    body: SeasonOfLifeCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    s = SeasonOfLife(
        user_id=user.id,
        title=body.title,
        start_date=body.start_date,
        end_date=body.end_date,
        summary=body.summary,
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return SeasonOfLifeResponse.model_validate(s)


@router.patch("/seasons/{season_id}", response_model=SeasonOfLifeResponse)
def update_season(
    season_id: UUID,
    body: SeasonOfLifeUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    s = db.query(SeasonOfLife).filter(
        SeasonOfLife.id == season_id,
        SeasonOfLife.user_id == user.id,
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Season not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return SeasonOfLifeResponse.model_validate(s)


@router.delete("/seasons/{season_id}", status_code=204)
def delete_season(
    season_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    s = db.query(SeasonOfLife).filter(
        SeasonOfLife.id == season_id,
        SeasonOfLife.user_id == user.id,
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Season not found")
    db.delete(s)
    db.commit()
    return None


# ----- Peak experiences (for panel) -----
@router.get(
    "/experiences/peak/aliveness",
    response_model=list[LifeExperienceResponse],
)
def list_peak_aliveness(
    limit: int = 10,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return get_peak_aliveness(db, user.id, limit=limit)


@router.get(
    "/experiences/peak/meaning",
    response_model=list[LifeExperienceResponse],
)
def list_peak_meaning(
    limit: int = 10,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return get_peak_meaning(db, user.id, limit=limit)
