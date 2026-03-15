"""
Relationship Depth System: profile, pulse insights, misalignment detection.
"""
from sqlalchemy.orm import Session

from app.models import LoveProfile, LovePulseEntry


def get_or_create_love_profile(db: Session, user_id: int) -> LoveProfile:
    profile = db.query(LoveProfile).filter(LoveProfile.user_id == user_id).first()
    if profile:
        return profile
    profile = LoveProfile(user_id=user_id)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def get_latest_pulse(db: Session, user_id: int) -> LovePulseEntry | None:
    return (
        db.query(LovePulseEntry)
        .filter(LovePulseEntry.user_id == user_id)
        .order_by(LovePulseEntry.date.desc())
        .first()
    )


def collect_insights(db: Session, user_id: int) -> list[str]:
    """Simple misalignment-style insights from pulse history."""
    insights = []
    pulses = (
        db.query(LovePulseEntry)
        .filter(LovePulseEntry.user_id == user_id)
        .order_by(LovePulseEntry.date.desc())
        .limit(10)
        .all()
    )
    if not pulses:
        return insights
    latest = pulses[0]
    scores = {
        "closeness": latest.closeness_score,
        "communication": latest.communication_score,
        "trust": latest.trust_score,
        "tension": latest.tension_score,
        "support": latest.support_score,
        "future_alignment": latest.future_alignment_score,
    }
    strong = [k for k, v in scores.items() if v is not None and v >= 7]
    weak = [
        k for k, v in scores.items()
        if v is not None and v <= 4 and k != "tension"
    ]
    tension_high = (
        latest.tension_score is not None and latest.tension_score >= 6
    )
    if strong and weak:
        focus = weak[0].replace("_", " ")
        insights.append(
            f"Communication and connection are strong; "
            f"consider focusing on {focus}."
        )
    if tension_high and len(pulses) >= 2:
        insights.append(
            "Tension has been elevated. Repair and reconnection may help."
        )
    if (
        latest.future_alignment_score is not None
        and latest.future_alignment_score <= 4
    ):
        insights.append(
            "Future alignment is low. Shared vision conversations can help."
        )
    return insights
