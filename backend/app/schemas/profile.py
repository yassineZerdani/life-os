"""Profile schemas for request/response."""
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel


class PersonProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: Optional[str] = None
    preferred_name: Optional[str] = None
    birth_year: Optional[int] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    languages: Optional[list[str]] = None
    occupation: Optional[str] = None
    relationship_status: Optional[str] = None
    living_situation: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PersonProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    preferred_name: Optional[str] = None
    birth_year: Optional[int] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    languages: Optional[list[str]] = None
    occupation: Optional[str] = None
    relationship_status: Optional[str] = None
    living_situation: Optional[str] = None


class AppPreferencesResponse(BaseModel):
    id: int
    user_id: int
    theme: Optional[str] = None
    dark_mode: Optional[bool] = None
    notifications_enabled: Optional[bool] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    privacy_controls: Optional[dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AppPreferencesUpdate(BaseModel):
    theme: Optional[str] = None
    dark_mode: Optional[bool] = None
    notifications_enabled: Optional[bool] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    privacy_controls: Optional[dict[str, Any]] = None


class ProfileHubSection(BaseModel):
    key: str
    name: str
    completion_pct: float
    last_updated: Optional[str] = None
    summary: Optional[str] = None


class ProfileHubResponse(BaseModel):
    sections: list[ProfileHubSection]


# Health, Psychology, Finance, etc. — generic response/update with JSONB
class HealthProfileResponse(BaseModel):
    id: str
    user_id: int
    conditions: Optional[list[Any]] = None
    symptoms: Optional[list[Any]] = None
    sleep_issues: Optional[list[Any]] = None
    eating_style: Optional[str] = None
    movement_habits: Optional[list[Any]] = None
    exercise_habits: Optional[list[Any]] = None
    substance_use_tracking: Optional[list[Any]] = None
    energy_issues: Optional[list[Any]] = None
    digestive_issues: Optional[list[Any]] = None
    providers: Optional[list[Any]] = None
    key_lab_markers: Optional[list[Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class HealthProfileUpdate(BaseModel):
    conditions: Optional[list[Any]] = None
    symptoms: Optional[list[Any]] = None
    sleep_issues: Optional[list[Any]] = None
    eating_style: Optional[str] = None
    movement_habits: Optional[list[Any]] = None
    exercise_habits: Optional[list[Any]] = None
    substance_use_tracking: Optional[list[Any]] = None
    energy_issues: Optional[list[Any]] = None
    digestive_issues: Optional[list[Any]] = None
    providers: Optional[list[Any]] = None
    key_lab_markers: Optional[list[Any]] = None


class PsychologyProfileResponse(BaseModel):
    id: str
    user_id: int
    big_five: Optional[dict[str, Any]] = None
    emotional_triggers: Optional[list[Any]] = None
    coping_patterns: Optional[list[Any]] = None
    thought_distortions: Optional[list[Any]] = None
    behavior_loops: Optional[list[Any]] = None
    therapy_methods_interest: Optional[list[Any]] = None
    cbt_preferences: Optional[dict[str, Any]] = None
    dbt_preferences: Optional[dict[str, Any]] = None
    shadow_work_interest: Optional[dict[str, Any]] = None
    journaling_preference: Optional[str] = None
    stress_patterns: Optional[list[Any]] = None
    mood_patterns: Optional[list[Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PsychologyProfileUpdate(BaseModel):
    big_five: Optional[dict[str, Any]] = None
    emotional_triggers: Optional[list[Any]] = None
    coping_patterns: Optional[list[Any]] = None
    thought_distortions: Optional[list[Any]] = None
    behavior_loops: Optional[list[Any]] = None
    therapy_methods_interest: Optional[list[Any]] = None
    cbt_preferences: Optional[dict[str, Any]] = None
    dbt_preferences: Optional[dict[str, Any]] = None
    shadow_work_interest: Optional[dict[str, Any]] = None
    journaling_preference: Optional[str] = None
    stress_patterns: Optional[list[Any]] = None
    mood_patterns: Optional[list[Any]] = None


class FinanceProfileResponse(BaseModel):
    id: str
    user_id: int
    fixed_monthly_expenses: Optional[float] = None
    risk_tolerance: Optional[str] = None
    budgeting_style: Optional[str] = None
    emergency_fund_target: Optional[float] = None
    emergency_fund_currency: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FinanceProfileUpdate(BaseModel):
    fixed_monthly_expenses: Optional[float] = None
    risk_tolerance: Optional[str] = None
    budgeting_style: Optional[str] = None
    emergency_fund_target: Optional[float] = None
    emergency_fund_currency: Optional[str] = None


class CareerProfileResponse(BaseModel):
    id: str
    user_id: int
    current_role: Optional[str] = None
    active_projects: Optional[list[Any]] = None
    desired_skills: Optional[list[Any]] = None
    learning_priorities: Optional[list[Any]] = None
    schedule_constraints: Optional[dict[str, Any]] = None
    work_style: Optional[str] = None
    productivity_methods: Optional[list[Any]] = None
    long_term_career_goals: Optional[list[Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CareerProfileUpdate(BaseModel):
    current_role: Optional[str] = None
    active_projects: Optional[list[Any]] = None
    desired_skills: Optional[list[Any]] = None
    learning_priorities: Optional[list[Any]] = None
    schedule_constraints: Optional[dict[str, Any]] = None
    work_style: Optional[str] = None
    productivity_methods: Optional[list[Any]] = None
    long_term_career_goals: Optional[list[Any]] = None


class RelationshipProfileResponse(BaseModel):
    id: str
    user_id: int
    family_structure: Optional[dict[str, Any]] = None
    close_friends: Optional[list[Any]] = None
    partner_status: Optional[str] = None
    mentors: Optional[list[Any]] = None
    support_network: Optional[list[Any]] = None
    important_relationships: Optional[list[Any]] = None
    relationship_stressors: Optional[list[Any]] = None
    relationship_goals: Optional[list[Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RelationshipProfileUpdate(BaseModel):
    family_structure: Optional[dict[str, Any]] = None
    close_friends: Optional[list[Any]] = None
    partner_status: Optional[str] = None
    mentors: Optional[list[Any]] = None
    support_network: Optional[list[Any]] = None
    important_relationships: Optional[list[Any]] = None
    relationship_stressors: Optional[list[Any]] = None
    relationship_goals: Optional[list[Any]] = None


class LifestyleProfileResponse(BaseModel):
    id: str
    user_id: int
    usual_sleep_schedule: Optional[dict[str, Any]] = None
    work_schedule: Optional[dict[str, Any]] = None
    commute: Optional[dict[str, Any]] = None
    home_environment: Optional[dict[str, Any]] = None
    movement_environment: Optional[dict[str, Any]] = None
    gym_access: Optional[str] = None
    food_access: Optional[dict[str, Any]] = None
    screen_time_habits: Optional[list[Any]] = None
    digital_distractions: Optional[list[Any]] = None
    weekend_structure: Optional[dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LifestyleProfileUpdate(BaseModel):
    usual_sleep_schedule: Optional[dict[str, Any]] = None
    work_schedule: Optional[dict[str, Any]] = None
    commute: Optional[dict[str, Any]] = None
    home_environment: Optional[dict[str, Any]] = None
    movement_environment: Optional[dict[str, Any]] = None
    gym_access: Optional[str] = None
    food_access: Optional[dict[str, Any]] = None
    screen_time_habits: Optional[list[Any]] = None
    digital_distractions: Optional[list[Any]] = None
    weekend_structure: Optional[dict[str, Any]] = None


class IdentityProfileResponse(BaseModel):
    id: str
    user_id: int
    values: Optional[list[Any]] = None
    principles: Optional[list[Any]] = None
    purpose: Optional[str] = None
    spiritual_orientation: Optional[str] = None
    ideal_self_description: Optional[str] = None
    representation_goals: Optional[list[Any]] = None
    boundaries: Optional[list[Any]] = None
    non_negotiables: Optional[list[Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class IdentityProfileUpdate(BaseModel):
    values: Optional[list[Any]] = None
    principles: Optional[list[Any]] = None
    purpose: Optional[str] = None
    spiritual_orientation: Optional[str] = None
    ideal_self_description: Optional[str] = None
    representation_goals: Optional[list[Any]] = None
    boundaries: Optional[list[Any]] = None
    non_negotiables: Optional[list[Any]] = None


class StrategyPreferenceProfileResponse(BaseModel):
    id: str
    user_id: int
    strict_vs_flexible: Optional[str] = None
    data_heavy_vs_simple: Optional[str] = None
    science_backed: Optional[bool] = None
    exploratory_reflective: Optional[bool] = None
    wants_gamification: Optional[bool] = None
    wants_reminders: Optional[bool] = None
    recommendation_style: Optional[str] = None
    domain_priorities: Optional[list[str]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StrategyPreferenceProfileUpdate(BaseModel):
    strict_vs_flexible: Optional[str] = None
    data_heavy_vs_simple: Optional[str] = None
    science_backed: Optional[bool] = None
    exploratory_reflective: Optional[bool] = None
    wants_gamification: Optional[bool] = None
    wants_reminders: Optional[bool] = None
    recommendation_style: Optional[str] = None
    domain_priorities: Optional[list[str]] = None
