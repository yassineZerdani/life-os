"""
Strategy Selection Engine - recommends strategies based on domain deficits,
active symptoms, personality traits, goals, insights, and adherence history.
"""
from sqlalchemy.orm import Session

from app.models import (
    StrategyLibraryItem,
    StrategyProtocol,
    ProtocolStep,
    UserActiveProtocol,
    DomainScore,
    Goal,
    Insight,
)
from app.services.strategy_library_service import get_user_active_protocols


EVIDENCE_WEIGHT = {"high": 1.0, "moderate": 0.8, "emerging": 0.6, "reflective": 0.5}
IMPACT_WEIGHT = {"high": 1.0, "medium": 0.7, "low": 0.4}
DIFFICULTY_PENALTY = {"easy": 0, "medium": 0.1, "hard": 0.2}


def _get_domain_deficits(db: Session) -> dict[str, float]:
    """Domain deficit = 100 - score. Higher deficit = more need."""
    scores = db.query(DomainScore).all()
    return {r.domain: max(0, 100 - float(r.score or 0)) for r in scores}


def _get_goals_by_domain(db: Session) -> dict[str, int]:
    """Count of active goals per domain."""
    goals = db.query(Goal).filter(Goal.status == "active").all()
    result = {}
    for g in goals:
        if g.domain_id:
            from app.models import Domain
            d = db.query(Domain).filter(Domain.id == g.domain_id).first()
            if d:
                result[d.slug] = result.get(d.slug, 0) + 1
    return result


def _get_recent_insights_by_domain(db: Session, days: int = 14) -> dict[str, int]:
    """Recent insights per domain (from last N days)."""
    from datetime import datetime, timedelta, timezone
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    insights = db.query(Insight).filter(Insight.created_at >= cutoff).all()
    result = {}
    for i in insights:
        if i.domain:
            result[i.domain] = result.get(i.domain, 0) + 1
    return result


def _get_active_protocol_domains(db: Session) -> set[str]:
    """Domains that already have active protocols."""
    active = get_user_active_protocols(db, active_only=True)
    return {a["domain_key"] for a in active}


def _score_strategy(
    strategy: StrategyLibraryItem,
    protocol: StrategyProtocol,
    domain_deficit: float,
    has_goals: bool,
    has_insights: bool,
    already_active_domain: bool,
) -> float:
    """
    Score a strategy+protocol for recommendation.
    Higher = better fit.
    """
    score = 0.0

    # Domain need (deficit)
    score += domain_deficit * 0.4

    # Evidence strength
    score += EVIDENCE_WEIGHT.get(strategy.evidence_level, 0.5) * 20

    # Impact
    score += IMPACT_WEIGHT.get(strategy.impact_level, 0.5) * 15

    # Difficulty penalty (prefer easier when deficit is high)
    diff_penalty = DIFFICULTY_PENALTY.get(strategy.difficulty_level, 0.1)
    score -= diff_penalty * 10

    # Boost if domain has goals
    if has_goals:
        score += 5

    # Boost if domain has recent insights (user is engaged)
    if has_insights:
        score += 3

    # Slight penalty if already have active protocol in domain (diversify)
    if already_active_domain:
        score -= 8

    return max(0, score)


def get_recommendations(
    db: Session,
    limit: int = 10,
    domain_key: str | None = None,
) -> list[dict]:
    """
    Return ranked strategy recommendations.
    Each item: strategy_name, protocol_name, why_recommended, evidence_level,
    estimated_benefit, estimated_effort, domain_key, module_source.
    """
    deficits = _get_domain_deficits(db)
    goals_by_domain = _get_goals_by_domain(db)
    insights_by_domain = _get_recent_insights_by_domain(db)
    active_domains = _get_active_protocol_domains(db)

    q = db.query(StrategyLibraryItem, StrategyProtocol).join(
        StrategyProtocol, StrategyProtocol.strategy_id == StrategyLibraryItem.id
    ).filter(StrategyLibraryItem.active == True)

    if domain_key:
        q = q.filter(StrategyLibraryItem.domain_key == domain_key)

    rows = q.all()
    scored = []

    for strategy, protocol in rows:
        dom = strategy.domain_key
        deficit = deficits.get(dom, 50)
        has_goals = (goals_by_domain.get(dom, 0) or 0) > 0
        has_insights = (insights_by_domain.get(dom, 0) or 0) > 0
        already_active = dom in active_domains

        s = _score_strategy(strategy, protocol, deficit, has_goals, has_insights, already_active)
        scored.append((s, strategy, protocol))

    scored.sort(key=lambda x: x[0], reverse=True)

    result = []
    for _, strategy, protocol in scored[:limit]:
        dom = strategy.domain_key
        deficit = deficits.get(dom, 50)

        why_parts = []
        if deficit >= 60:
            why_parts.append(f"High need in {dom} (score deficit)")
        elif deficit >= 40:
            why_parts.append(f"Moderate need in {dom}")
        if strategy.evidence_level == "high":
            why_parts.append("Strong evidence base")
        if strategy.impact_level == "high":
            why_parts.append("High expected impact")
        if dom in goals_by_domain and goals_by_domain[dom] > 0:
            why_parts.append("Aligns with your goals")
        if not why_parts:
            why_parts.append(f"Recommended for {dom}")

        result.append({
            "strategy_id": str(strategy.id),
            "strategy_name": strategy.name,
            "protocol_id": str(protocol.id),
            "protocol_name": protocol.name,
            "why_recommended": "; ".join(why_parts),
            "evidence_level": strategy.evidence_level,
            "estimated_benefit": strategy.impact_level,
            "estimated_effort": strategy.difficulty_level,
            "domain_key": dom,
            "module_source": strategy.module_key,
            "category": strategy.category,
        })

    return result
