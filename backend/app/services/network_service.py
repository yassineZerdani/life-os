"""
Social Capital Engine: dashboard, dormant tie detection, social capital score, graph.
"""
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models import (
    Contact,
    ContactInteraction,
    ConnectionOpportunity,
    ReciprocityEntry,
)

# Dormant = no contact in this many days but relationship is valuable
DORMANT_DAYS_THRESHOLD = 90
MIN_SCORE_FOR_DORMANT = 5.0  # trust, warmth, or opportunity >= this


def _days_since(dt: datetime | None) -> int | None:
    if not dt:
        return None
    now = datetime.now(timezone.utc)
    if dt.tzinfo:
        delta = now - dt
    else:
        delta = now - dt.replace(tzinfo=timezone.utc)
    return max(0, delta.days)


def _is_dormant(contact: Contact, days_since_contact: int | None) -> bool:
    if days_since_contact is None:
        days_since_contact = 9999
    if days_since_contact < DORMANT_DAYS_THRESHOLD:
        return False
    trust = contact.trust_score or 0
    warmth = contact.warmth_score or 0
    opportunity = contact.opportunity_score or 0
    return (
        trust >= MIN_SCORE_FOR_DORMANT
        or warmth >= MIN_SCORE_FOR_DORMANT
        or opportunity >= MIN_SCORE_FOR_DORMANT
    )


def get_dormant_ties(db: Session, user_id: int):
    """Contacts that are valuable but under-maintained (no recent contact)."""
    contacts = (
        db.query(Contact)
        .filter(Contact.user_id == user_id)
        .all()
    )
    result = []
    for c in contacts:
        last = c.last_contact_at
        days = _days_since(last) if last else 9999
        if not _is_dormant(c, days):
            continue
        if (c.trust_score or 0) >= 7 and days >= 180:
            reason = "This mentor relationship is valuable but under-maintained."
        elif days >= DORMANT_DAYS_THRESHOLD and (c.opportunity_score or 0) >= 5:
            reason = "Connection linked to opportunity; worth reconnecting."
        elif (c.warmth_score or 0) >= 6 and days >= DORMANT_DAYS_THRESHOLD:
            reason = "Warm but neglected connection."
        else:
            reason = "Important person not contacted recently."
        result.append({"contact": c, "days_since_contact": days, "reason": reason})
    return result


def social_capital_score(db: Session, user_id: int) -> float | None:
    """Composite 0-100: trust, warmth, recency, opportunity potential."""
    contacts = (
        db.query(Contact)
        .filter(Contact.user_id == user_id)
        .all()
    )
    if not contacts:
        return None
    total = 0.0
    count = 0
    for c in contacts:
        t = c.trust_score if c.trust_score is not None else 5.0
        w = c.warmth_score if c.warmth_score is not None else 5.0
        o = c.opportunity_score if c.opportunity_score is not None else 5.0
        days = _days_since(c.last_contact_at)
        recency = 1.0
        if days is not None:
            if days <= 30:
                recency = 1.0
            elif days <= 90:
                recency = 0.7
            elif days <= 180:
                recency = 0.4
            else:
                recency = 0.2
        # 0-10 scale for t,w,o; recency 0-1
        component = (t + w + o) / 3.0 * recency
        total += component
        count += 1
    if count == 0:
        return None
    # Scale to 0-100
    raw = (total / count) * 10.0
    return round(min(100.0, max(0.0, raw)), 1)


def collect_insights(
    db: Session,
    user_id: int,
    dormant_list: list,
    open_opportunities_count: int,
) -> list[str]:
    """Dormant opportunity detector and one-sided relationship hints."""
    insights = []
    mentor_dormant = [
        d for d in dormant_list
        if d["contact"].category == "mentor" and (d["contact"].trust_score or 0) >= 6
    ]
    if mentor_dormant:
        insights.append(
            "This mentor relationship is valuable but under-maintained."
        )
    if len(dormant_list) >= 3 and open_opportunities_count > 0:
        insights.append(
            "Three dormant ties are connected to career opportunities."
        )
    if dormant_list and open_opportunities_count == 0:
        insights.append(
            "Reconnecting with dormant ties can unlock new opportunities."
        )
    return insights


def build_graph(db: Session, user_id: int) -> tuple[list[dict], list[dict]]:
    """Nodes: contacts + user; edges: user->contact, contact->opportunity."""
    contacts = (
        db.query(Contact)
        .filter(Contact.user_id == user_id)
        .all()
    )
    opportunities = (
        db.query(ConnectionOpportunity)
        .filter(
            ConnectionOpportunity.user_id == user_id,
            ConnectionOpportunity.status == "open",
        )
        .all()
    )
    nodes = []
    edges = []
    # Central node (user)
    nodes.append({
        "id": "user",
        "label": "You",
        "category": "user",
        "trust_score": None,
        "warmth_score": None,
        "opportunity_score": None,
        "is_dormant": False,
    })
    for c in contacts:
        days = _days_since(c.last_contact_at) if c.last_contact_at else None
        is_dormant = _is_dormant(c, days)
        nodes.append({
            "id": str(c.id),
            "label": c.name,
            "category": c.category,
            "trust_score": c.trust_score,
            "warmth_score": c.warmth_score,
            "opportunity_score": c.opportunity_score,
            "is_dormant": is_dormant,
        })
        edges.append({"source": "user", "target": str(c.id), "label": c.category})
    for opp in opportunities:
        opp_id = f"opp-{opp.id}"
        nodes.append({
            "id": opp_id,
            "label": opp.title[:30] + ("..." if len(opp.title) > 30 else ""),
            "category": "opportunity",
            "trust_score": None,
            "warmth_score": None,
            "opportunity_score": opp.potential_value,
            "is_dormant": False,
        })
        edges.append({
            "source": str(opp.contact_id),
            "target": opp_id,
            "label": opp.opportunity_type,
        })
    return nodes, edges
