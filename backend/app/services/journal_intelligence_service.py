"""
Journal Intelligence Service — analyze diary text, extract signals,
create suggested domain updates for user review.
Rule-based extraction (no external AI); designed for future AI integration.
"""
import re
from datetime import date
from sqlalchemy.orm import Session

from app.models import (
    JournalEntry,
    ExtractedSignal,
    SuggestedDomainUpdate,
)


# Simple keyword/signal patterns per domain (expand with regex or NLU later)
HEALTH_SLEEP_POOR = re.compile(
    r"\b(slept\s+badly|poor\s+sleep|insomnia|couldn't\s+sleep|tired|exhausted)\b",
    re.I,
)
HEALTH_CAFFEINE = re.compile(r"\b(coffee|caffeine|espresso)\b", re.I)
HEALTH_EXERCISE = re.compile(
    r"\b(workout|gym|ran|run|exercise|yoga|walked|swim)\b",
    re.I,
)
SKILLS_STUDY = re.compile(
    r"\b(studied|study|learned|learning|practiced|practice)\s+(\w+)(?:\s+for\s+(\d+)\s*(\w+))?",
    re.I,
)
RELATIONSHIPS_CONFLICT = re.compile(
    r"\b(argued|fight|conflict|disagreed)\s+(?:with\s+)?(\w+)",
    re.I,
)
WEALTH_SPENDING = re.compile(
    r"\b(spent|bought|purchase|delivery|food|order)\b",
    re.I,
)
CAREER_WORK = re.compile(
    r"\b(worked\s+(?:a\s+)?lot|work\s+all\s+day|busy\s+at\s+work|deadline)\b",
    re.I,
)


def _extract_signals_from_text(text: str) -> list[dict]:
    """Return list of {domain, signal_type, value_json, confidence, source_text}."""
    if not (text or text.strip()):
        return []
    signals = []
    t = text.strip()

    if HEALTH_SLEEP_POOR.search(t):
        signals.append({
            "domain": "health",
            "signal_type": "sleep_quality",
            "value_json": {"quality": "poor"},
            "confidence": 0.85,
            "source_text": "poor sleep / tired",
        })
    if HEALTH_CAFFEINE.search(t):
        m = re.search(r"(\d+)\s*(?:cups?\s+of\s+)?coffee", t, re.I) or re.search(r"coffee", t, re.I)
        count = int(m.group(1)) if m and m.lastindex and m.group(1).isdigit() else 1
        signals.append({
            "domain": "health",
            "signal_type": "caffeine",
            "value_json": {"count": min(count, 10)},
            "confidence": 0.8,
            "source_text": "caffeine/coffee",
        })
    if HEALTH_EXERCISE.search(t):
        signals.append({
            "domain": "health",
            "signal_type": "exercise",
            "value_json": {"logged": True},
            "confidence": 0.8,
            "source_text": "exercise/workout",
        })
    if SKILLS_STUDY.search(t):
        m = SKILLS_STUDY.search(t)
        skill = m.group(2) if m else "general"
        duration = None
        if m and m.lastindex >= 4 and m.group(3) and m.group(4):
            try:
                duration = int(m.group(3))
                unit = (m.group(4) or "").lower()
                if "min" in unit:
                    duration = duration
                elif "hour" in unit:
                    duration = duration * 60
            except ValueError:
                pass
        signals.append({
            "domain": "skills",
            "signal_type": "learning",
            "value_json": {"skill": skill, "duration_minutes": duration},
            "confidence": 0.75,
            "source_text": m.group(0) if m else "study",
        })
    if RELATIONSHIPS_CONFLICT.search(t):
        m = RELATIONSHIPS_CONFLICT.search(t)
        who = m.group(2) if m and m.lastindex >= 2 else "someone"
        signals.append({
            "domain": "relationships",
            "signal_type": "conflict",
            "value_json": {"with": who},
            "confidence": 0.8,
            "source_text": m.group(0) if m else "conflict",
        })
    if WEALTH_SPENDING.search(t):
        signals.append({
            "domain": "wealth",
            "signal_type": "spending",
            "value_json": {"category": "food", "note": "delivery/food"},
            "confidence": 0.7,
            "source_text": "spending",
        })
    if CAREER_WORK.search(t):
        signals.append({
            "domain": "career",
            "signal_type": "work_effort",
            "value_json": {"level": "high"},
            "confidence": 0.75,
            "source_text": "work",
        })

    return signals


def _signals_to_suggested_updates(signals: list[dict]) -> list[dict]:
    """Turn extracted signals into suggested domain update payloads."""
    updates = []
    for s in signals:
        updates.append({
            "domain": s["domain"],
            "update_type": s["signal_type"],
            "payload_json": s.get("value_json"),
            "confidence": s.get("confidence"),
        })
    return updates


def analyze_entry(db: Session, entry: JournalEntry) -> list[SuggestedDomainUpdate]:
    """
    Analyze journal entry text; create ExtractedSignals and SuggestedDomainUpdates (pending).
    Returns list of suggested updates for this entry.
    """
    text = (entry.raw_text or "").strip()
    if not text:
        return []

    # Delete previous extraction for this entry so we re-run idempotently
    db.query(ExtractedSignal).filter(ExtractedSignal.journal_entry_id == entry.id).delete()
    db.query(SuggestedDomainUpdate).filter(
        SuggestedDomainUpdate.journal_entry_id == entry.id,
    ).delete()
    db.flush()

    signals = _extract_signals_from_text(text)
    for s in signals:
        db.add(
            ExtractedSignal(
                journal_entry_id=entry.id,
                domain=s["domain"],
                signal_type=s["signal_type"],
                value_json=s.get("value_json"),
                confidence=s.get("confidence"),
                source_text=s.get("source_text"),
            )
        )
    db.flush()

    suggested = _signals_to_suggested_updates(signals)
    created = []
    for u in suggested:
        sup = SuggestedDomainUpdate(
            journal_entry_id=entry.id,
            domain=u["domain"],
            update_type=u["update_type"],
            payload_json=u.get("payload_json"),
            confidence=u.get("confidence"),
            status="pending",
        )
        db.add(sup)
        created.append(sup)
    db.commit()
    for s in created:
        db.refresh(s)
    return created


def apply_confirmed_updates(db: Session, entry: JournalEntry) -> None:
    """
    Apply suggested updates that are confirmed (or edited).
    Creates metric entries, experiences, etc. per domain.
    """
    from app.models import MetricDefinition, MetricEntry, Experience, LifeEvent

    confirmed = (
        db.query(SuggestedDomainUpdate)
        .filter(
            SuggestedDomainUpdate.journal_entry_id == entry.id,
            SuggestedDomainUpdate.status.in_(["confirmed", "edited"]),
        )
        .all()
    )
    for s in confirmed:
        # Placeholder: in production would create MetricEntry, Experience,
        # or domain-specific records from payload_json.
        pass
    db.commit()
