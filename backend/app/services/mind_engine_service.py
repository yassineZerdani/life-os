"""
Mind Engine: emotional weather, trigger-loop mapping, thought patterns,
regulation tracking, trend insights.
"""
from collections import defaultdict
from datetime import date, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import (
    EmotionalStateEntry,
    TriggerEntry,
    ThoughtPattern,
    BehaviorLoop,
    RegulationToolUse,
)


def get_emotional_weather(db: Session, user_id: int, days: int = 14) -> list[dict]:
    """Aggregate emotions by date for chart."""
    since = date.today() - timedelta(days=days)
    rows = (
        db.query(
            EmotionalStateEntry.date,
            EmotionalStateEntry.primary_emotion,
            func.avg(EmotionalStateEntry.intensity).label("avg_intensity"),
            func.count(EmotionalStateEntry.id).label("count"),
        )
        .filter(
            EmotionalStateEntry.user_id == user_id,
            EmotionalStateEntry.date >= since,
        )
        .group_by(
            EmotionalStateEntry.date,
            EmotionalStateEntry.primary_emotion,
        )
        .order_by(EmotionalStateEntry.date.desc())
        .all()
    )
    return [
        {
            "date": str(r.date),
            "primary_emotion": r.primary_emotion,
            "avg_intensity": (
                float(r.avg_intensity) if r.avg_intensity else None
            ),
            "count": r.count,
        }
        for r in rows
    ]


def get_trend_insights(db: Session, user_id: int) -> list[str]:
    """Generate safe, supportive insights from patterns in the data."""
    insights = []

    # Triggers with linked emotion/behavior
    triggers = (
        db.query(TriggerEntry)
        .filter(TriggerEntry.user_id == user_id)
        .order_by(TriggerEntry.date.desc())
        .limit(100)
        .all()
    )
    trigger_to_emotion = defaultdict(list)
    trigger_to_behavior = defaultdict(list)
    for t in triggers:
        if t.linked_emotion:
            trigger_to_emotion[t.trigger_type].append(t.linked_emotion)
        if t.linked_behavior:
            trigger_to_behavior[t.trigger_type].append(t.linked_behavior)

    for trigger_type, emotions in trigger_to_emotion.items():
        if len(emotions) >= 2:
            top = max(set(emotions), key=emotions.count)
            insights.append(
                f"'{trigger_type}' is often followed by {top}. "
                "Noticing this pattern can help you choose a response."
            )
    for trigger_type, behaviors in trigger_to_behavior.items():
        if len(behaviors) >= 2:
            top = max(set(behaviors), key=behaviors.count)
            insights.append(
                f"After '{trigger_type}', you often notice {top}. "
                "Mapping the loop can open space for different choices."
            )

    # Regulation: tools that work well
    tool_uses = (
        db.query(RegulationToolUse)
        .filter(RegulationToolUse.user_id == user_id)
        .all()
    )
    tool_effectiveness = defaultdict(list)
    for u in tool_uses:
        if u.effectiveness_score is not None:
            tool_effectiveness[u.tool_name].append(u.effectiveness_score)
    for tool_name, scores in tool_effectiveness.items():
        if len(scores) >= 2:
            avg = sum(scores) / len(scores)
            if avg >= 6:
                insights.append(
                    f"'{tool_name}' tends to help when you use it "
                    "(higher effectiveness). Keep it in your toolkit."
                )

    # High-frequency thought patterns
    patterns = (
        db.query(ThoughtPattern)
        .filter(ThoughtPattern.user_id == user_id)
        .all()
    )
    high_freq = [p for p in patterns if (p.frequency_score or 0) >= 6]
    if high_freq:
        insights.append(
            "Some thought patterns show up often. Naming them can reduce "
            "their automatic pull."
        )

    # Behavior loops defined
    loops_count = (
        db.query(BehaviorLoop)
        .filter(BehaviorLoop.user_id == user_id)
        .count()
    )
    if loops_count > 0 and triggers:
        insights.append(
            "You have trigger–behavior loops mapped. Reviewing them when "
            "calm can strengthen your response when triggered."
        )

    return insights[:6]


def get_top_tools(db: Session, user_id: int, limit: int = 5) -> list[dict]:
    """Tool name, use count, average effectiveness."""
    rows = (
        db.query(
            RegulationToolUse.tool_name,
            func.count(RegulationToolUse.id).label("count"),
            func.avg(RegulationToolUse.effectiveness_score).label("avg_eff"),
        )
        .filter(RegulationToolUse.user_id == user_id)
        .group_by(RegulationToolUse.tool_name)
        .order_by(func.count(RegulationToolUse.id).desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "tool_name": r.tool_name,
            "count": r.count,
            "avg_effectiveness": (
                round(float(r.avg_eff), 1) if r.avg_eff else None
            ),
        }
        for r in rows
    ]


def get_dashboard(
    db: Session,
    user_id: int,
    weather_days: int = 14,
    recent_limit: int = 10,
) -> dict:
    """Dashboard: counts, emotional weather, insights, recent entries, tools."""
    emotions_count = (
        db.query(EmotionalStateEntry)
        .filter(EmotionalStateEntry.user_id == user_id)
        .count()
    )
    triggers_count = (
        db.query(TriggerEntry)
        .filter(TriggerEntry.user_id == user_id)
        .count()
    )
    thought_patterns_count = (
        db.query(ThoughtPattern)
        .filter(ThoughtPattern.user_id == user_id)
        .count()
    )
    loops_count = (
        db.query(BehaviorLoop)
        .filter(BehaviorLoop.user_id == user_id)
        .count()
    )
    regulation_uses_count = (
        db.query(RegulationToolUse)
        .filter(RegulationToolUse.user_id == user_id)
        .count()
    )

    recent_emotions = (
        db.query(EmotionalStateEntry)
        .filter(EmotionalStateEntry.user_id == user_id)
        .order_by(
            EmotionalStateEntry.date.desc(),
            EmotionalStateEntry.created_at.desc(),
        )
        .limit(recent_limit)
        .all()
    )
    recent_triggers = (
        db.query(TriggerEntry)
        .filter(TriggerEntry.user_id == user_id)
        .order_by(
            TriggerEntry.date.desc(),
            TriggerEntry.created_at.desc(),
        )
        .limit(recent_limit)
        .all()
    )

    return {
        "emotions_count": emotions_count,
        "triggers_count": triggers_count,
        "thought_patterns_count": thought_patterns_count,
        "loops_count": loops_count,
        "regulation_uses_count": regulation_uses_count,
        "emotional_weather": get_emotional_weather(db, user_id, days=weather_days),
        "trend_insights": get_trend_insights(db, user_id),
        "recent_emotions": recent_emotions,
        "recent_triggers": recent_triggers,
        "top_tools": get_top_tools(db, user_id),
    }
