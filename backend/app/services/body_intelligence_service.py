"""Human Body Intelligence: body systems, organs, health score engine.
Uses nutrient/movement/symptom DB and junction tables when present; falls back to Organ JSONB.
Tiered anatomy: organs inherit default support/metric/signal from body system when has_custom_* is False.
"""
from sqlalchemy.orm import Session, joinedload
from app.models.body_intelligence import (
    BodySystem,
    Organ,
    OrganHealthScore,
    OrganNutrient,
    OrganMovement,
    OrganSymptom,
    Nutrient,
    MovementType,
    Symptom,
)
from app.models.health_profile import HealthProfile
from app.models.metric_definition import MetricDefinition, MetricEntry


def get_effective_support_for_organ(organ: Organ, system: BodySystem | None) -> dict:
    """Return effective nutrition_requirements, movement_requirements, sleep_requirements.
    Uses organ's data if has_custom_support_data else system default_support_profile_json.
    """
    if getattr(organ, "has_custom_support_data", False) and (
        organ.nutrition_requirements or organ.movement_requirements or organ.sleep_requirements
    ):
        return {
            "nutrition_requirements": organ.nutrition_requirements or [],
            "movement_requirements": organ.movement_requirements or [],
            "sleep_requirements": organ.sleep_requirements or [],
        }
    default = getattr(system, "default_support_profile_json", None) if system else None
    if not default:
        return {
            "nutrition_requirements": organ.nutrition_requirements or [],
            "movement_requirements": organ.movement_requirements or [],
            "sleep_requirements": organ.sleep_requirements or [],
        }
    return {
        "nutrition_requirements": organ.nutrition_requirements or default.get("nutrients") or default.get("nutrition_requirements") or [],
        "movement_requirements": organ.movement_requirements or default.get("movement") or default.get("movement_requirements") or [],
        "sleep_requirements": organ.sleep_requirements or default.get("sleep") or default.get("sleep_requirements") or [],
    }


def get_effective_metric_keys_for_organ(organ: Organ, system: BodySystem | None) -> list:
    """Return effective metric keys: organ's or system default_metrics_json."""
    if getattr(organ, "has_custom_metric_data", False) and organ.metric_keys:
        return organ.metric_keys
    default = getattr(system, "default_metrics_json", None) if system else None
    return organ.metric_keys or default or []


def get_effective_signals_for_organ(organ: Organ, system: BodySystem | None) -> tuple[list, list]:
    """Return (signals, symptoms) from organ or system default_signal_profile_json."""
    if getattr(organ, "has_custom_signal_data", False) and (organ.signals or organ.symptoms):
        return (organ.signals or [], organ.symptoms or [])
    default = getattr(system, "default_signal_profile_json", None) if system else None
    if not default:
        return (organ.signals or [], organ.symptoms or [])
    return (
        organ.signals or default.get("signals") or default.get("signals_list") or [],
        organ.symptoms or default.get("symptoms") or default.get("symptoms_list") or [],
    )


def get_body_systems(db: Session):
    return db.query(BodySystem).order_by(BodySystem.display_order, BodySystem.name).all()


def get_organs_by_system(db: Session, system_id: str):
    return (
        db.query(Organ)
        .filter(Organ.system_id == system_id)
        .order_by(Organ.display_order, Organ.name)
        .all()
    )


def get_organ_by_slug(db: Session, slug: str):
    return (
        db.query(Organ)
        .options(joinedload(Organ.system))
        .filter(Organ.slug == slug)
        .first()
    )


def get_organ_by_id(db: Session, organ_id: str):
    return (
        db.query(Organ)
        .options(joinedload(Organ.system))
        .filter(Organ.id == organ_id)
        .first()
    )


def get_all_organs_for_map(db: Session):
    """All organs with system, for body map (id, slug, name, system, map_region_id, health_score if user)."""
    return (
        db.query(Organ)
        .options(joinedload(Organ.system))
        .order_by(Organ.system_id, Organ.display_order, Organ.name)
        .all()
    )


def _normalize_for_match(arr: list | None) -> set:
    if not arr:
        return set()
    return set(str(x).lower().replace(" ", "_").replace("-", "_") for x in arr)


def _organ_nutrient_slugs(db: Session, organ: Organ) -> set:
    """Critical/important nutrient slugs for this organ (from DB or JSONB)."""
    links = (
        db.query(Nutrient.slug)
        .join(OrganNutrient)
        .filter(OrganNutrient.organ_id == organ.id)
        .all()
    )
    if links:
        return set(r[0] for r in links)
    return _normalize_for_match(organ.nutrition_requirements)


def _organ_movement_slugs(db: Session, organ: Organ) -> set:
    """Movement type slugs for this organ (from DB or JSONB)."""
    links = (
        db.query(MovementType.slug)
        .join(OrganMovement)
        .filter(OrganMovement.organ_id == organ.id)
        .all()
    )
    if links:
        return set(r[0] for r in links)
    return _normalize_for_match(organ.movement_requirements)


def _organ_symptom_slugs(db: Session, organ: Organ) -> set:
    """Early-warning symptom slugs for this organ (from DB or JSONB)."""
    links = (
        db.query(Symptom.slug)
        .join(OrganSymptom)
        .filter(OrganSymptom.organ_id == organ.id)
        .all()
    )
    if links:
        return set(r[0] for r in links)
    return _normalize_for_match(organ.signals) | _normalize_for_match(organ.symptoms)


def compute_organ_health_score(db: Session, user_id: int, organ: Organ) -> tuple[float, dict]:
    """
    Compute 0-100 health score for an organ from:
    nutrition (supplements/medications vs requirements), sleep, movement, symptoms, lab markers.
    Returns (score, factors dict).
    """
    factors = {"nutrition": 80.0, "sleep": 80.0, "movement": 80.0, "symptoms": 100.0, "metrics": 80.0}
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == user_id).first()

    organ_nutrition = _organ_nutrient_slugs(db, organ)
    organ_movement = _organ_movement_slugs(db, organ)
    organ_symptom_slugs = _organ_symptom_slugs(db, organ)

    # Symptoms: if user has profile symptoms that match organ signals/symptoms, penalize
    if profile and profile.symptoms:
        user_symptoms = _normalize_for_match(profile.symptoms)
        overlap = organ_symptom_slugs & user_symptoms
        if overlap:
            factors["symptoms"] = max(0, 100 - len(overlap) * 15)
            factors["symptoms_matched"] = list(overlap)

    # Digestive/energy issues can map to multiple organs
    if profile:
        if profile.digestive_issues and organ.system and organ.system.slug == "digestive":
            factors["symptoms"] = min(factors["symptoms"], 70)
        if profile.energy_issues and organ.system and organ.system.slug in ("nervous", "cardiovascular", "endocrine"):
            factors["symptoms"] = min(factors["symptoms"], 75)

    # Nutrition: user supplements vs organ requirements (simplified: has some support = good)
    if profile and organ_nutrition:
        supplement_names = set()
        for s in profile.supplements or []:
            name = (s.name or "").lower()
            supplement_names.add(name.replace(" ", "_").replace("-", "_"))
        overlap = organ_nutrition & supplement_names
        if organ_nutrition:
            factors["nutrition"] = 60 + 40 * (len(overlap) / max(1, len(organ_nutrition)))

    # Movement: user exercise_habits vs organ movement_requirements
    if profile and organ_movement:
        habits = _normalize_for_match(profile.exercise_habits or []) | _normalize_for_match(profile.movement_habits or [])
        overlap = organ_movement & habits
        if organ_movement:
            factors["movement"] = 60 + 40 * (len(overlap) / max(1, len(organ_movement)))

    # Sleep: if organ has sleep_requirements and user has sleep_issues, slight penalty
    if profile and profile.sleep_issues and organ.sleep_requirements:
        factors["sleep"] = 70

    # Metrics: if organ has metric_keys, use health domain metrics (simplified: assume 80 if no data)
    if organ.metric_keys:
        defs = db.query(MetricDefinition).filter(
            MetricDefinition.domain == "health",
            MetricDefinition.name.in_(organ.metric_keys),
        ).all()
        if defs:
            total = 0
            n = 0
            for md in defs:
                entry = (
                    db.query(MetricEntry)
                    .filter(MetricEntry.metric_id == md.id)
                    .order_by(MetricEntry.timestamp.desc())
                    .first()
                )
                if entry and entry.value is not None:
                    # Assume 0-100 scale or normalize
                    total += min(100, max(0, float(entry.value)))
                    n += 1
            factors["metrics"] = (total / n) if n else 80

    # Weighted average
    score = (
        factors["nutrition"] * 0.25
        + factors["sleep"] * 0.2
        + factors["movement"] * 0.2
        + factors["symptoms"] * 0.25
        + factors["metrics"] * 0.1
    )
    return round(min(100, max(0, score)), 1), factors


def get_or_compute_organ_health_score(db: Session, user_id: int, organ_id: str) -> OrganHealthScore | None:
    existing = (
        db.query(OrganHealthScore)
        .filter(OrganHealthScore.user_id == user_id, OrganHealthScore.organ_id == organ_id)
        .order_by(OrganHealthScore.computed_at.desc())
        .first()
    )
    organ = get_organ_by_id(db, organ_id)
    if not organ:
        return None
    score, factors = compute_organ_health_score(db, user_id, organ)
    if existing:
        existing.score = score
        existing.factors = factors
        db.commit()
        db.refresh(existing)
        return existing
    new_score = OrganHealthScore(user_id=user_id, organ_id=organ_id, score=score, factors=factors)
    db.add(new_score)
    db.commit()
    db.refresh(new_score)
    return new_score


def get_organ_dashboard(db: Session, organ_slug: str, user_id: int | None):
    """Organ dashboard: organ + health score + tracked metrics + risk signals.
    Uses effective support/metric/signal from system defaults when organ has no custom data.
    """
    organ = get_organ_by_slug(db, organ_slug)
    if not organ:
        return None
    system = organ.system
    effective_support = get_effective_support_for_organ(organ, system)
    effective_metric_keys = get_effective_metric_keys_for_organ(organ, system)
    effective_signals, effective_symptoms = get_effective_signals_for_organ(organ, system)

    health_score = None
    tracked_metrics = []
    risk_signals = []

    if user_id:
        score_row = get_or_compute_organ_health_score(db, user_id, str(organ.id))
        if score_row:
            health_score = {"score": score_row.score, "factors": score_row.factors or {}, "computed_at": score_row.computed_at}
        if effective_metric_keys:
            defs = db.query(MetricDefinition).filter(
                MetricDefinition.domain == "health",
                MetricDefinition.name.in_(effective_metric_keys),
            ).all()
            for md in defs:
                entry = (
                    db.query(MetricEntry)
                    .filter(MetricEntry.metric_id == md.id)
                    .order_by(MetricEntry.timestamp.desc())
                    .first()
                )
                tracked_metrics.append({
                    "name": md.name,
                    "unit": md.unit or "",
                    "latest_value": entry.value if entry else None,
                    "timestamp": entry.timestamp if entry else None,
                })
        if health_score and health_score.get("factors"):
            f = health_score["factors"]
            if f.get("symptoms") and f["symptoms"] < 100:
                risk_signals.extend(f.get("symptoms_matched", ["symptoms present"]))

    return {
        "organ": organ,
        "health_score": health_score,
        "tracked_metrics": tracked_metrics,
        "risk_signals": risk_signals,
        "ai_insights": None,
        "effective_overrides": {
            "nutrition_requirements": effective_support["nutrition_requirements"],
            "movement_requirements": effective_support["movement_requirements"],
            "sleep_requirements": effective_support["sleep_requirements"],
            "metric_keys": effective_metric_keys,
            "signals": effective_signals,
            "symptoms": effective_symptoms,
        },
    }


def get_anatomy_audit(db: Session) -> dict:
    """Audit report: organ counts by coverage (full, using fallback, missing data)."""
    organs = db.query(Organ).options(joinedload(Organ.system)).all()
    total = len(organs)
    full_coverage = 0
    using_fallback_support = 0
    using_fallback_metrics = 0
    using_fallback_signals = 0
    missing_support = 0
    no_metric_links = 0
    no_signal_links = 0

    for o in organs:
        has_support = bool(
            (getattr(o, "has_custom_support_data", False) and (o.nutrition_requirements or o.movement_requirements or o.sleep_requirements))
            or (o.system and getattr(o.system, "default_support_profile_json", None))
        )
        has_metrics = bool(
            (getattr(o, "has_custom_metric_data", False) and o.metric_keys)
            or (o.system and getattr(o.system, "default_metrics_json", None))
            or o.metric_keys
        )
        has_signals = bool(
            (getattr(o, "has_custom_signal_data", False) and (o.signals or o.symptoms))
            or (o.system and getattr(o.system, "default_signal_profile_json", None))
            or o.signals or o.symptoms
        )
        if getattr(o, "has_custom_support_data", False) and (o.nutrition_requirements or o.movement_requirements or o.sleep_requirements):
            full_coverage += 1
        elif not (o.nutrition_requirements or o.movement_requirements or o.sleep_requirements) and o.system and getattr(o.system, "default_support_profile_json", None):
            using_fallback_support += 1
        elif not (o.nutrition_requirements or o.movement_requirements or o.sleep_requirements):
            missing_support += 1
        if not getattr(o, "has_custom_metric_data", False) and o.system and getattr(o.system, "default_metrics_json", None) and not o.metric_keys:
            using_fallback_metrics += 1
        if not has_metrics:
            no_metric_links += 1
        if not getattr(o, "has_custom_signal_data", False) and o.system and getattr(o.system, "default_signal_profile_json", None) and not (o.signals or o.symptoms):
            using_fallback_signals += 1
        if not has_signals:
            no_signal_links += 1

    return {
        "total_organs": total,
        "organs_with_full_support_data": full_coverage,
        "organs_using_fallback_support": using_fallback_support,
        "organs_missing_support_data": missing_support,
        "organs_using_fallback_metrics": using_fallback_metrics,
        "organs_with_no_metric_links": no_metric_links,
        "organs_using_fallback_signals": using_fallback_signals,
        "organs_with_no_signal_links": no_signal_links,
    }
