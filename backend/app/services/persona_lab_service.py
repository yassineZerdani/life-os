"""
Persona Lab: profile, values alignment insights, identity drift detection.
"""
from sqlalchemy.orm import Session

from app.models import (
    PersonaIdentityProfile,
    PersonaValue,
    PersonaPrinciple,
    PersonaNarrativeEntry,
    PersonaAspect,
    IdentityDriftSignal,
)


def get_or_create_persona_profile(db: Session, user_id: int) -> PersonaIdentityProfile:
    profile = (
        db.query(PersonaIdentityProfile)
        .filter(PersonaIdentityProfile.user_id == user_id)
        .first()
    )
    if profile:
        return profile
    profile = PersonaIdentityProfile(user_id=user_id)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def collect_alignment_insights(db: Session, user_id: int) -> list[str]:
    """Values alignment engine: compare stated values/principles with profile and aspects."""
    insights = []
    values = (
        db.query(PersonaValue)
        .filter(PersonaValue.user_id == user_id)
        .order_by(PersonaValue.priority_score.desc().nulls_last())
        .all()
    )
    principles = (
        db.query(PersonaPrinciple)
        .filter(PersonaPrinciple.user_id == user_id, PersonaPrinciple.active.is_(True))
        .all()
    )
    profile = (
        db.query(PersonaIdentityProfile)
        .filter(PersonaIdentityProfile.user_id == user_id)
        .first()
    )
    aspects = (
        db.query(PersonaAspect)
        .filter(PersonaAspect.user_id == user_id, PersonaAspect.active.is_(True))
        .all()
    )

    if not profile:
        return insights

    # High-priority value but no principle backing it
    high_values = [v for v in values if (v.priority_score or 0) >= 7]
    if high_values and len(principles) < len(high_values):
        insights.append(
            "You have strong values; consider adding principles that translate "
            "them into daily behavior."
        )

    # Ideal self described but current self empty
    if profile.ideal_self_summary and not profile.current_self_summary:
        insights.append(
            "You've described your ideal self. Adding a current self summary "
            "helps track the gap."
        )

    # Tension in aspects
    high_tension = [a for a in aspects if (a.tension_score or 0) >= 6]
    if high_tension:
        names = ", ".join(a.name for a in high_tension[:2])
        insights.append(
            f"Higher tension in: {names}. Reflecting on what's conflicting can clarify."
        )

    # Many principles, few narrative entries (behavior vs story)
    narrative_count = (
        db.query(PersonaNarrativeEntry)
        .filter(PersonaNarrativeEntry.user_id == user_id)
        .count()
    )
    if len(principles) >= 3 and narrative_count == 0:
        insights.append(
            "Your principles are clear. Adding narrative entries (who I was, "
            "who I'm becoming) can ground them in your story."
        )

    return insights[:5]


def get_recent_drift_signals(db: Session, user_id: int, limit: int = 10):
    """Recent identity drift signals."""
    return (
        db.query(IdentityDriftSignal)
        .filter(IdentityDriftSignal.user_id == user_id)
        .order_by(IdentityDriftSignal.detected_at.desc())
        .limit(limit)
        .all()
    )


def detect_drift_from_gaps(db: Session, user_id: int) -> list[dict]:
    """Generate drift signals from profile/aspect gaps. Caller can persist them."""
    signals = []
    profile = (
        db.query(PersonaIdentityProfile)
        .filter(PersonaIdentityProfile.user_id == user_id)
        .first()
    )
    if not profile:
        return signals
    if profile.ideal_self_summary and not profile.current_self_summary:
        signals.append({
            "source": "profile_gap",
            "description": "Ideal self is described but current self is not. "
                          "Articulating current self helps measure alignment.",
            "severity": "low",
        })
    return signals
