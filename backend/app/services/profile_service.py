"""Profile service — get or create and update all profile sections by user_id."""
from sqlalchemy.orm import Session
from app.models import (
    User,
    PersonProfile,
    AppPreferences,
    HealthProfile,
    PsychologyProfile,
    FinanceProfile,
    CareerProfile,
    RelationshipProfile,
    LifestyleProfile,
    IdentityProfile,
    StrategyPreferenceProfile,
    HealthMedication,
    HealthSupplement,
    HealthAllergy,
    HealthGoal,
    HealthHabit,
    IncomeSource,
    DebtItem,
    AssetItem,
    FinanceGoal,
)
from datetime import datetime, timezone


def _completion_pct(filled: int, total: int) -> float:
    if total == 0:
        return 100.0
    return round(100.0 * filled / total, 1)


def get_or_create_person_profile(db: Session, user_id: int) -> PersonProfile:
    p = db.query(PersonProfile).filter(PersonProfile.user_id == user_id).first()
    if not p:
        p = PersonProfile(user_id=user_id)
        db.add(p)
        db.commit()
        db.refresh(p)
    return p


def get_or_create_app_preferences(db: Session, user_id: int) -> AppPreferences:
    p = db.query(AppPreferences).filter(AppPreferences.user_id == user_id).first()
    if not p:
        p = AppPreferences(user_id=user_id)
        db.add(p)
        db.commit()
        db.refresh(p)
    return p


def get_or_create_health_profile(db: Session, user_id: int) -> HealthProfile:
    p = db.query(HealthProfile).filter(HealthProfile.user_id == user_id).first()
    if not p:
        p = HealthProfile(user_id=user_id)
        db.add(p)
        db.commit()
        db.refresh(p)
    return p


def get_or_create_psychology_profile(db: Session, user_id: int) -> PsychologyProfile:
    p = db.query(PsychologyProfile).filter(PsychologyProfile.user_id == user_id).first()
    if not p:
        p = PsychologyProfile(user_id=user_id)
        db.add(p)
        db.commit()
        db.refresh(p)
    return p


def get_or_create_finance_profile(db: Session, user_id: int) -> FinanceProfile:
    p = db.query(FinanceProfile).filter(FinanceProfile.user_id == user_id).first()
    if not p:
        p = FinanceProfile(user_id=user_id)
        db.add(p)
        db.commit()
        db.refresh(p)
    return p


def get_or_create_career_profile(db: Session, user_id: int) -> CareerProfile:
    p = db.query(CareerProfile).filter(CareerProfile.user_id == user_id).first()
    if not p:
        p = CareerProfile(user_id=user_id)
        db.add(p)
        db.commit()
        db.refresh(p)
    return p


def get_or_create_relationship_profile(db: Session, user_id: int) -> RelationshipProfile:
    p = db.query(RelationshipProfile).filter(RelationshipProfile.user_id == user_id).first()
    if not p:
        p = RelationshipProfile(user_id=user_id)
        db.add(p)
        db.commit()
        db.refresh(p)
    return p


def get_or_create_lifestyle_profile(db: Session, user_id: int) -> LifestyleProfile:
    p = db.query(LifestyleProfile).filter(LifestyleProfile.user_id == user_id).first()
    if not p:
        p = LifestyleProfile(user_id=user_id)
        db.add(p)
        db.commit()
        db.refresh(p)
    return p


def get_or_create_identity_profile(db: Session, user_id: int) -> IdentityProfile:
    p = db.query(IdentityProfile).filter(IdentityProfile.user_id == user_id).first()
    if not p:
        p = IdentityProfile(user_id=user_id)
        db.add(p)
        db.commit()
        db.refresh(p)
    return p


def get_or_create_strategy_preference_profile(db: Session, user_id: int) -> StrategyPreferenceProfile:
    p = db.query(StrategyPreferenceProfile).filter(StrategyPreferenceProfile.user_id == user_id).first()
    if not p:
        p = StrategyPreferenceProfile(user_id=user_id)
        db.add(p)
        db.commit()
        db.refresh(p)
    return p


def profile_hub_summary(db: Session, user_id: int) -> dict:
    """Return hub data: each section with completion_pct, last_updated, summary."""
    sections = []

    def add(name: str, key: str, model, getter, total_fields: int, filled_count_func):
        try:
            obj = getter(db, user_id)
            updated = obj.updated_at or obj.created_at if hasattr(obj, "updated_at") else getattr(obj, "created_at", None)
            filled = filled_count_func(obj)
            sections.append({
                "key": key,
                "name": name,
                "completion_pct": _completion_pct(filled, total_fields),
                "last_updated": updated.isoformat() if updated else None,
                "summary": _section_summary(key, obj),
            })
        except Exception:
            sections.append({"key": key, "name": name, "completion_pct": 0.0, "last_updated": None, "summary": None})

    def filled_person(p):
        return sum(1 for k in ["full_name", "preferred_name", "birth_year", "location", "timezone", "occupation", "relationship_status", "living_situation"] if getattr(p, k, None))
    add("Personal Profile", "profile", PersonProfile, get_or_create_person_profile, 8, filled_person)

    def filled_app(a):
        return sum(1 for k in ["theme", "timezone", "language"] if getattr(a, k, None))
    add("App Settings", "app", AppPreferences, get_or_create_app_preferences, 3, filled_app)

    def filled_health(h):
        if not h:
            return 0
        n = sum(1 for k in ["eating_style", "conditions", "symptoms", "sleep_issues"] if getattr(h, k, None) and (not isinstance(getattr(h, k), (list, dict)) or len(getattr(h, k)) > 0))
        try:
            n += len(h.medications) + len(h.supplements) + len(h.allergies) + len(h.goals) + len(h.habits)
        except Exception:
            pass
        return min(n, 10)
    add("Health", "health", HealthProfile, get_or_create_health_profile, 10, filled_health)

    def filled_psychology(psy):
        return sum(1 for k in ["big_five", "emotional_triggers", "therapy_methods_interest", "journaling_preference"] if getattr(psy, k) and (isinstance(getattr(psy, k), (list, dict)) and len(getattr(psy, k)) or getattr(psy, k)))
    add("Psychology", "psychology", PsychologyProfile, get_or_create_psychology_profile, 4, filled_psychology)

    def filled_finance(f):
        if not f:
            return 0
        n = 1 if (getattr(f, "emergency_fund_target", None) or getattr(f, "risk_tolerance", None) or getattr(f, "budgeting_style", None)) else 0
        try:
            n += len(f.income_sources) + len(f.debts) + len(f.assets) + len(f.goals)
        except Exception:
            pass
        return min(n, 10)
    add("Finance", "finance", FinanceProfile, get_or_create_finance_profile, 10, filled_finance)

    def filled_career(c):
        return sum(1 for k in ["current_role", "active_projects", "desired_skills", "work_style", "long_term_career_goals"] if getattr(c, k) and (isinstance(getattr(c, k), (list, dict)) and len(getattr(c, k)) or getattr(c, k)))
    add("Career", "career", CareerProfile, get_or_create_career_profile, 5, filled_career)

    def filled_relationship(r):
        return sum(1 for k in ["partner_status", "close_friends", "support_network", "relationship_goals"] if getattr(r, k) and (isinstance(getattr(r, k), (list, dict)) and len(getattr(r, k)) or getattr(r, k)))
    add("Relationships", "relationships", RelationshipProfile, get_or_create_relationship_profile, 4, filled_relationship)

    def filled_lifestyle(l):
        return sum(1 for k in ["usual_sleep_schedule", "work_schedule", "gym_access", "weekend_structure"] if getattr(l, k) and (isinstance(getattr(l, k), (list, dict)) and len(getattr(l, k)) or getattr(l, k)))
    add("Lifestyle", "lifestyle", LifestyleProfile, get_or_create_lifestyle_profile, 4, filled_lifestyle)

    def filled_identity(i):
        return sum(1 for k in ["values", "principles", "purpose", "boundaries", "non_negotiables"] if getattr(i, k) and (isinstance(getattr(i, k), list) and len(getattr(i, k)) or getattr(i, k)))
    add("Identity & Values", "identity", IdentityProfile, get_or_create_identity_profile, 5, filled_identity)

    def filled_strategy(s):
        return sum(1 for k in ["strict_vs_flexible", "recommendation_style", "domain_priorities"] if getattr(s, k))
    add("Strategy Preferences", "strategies", StrategyPreferenceProfile, get_or_create_strategy_preference_profile, 3, filled_strategy)

    return {"sections": sections}


def _section_summary(key: str, obj) -> str | None:
    if not obj:
        return None
    if key == "profile" and isinstance(obj, PersonProfile):
        return obj.preferred_name or obj.full_name or "Not set"
    if key == "health" and isinstance(obj, HealthProfile):
        parts = []
        if obj.eating_style:
            parts.append(obj.eating_style)
        if obj.medications:
            parts.append(f"{len(obj.medications)} medications")
        return ", ".join(parts)[:80] if parts else None
    if key == "finance" and isinstance(obj, FinanceProfile):
        if obj.emergency_fund_target:
            return f"Emergency fund: {obj.emergency_fund_target}"
        return None
    if key == "career" and isinstance(obj, CareerProfile):
        return obj.current_role
    return None
