"""Profile API — hub, person, app, health, psychology, finance, career, relationships, lifestyle, identity, strategy preferences."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models import User
from app.schemas.profile import (
    ProfileHubResponse,
    PersonProfileResponse,
    PersonProfileUpdate,
    AppPreferencesResponse,
    AppPreferencesUpdate,
    HealthProfileResponse,
    HealthProfileUpdate,
    PsychologyProfileResponse,
    PsychologyProfileUpdate,
    FinanceProfileResponse,
    FinanceProfileUpdate,
    CareerProfileResponse,
    CareerProfileUpdate,
    RelationshipProfileResponse,
    RelationshipProfileUpdate,
    LifestyleProfileResponse,
    LifestyleProfileUpdate,
    IdentityProfileResponse,
    IdentityProfileUpdate,
    StrategyPreferenceProfileResponse,
    StrategyPreferenceProfileUpdate,
)
from app.services import profile_service

router = APIRouter()


def _person_to_response(p):
    return PersonProfileResponse(
        id=p.id,
        user_id=p.user_id,
        full_name=p.full_name,
        preferred_name=p.preferred_name,
        birth_year=p.birth_year,
        location=p.location,
        timezone=p.timezone,
        languages=p.languages,
        occupation=p.occupation,
        relationship_status=p.relationship_status,
        living_situation=p.living_situation,
        created_at=p.created_at,
        updated_at=p.updated_at,
    )


def _app_to_response(a):
    return AppPreferencesResponse(
        id=a.id,
        user_id=a.user_id,
        theme=a.theme,
        dark_mode=a.dark_mode,
        notifications_enabled=a.notifications_enabled,
        timezone=a.timezone,
        language=a.language,
        privacy_controls=a.privacy_controls,
        created_at=a.created_at,
        updated_at=a.updated_at,
    )


@router.get("/hub", response_model=ProfileHubResponse)
def get_profile_hub(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get profile hub summary: sections with completion %, last updated, summary."""
    return profile_service.profile_hub_summary(db, user.id)


@router.get("/person", response_model=PersonProfileResponse)
def get_person_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    p = profile_service.get_or_create_person_profile(db, user.id)
    return _person_to_response(p)


@router.patch("/person", response_model=PersonProfileResponse)
def update_person_profile(
    body: PersonProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    p = profile_service.get_or_create_person_profile(db, user.id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return _person_to_response(p)


@router.get("/app", response_model=AppPreferencesResponse)
def get_app_preferences(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    a = profile_service.get_or_create_app_preferences(db, user.id)
    return _app_to_response(a)


@router.patch("/app", response_model=AppPreferencesResponse)
def update_app_preferences(
    body: AppPreferencesUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    a = profile_service.get_or_create_app_preferences(db, user.id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(a, k, v)
    db.commit()
    db.refresh(a)
    return _app_to_response(a)


@router.get("/health", response_model=HealthProfileResponse)
def get_health_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    h = profile_service.get_or_create_health_profile(db, user.id)
    return HealthProfileResponse(
        id=str(h.id),
        user_id=h.user_id,
        conditions=h.conditions,
        symptoms=h.symptoms,
        sleep_issues=h.sleep_issues,
        eating_style=h.eating_style,
        movement_habits=h.movement_habits,
        exercise_habits=h.exercise_habits,
        substance_use_tracking=h.substance_use_tracking,
        energy_issues=h.energy_issues,
        digestive_issues=h.digestive_issues,
        providers=h.providers,
        key_lab_markers=h.key_lab_markers,
        created_at=h.created_at,
        updated_at=h.updated_at,
    )


@router.patch("/health", response_model=HealthProfileResponse)
def update_health_profile(
    body: HealthProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    h = profile_service.get_or_create_health_profile(db, user.id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(h, k, v)
    db.commit()
    db.refresh(h)
    return get_health_profile(db=db, user=user)


@router.get("/psychology", response_model=PsychologyProfileResponse)
def get_psychology_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    p = profile_service.get_or_create_psychology_profile(db, user.id)
    return PsychologyProfileResponse(
        id=str(p.id),
        user_id=p.user_id,
        big_five=p.big_five,
        emotional_triggers=p.emotional_triggers,
        coping_patterns=p.coping_patterns,
        thought_distortions=p.thought_distortions,
        behavior_loops=p.behavior_loops,
        therapy_methods_interest=p.therapy_methods_interest,
        cbt_preferences=p.cbt_preferences,
        dbt_preferences=p.dbt_preferences,
        shadow_work_interest=p.shadow_work_interest,
        journaling_preference=p.journaling_preference,
        stress_patterns=p.stress_patterns,
        mood_patterns=p.mood_patterns,
        created_at=p.created_at,
        updated_at=p.updated_at,
    )


@router.patch("/psychology", response_model=PsychologyProfileResponse)
def update_psychology_profile(
    body: PsychologyProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    p = profile_service.get_or_create_psychology_profile(db, user.id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return get_psychology_profile(db=db, user=user)


@router.get("/finance", response_model=FinanceProfileResponse)
def get_finance_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    f = profile_service.get_or_create_finance_profile(db, user.id)
    return FinanceProfileResponse(
        id=str(f.id),
        user_id=f.user_id,
        fixed_monthly_expenses=f.fixed_monthly_expenses,
        risk_tolerance=f.risk_tolerance,
        budgeting_style=f.budgeting_style,
        emergency_fund_target=f.emergency_fund_target,
        emergency_fund_currency=f.emergency_fund_currency,
        created_at=f.created_at,
        updated_at=f.updated_at,
    )


@router.patch("/finance", response_model=FinanceProfileResponse)
def update_finance_profile(
    body: FinanceProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    f = profile_service.get_or_create_finance_profile(db, user.id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(f, k, v)
    db.commit()
    db.refresh(f)
    return get_finance_profile(db=db, user=user)


@router.get("/career", response_model=CareerProfileResponse)
def get_career_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = profile_service.get_or_create_career_profile(db, user.id)
    return CareerProfileResponse(
        id=str(c.id),
        user_id=c.user_id,
        current_role=c.current_role,
        active_projects=c.active_projects,
        desired_skills=c.desired_skills,
        learning_priorities=c.learning_priorities,
        schedule_constraints=c.schedule_constraints,
        work_style=c.work_style,
        productivity_methods=c.productivity_methods,
        long_term_career_goals=c.long_term_career_goals,
        created_at=c.created_at,
        updated_at=c.updated_at,
    )


@router.patch("/career", response_model=CareerProfileResponse)
def update_career_profile(
    body: CareerProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = profile_service.get_or_create_career_profile(db, user.id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return get_career_profile(db=db, user=user)


@router.get("/relationships", response_model=RelationshipProfileResponse)
def get_relationship_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    r = profile_service.get_or_create_relationship_profile(db, user.id)
    return RelationshipProfileResponse(
        id=str(r.id),
        user_id=r.user_id,
        family_structure=r.family_structure,
        close_friends=r.close_friends,
        partner_status=r.partner_status,
        mentors=r.mentors,
        support_network=r.support_network,
        important_relationships=r.important_relationships,
        relationship_stressors=r.relationship_stressors,
        relationship_goals=r.relationship_goals,
        created_at=r.created_at,
        updated_at=r.updated_at,
    )


@router.patch("/relationships", response_model=RelationshipProfileResponse)
def update_relationship_profile(
    body: RelationshipProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    r = profile_service.get_or_create_relationship_profile(db, user.id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return get_relationship_profile(db=db, user=user)


@router.get("/lifestyle", response_model=LifestyleProfileResponse)
def get_lifestyle_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    l = profile_service.get_or_create_lifestyle_profile(db, user.id)
    return LifestyleProfileResponse(
        id=str(l.id),
        user_id=l.user_id,
        usual_sleep_schedule=l.usual_sleep_schedule,
        work_schedule=l.work_schedule,
        commute=l.commute,
        home_environment=l.home_environment,
        movement_environment=l.movement_environment,
        gym_access=l.gym_access,
        food_access=l.food_access,
        screen_time_habits=l.screen_time_habits,
        digital_distractions=l.digital_distractions,
        weekend_structure=l.weekend_structure,
        created_at=l.created_at,
        updated_at=l.updated_at,
    )


@router.patch("/lifestyle", response_model=LifestyleProfileResponse)
def update_lifestyle_profile(
    body: LifestyleProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    l = profile_service.get_or_create_lifestyle_profile(db, user.id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(l, k, v)
    db.commit()
    db.refresh(l)
    return get_lifestyle_profile(db=db, user=user)


@router.get("/identity", response_model=IdentityProfileResponse)
def get_identity_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    i = profile_service.get_or_create_identity_profile(db, user.id)
    return IdentityProfileResponse(
        id=str(i.id),
        user_id=i.user_id,
        values=i.values,
        principles=i.principles,
        purpose=i.purpose,
        spiritual_orientation=i.spiritual_orientation,
        ideal_self_description=i.ideal_self_description,
        representation_goals=i.representation_goals,
        boundaries=i.boundaries,
        non_negotiables=i.non_negotiables,
        created_at=i.created_at,
        updated_at=i.updated_at,
    )


@router.patch("/identity", response_model=IdentityProfileResponse)
def update_identity_profile(
    body: IdentityProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    i = profile_service.get_or_create_identity_profile(db, user.id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(i, k, v)
    db.commit()
    db.refresh(i)
    return get_identity_profile(db=db, user=user)


@router.get("/strategies", response_model=StrategyPreferenceProfileResponse)
def get_strategy_preference_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    s = profile_service.get_or_create_strategy_preference_profile(db, user.id)
    return StrategyPreferenceProfileResponse(
        id=str(s.id),
        user_id=s.user_id,
        strict_vs_flexible=s.strict_vs_flexible,
        data_heavy_vs_simple=s.data_heavy_vs_simple,
        science_backed=s.science_backed,
        exploratory_reflective=s.exploratory_reflective,
        wants_gamification=s.wants_gamification,
        wants_reminders=s.wants_reminders,
        recommendation_style=s.recommendation_style,
        domain_priorities=s.domain_priorities,
        created_at=s.created_at,
        updated_at=s.updated_at,
    )


@router.patch("/strategies", response_model=StrategyPreferenceProfileResponse)
def update_strategy_preference_profile(
    body: StrategyPreferenceProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    s = profile_service.get_or_create_strategy_preference_profile(db, user.id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return get_strategy_preference_profile(db=db, user=user)
