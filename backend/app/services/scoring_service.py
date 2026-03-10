"""
Scoring Engine - computes domain scores from metrics.

Formula: domain_score = sum(metric_normalized_value * metric_weight)
Score must be between 0 and 100. Store result in DomainScore.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import Optional
from app.models import Domain, MetricDefinition, MetricEntry, DomainScore


def _normalize_value(value: float, min_val: float, max_val: float) -> float:
    """Normalize value to 0-100 scale. If min==max, return 50 (neutral)."""
    if max_val is None or min_val is None or max_val == min_val:
        return 50.0
    normalized = (value - min_val) / (max_val - min_val) * 100
    return max(0, min(100, normalized))


def _get_metric_bounds(db: Session, metric_id, days: int = 90) -> tuple[Optional[float], Optional[float]]:
    """Get min/max values for a metric over the last N days for normalization."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    result = (
        db.query(func.min(MetricEntry.value), func.max(MetricEntry.value))
        .filter(MetricEntry.metric_id == metric_id, MetricEntry.timestamp >= cutoff)
        .first()
    )
    if result and result[0] is not None and result[1] is not None:
        return result[0], result[1]
    return None, None


def _get_latest_metric_value(db: Session, metric_id) -> Optional[float]:
    """Get the most recent value for a metric."""
    entry = (
        db.query(MetricEntry)
        .filter(MetricEntry.metric_id == metric_id)
        .order_by(desc(MetricEntry.timestamp))
        .first()
    )
    return entry.value if entry else None


def compute_domain_score(db: Session, domain: str) -> float:
    """
    Compute domain score (0-100) from weighted metrics.
    domain_score = sum(normalized_value * weight) / sum(weights)
    """
    metrics = db.query(MetricDefinition).filter(MetricDefinition.domain == domain).all()
    if not metrics:
        return 0.0

    total_weighted_score = 0.0
    total_weight = 0.0

    for metric in metrics:
        weight = metric.weight if metric.weight and metric.weight > 0 else 1.0
        value = _get_latest_metric_value(db, metric.id)
        if value is None:
            continue

        min_val, max_val = _get_metric_bounds(db, metric.id)
        normalized = _normalize_value(value, min_val or value, max_val or value)
        total_weighted_score += normalized * weight
        total_weight += weight

    if total_weight == 0:
        return 0.0
    return total_weighted_score / total_weight


def xp_required_for_level(level: int) -> float:
    """XP required to reach a given level: 100 * level^1.5"""
    return 100 * (level ** 1.5)


def update_domain_score_record(db: Session, domain: str, score: float, add_xp: float = 0) -> DomainScore:
    """
    Update or create DomainScore record. Optionally add XP and handle level-up.
    When XP exceeds requirement: increase level, subtract required XP, keep remaining.
    """
    record = db.query(DomainScore).filter(DomainScore.domain == domain).first()
    if not record:
        record = DomainScore(domain=domain, score=0, level=1, xp=0)
        db.add(record)
        db.flush()

    record.score = min(100, max(0, score))
    record.xp = int(record.xp) + int(add_xp)

    # Level up logic
    required = xp_required_for_level(record.level)
    while record.xp >= required:
        record.xp = int(record.xp) - int(required)
        record.level += 1
        required = xp_required_for_level(record.level)

    db.commit()
    db.refresh(record)
    return record


def recalculate_all_domain_scores(db: Session) -> list[DomainScore]:
    """Recalculate and persist scores for all domains."""
    domains = db.query(Domain).all()
    results = []
    for domain in domains:
        score = compute_domain_score(db, domain.slug)
        record = update_domain_score_record(db, domain.slug, score, add_xp=0)
        results.append(record)
    return results


def get_domain_scores_with_details(db: Session) -> list[dict]:
    """Get all domain scores with domain info and XP progress."""
    records = db.query(DomainScore).all()
    domain_map = {d.slug: d for d in db.query(Domain).all()}
    result = []
    for record in records:
        required = xp_required_for_level(record.level)
        progress = (record.xp / required * 100) if required > 0 else 0
        d = domain_map.get(record.domain)
        result.append({
            "id": str(record.id),
            "domain": record.domain,
            "domain_name": d.name if d else record.domain,
            "score": round(record.score, 1),
            "level": record.level,
            "xp": record.xp,
            "xp_required": required,
            "xp_progress": round(progress, 1),
            "updated_at": record.updated_at,
        })
    return result


def get_life_score(db: Session) -> float:
    """LifeScore = average(all domain scores). Return 0-100."""
    records = db.query(DomainScore).all()
    if not records:
        return 0.0
    return sum(r.score for r in records) / len(records)
