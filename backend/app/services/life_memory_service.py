"""
Life Memory Engine: peak experience detection, insights, future suggestions.
"""
from datetime import datetime, date, timedelta, timezone
from collections import Counter
from sqlalchemy.orm import Session

from app.models import (
    LifeExperience,
    LifeExperiencePerson,
    LifeExperienceMedia,
    LifeExperienceTag,
)

PEAK_ALIVENESS_THRESHOLD = 7.0
PEAK_MEANING_THRESHOLD = 7.0


def get_peak_aliveness(db: Session, user_id: int, limit: int = 10):
    """Experiences with aliveness_score >= threshold."""
    return (
        db.query(LifeExperience)
        .filter(
            LifeExperience.user_id == user_id,
            LifeExperience.aliveness_score >= PEAK_ALIVENESS_THRESHOLD,
        )
        .order_by(LifeExperience.aliveness_score.desc().nulls_last())
        .limit(limit)
        .all()
    )


def get_peak_meaning(db: Session, user_id: int, limit: int = 10):
    """Experiences with meaning_score >= threshold."""
    return (
        db.query(LifeExperience)
        .filter(
            LifeExperience.user_id == user_id,
            LifeExperience.meaning_score >= PEAK_MEANING_THRESHOLD,
        )
        .order_by(LifeExperience.meaning_score.desc().nulls_last())
        .limit(limit)
        .all()
    )


def collect_insights(db: Session, user_id: int) -> list[str]:
    """Peak experience detector: what brings aliveness, meaning, patterns."""
    insights = []
    experiences = (
        db.query(LifeExperience)
        .filter(LifeExperience.user_id == user_id)
        .all()
    )
    if not experiences:
        return insights

    peak_alive = [e for e in experiences if (e.aliveness_score or 0) >= PEAK_ALIVENESS_THRESHOLD]
    peak_meaning = [e for e in experiences if (e.meaning_score or 0) >= PEAK_MEANING_THRESHOLD]

    if peak_alive:
        categories = Counter(e.category for e in peak_alive)
        top_cat = categories.most_common(1)[0][0] if categories else None
        tones = Counter(e.emotional_tone for e in peak_alive if e.emotional_tone)
        top_tone = tones.most_common(1)[0][0] if tones else None
        with_location = sum(1 for e in peak_alive if e.latitude and e.longitude)
        with_people = db.query(LifeExperiencePerson).filter(
            LifeExperiencePerson.experience_id.in_([e.id for e in peak_alive])
        ).count()
        if with_location >= len(peak_alive) // 2 and with_people > 0:
            insights.append(
                "Your highest-aliveness experiences involve travel + close people."
            )
        elif top_cat:
            insights.append(
                f"You feel most alive in experiences tagged as \"{top_cat}\"."
            )

    if peak_meaning and len(peak_meaning) >= 3:
        categories = Counter(e.category for e in peak_meaning)
        top = categories.most_common(1)[0][0] if categories else None
        if top:
            insights.append(
                f"Your most meaningful experiences often fall under \"{top}\"."
            )

    # Transformative: high intensity + high meaning
    transformative = [
        e for e in experiences
        if (e.intensity_score or 0) >= 6 and (e.meaning_score or 0) >= 6
    ]
    if len(transformative) >= 2:
        insights.append(
            "You have several high-intensity, high-meaning experiences — "
            "consider what made them transformative."
        )

    return insights


def future_suggestions(db: Session, user_id: int) -> list[str]:
    """Suggest experience types that might be missing or under-represented."""
    suggestions = []
    experiences = (
        db.query(LifeExperience)
        .filter(LifeExperience.user_id == user_id)
        .all()
    )
    categories = Counter(e.category for e in experiences)
    total = len(experiences)

    # Suggest categories with few or no experiences
    candidate_categories = [
        ("creative", "Creative experiences"),
        ("travel", "Travel experiences"),
        ("social", "Social adventures"),
        ("reflective", "Spiritual / reflective experiences"),
        ("challenge", "Challenge experiences"),
        ("learning", "Learning in new environments"),
        ("nature", "Nature and outdoors"),
    ]
    for key, label in candidate_categories:
        count = categories.get(key, 0) + categories.get(label, 0)
        if total == 0 or count <= total // 5:
            suggestions.append(f"Consider more {label.lower()}.")

    if not suggestions:
        suggestions.append("Keep logging what feels vivid — patterns will emerge.")

    return suggestions[:6]


def get_map_points(
    db: Session,
    user_id: int,
    emotional_tone: str | None = None,
    category: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
):
    """Experiences with lat/lon for map, with optional filters."""
    q = (
        db.query(LifeExperience)
        .filter(
            LifeExperience.user_id == user_id,
            LifeExperience.latitude.isnot(None),
            LifeExperience.longitude.isnot(None),
        )
    )
    if emotional_tone:
        q = q.filter(LifeExperience.emotional_tone == emotional_tone)
    if category:
        q = q.filter(LifeExperience.category == category)
    if start_date:
        q = q.filter(LifeExperience.date >= start_date)
    if end_date:
        q = q.filter(LifeExperience.date <= end_date)
    return q.order_by(LifeExperience.date.desc()).all()
