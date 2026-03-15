"""Human Body Intelligence API: body systems, organs, organ dashboard."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user_optional
from app.models import User
from app.schemas.body_intelligence import (
    BodySystemResponse,
    OrganResponse,
    OrganWithSystemResponse,
    OrganDashboardResponse,
    OrganHealthScoreResponse,
)
from app.services import body_intelligence_service as svc

router = APIRouter()


def _organ_to_response(organ, include_system=False, overrides=None):
    overrides = overrides or {}
    data = {
        "id": organ.id,
        "system_id": organ.system_id,
        "key": getattr(organ, "key", None) or organ.slug,
        "slug": organ.slug,
        "name": organ.name,
        "description": organ.description,
        "detail_level": getattr(organ, "detail_level", None),
        "parent_organ_id": getattr(organ, "parent_organ_id", None),
        "anatomical_region": getattr(organ, "anatomical_region", None),
        "organ_type": getattr(organ, "organ_type", None),
        "has_custom_support_data": getattr(organ, "has_custom_support_data", False),
        "has_custom_metric_data": getattr(organ, "has_custom_metric_data", False),
        "has_custom_signal_data": getattr(organ, "has_custom_signal_data", False),
        "functions": organ.functions or [],
        "nutrition_requirements": overrides.get("nutrition_requirements", organ.nutrition_requirements or []),
        "movement_requirements": overrides.get("movement_requirements", organ.movement_requirements or []),
        "sleep_requirements": overrides.get("sleep_requirements", organ.sleep_requirements or []),
        "signals": overrides.get("signals", organ.signals or []),
        "symptoms": overrides.get("symptoms", organ.symptoms or []),
        "metric_keys": overrides.get("metric_keys", organ.metric_keys or []),
        "display_order": organ.display_order or 0,
        "map_region_id": organ.map_region_id,
    }
    if include_system and organ.system:
        s = organ.system
        data["system"] = BodySystemResponse(
            id=s.id,
            key=getattr(s, "key", None) or s.slug,
            slug=s.slug,
            name=s.name,
            description=s.description,
            display_order=s.display_order or 0,
            default_support_profile_json=getattr(s, "default_support_profile_json", None),
            default_metrics_json=getattr(s, "default_metrics_json", None),
            default_signal_profile_json=getattr(s, "default_signal_profile_json", None),
        )
    return OrganWithSystemResponse(**data) if include_system else OrganResponse(**data)


@router.get("/body-systems", response_model=list[BodySystemResponse])
def list_body_systems(db: Session = Depends(get_db)):
    """List all body systems (Cardiovascular, Nervous, etc.)."""
    systems = svc.get_body_systems(db)
    return [BodySystemResponse(
        id=s.id,
        key=getattr(s, "key", None) or s.slug,
        slug=s.slug,
        name=s.name,
        description=s.description,
        display_order=s.display_order or 0,
        default_support_profile_json=getattr(s, "default_support_profile_json", None),
        default_metrics_json=getattr(s, "default_metrics_json", None),
        default_signal_profile_json=getattr(s, "default_signal_profile_json", None),
    ) for s in systems]


@router.get("/body-systems/{system_id}/organs", response_model=list[OrganResponse])
def list_organs_by_system(system_id: UUID, db: Session = Depends(get_db)):
    """List organs for a body system."""
    organs = svc.get_organs_by_system(db, str(system_id))
    return [_organ_to_response(o, include_system=False) for o in organs]


@router.get("/organs", response_model=list[OrganWithSystemResponse])
def list_all_organs_for_map(db: Session = Depends(get_db)):
    """All organs with system (for body map)."""
    organs = svc.get_all_organs_for_map(db)
    return [_organ_to_response(o, include_system=True) for o in organs]


@router.get("/organs/by-slug/{slug}", response_model=OrganWithSystemResponse)
def get_organ_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get one organ by slug with system."""
    organ = svc.get_organ_by_slug(db, slug)
    if not organ:
        raise HTTPException(status_code=404, detail="Organ not found")
    return _organ_to_response(organ, include_system=True)


@router.get("/organs/{organ_id}/dashboard", response_model=OrganDashboardResponse)
def get_organ_dashboard(
    organ_id: UUID,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    """Organ health dashboard: score, metrics, risk signals. Requires auth for personalized score."""
    organ = svc.get_organ_by_id(db, str(organ_id))
    if not organ:
        raise HTTPException(status_code=404, detail="Organ not found")
    user_id = user.id if user else None
    dash = svc.get_organ_dashboard(db, organ.slug, user_id)
    if not dash:
        raise HTTPException(status_code=404, detail="Organ not found")
    overrides = dash.get("effective_overrides") or {}
    return OrganDashboardResponse(
        organ=_organ_to_response(dash["organ"], include_system=True, overrides=overrides),
        health_score=OrganHealthScoreResponse(**dash["health_score"]) if dash["health_score"] else None,
        tracked_metrics=dash["tracked_metrics"],
        risk_signals=dash["risk_signals"],
        ai_insights=dash.get("ai_insights"),
    )


@router.get("/organs/by-slug/{slug}/dashboard", response_model=OrganDashboardResponse)
def get_organ_dashboard_by_slug(
    slug: str,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    """Organ dashboard by slug (for frontend /health/organ/:slug). Returns effective support data from system when organ has no custom data."""
    dash = svc.get_organ_dashboard(db, slug, user.id if user else None)
    if not dash:
        raise HTTPException(status_code=404, detail="Organ not found")
    overrides = dash.get("effective_overrides") or {}
    return OrganDashboardResponse(
        organ=_organ_to_response(dash["organ"], include_system=True, overrides=overrides),
        health_score=OrganHealthScoreResponse(**dash["health_score"]) if dash["health_score"] else None,
        tracked_metrics=dash["tracked_metrics"],
        risk_signals=dash["risk_signals"],
        ai_insights=dash.get("ai_insights"),
    )


@router.get("/audit")
def get_anatomy_audit(db: Session = Depends(get_db)):
    """Internal audit: organ counts by coverage (full, fallback, missing)."""
    return svc.get_anatomy_audit(db)
