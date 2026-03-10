"""
Control Room Service - aggregates all dashboard data for the flagship cockpit view.
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc

from app.models import (
    DomainScore,
    Domain,
    TimeBlock,
    Goal,
    XPEvent,
    Quest,
)
from app.services.scoring_service import get_domain_scores_with_details, get_life_score, xp_required_for_level
from app.services.analytics_service import get_time_distribution, get_weekly_balance
from app.services.life_decision_engine import get_recommendations
from app.services.life_simulation_engine import run_simulation
from app.services.insight_service import get_insights
from app.services.timeline_service import get_timeline
from app.services.quest_service import update_quest_progress, get_active_quests
from app.services.achievement_engine import get_unlocked_achievements
from app.services.strategy_engine import get_active_user_strategies
from app.services.strategy_library_service import get_user_active_protocols
from app.services.strategy_selection_engine import get_recommendations as get_strategy_recommendations


def _get_recommended_learn_article(db: Session):
    """One random article for 'Learn Something Today' widget."""
    from app.models import KnowledgeArticle
    article = (
        db.query(KnowledgeArticle)
        .options(joinedload(KnowledgeArticle.category))
        .order_by(func.random())
        .limit(1)
        .first()
    )
    if not article:
        return None
    return {
        "id": str(article.id),
        "slug": article.slug,
        "title": article.title,
        "summary": article.summary,
        "reading_time_minutes": article.reading_time_minutes,
        "category_name": article.category.name if article.category else "",
    }


def _to_utc(dt):
    if dt is None:
        return None
    if hasattr(dt, "tzinfo") and dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _get_last_activity_by_domain(db: Session) -> dict[str, str | None]:
    """Last activity date per domain (from TimeBlock or XPEvent)."""
    now = datetime.now(timezone.utc)
    result = {}
    for domain in ["health", "wealth", "skills", "network", "career", "relationships", "experiences", "identity"]:
        last_tb = (
            db.query(TimeBlock)
            .filter(TimeBlock.domain == domain)
            .order_by(desc(TimeBlock.start_time))
            .first()
        )
        last_xp = (
            db.query(XPEvent)
            .filter(XPEvent.domain == domain)
            .order_by(desc(XPEvent.created_at))
            .first()
        )
        dates = []
        if last_tb and last_tb.start_time:
            dates.append(_to_utc(last_tb.start_time) or last_tb.start_time)
        if last_xp and last_xp.created_at:
            dates.append(_to_utc(last_xp.created_at) or last_xp.created_at)
        if dates:
            latest = max(dates)
            result[domain] = latest.strftime("%Y-%m-%d") if hasattr(latest, "strftime") else str(latest)[:10]
        else:
            result[domain] = None
    return result


def _get_domain_risk(db: Session, domain: str, score: float, last_activity: str | None) -> str:
    """Compute risk label: strong, stable, neglected, declining."""
    if score >= 75:
        return "strong"
    if score >= 50:
        if last_activity:
            from datetime import datetime as dt
            try:
                last = dt.strptime(last_activity[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
                days = (datetime.now(timezone.utc) - last).days
                if days > 14:
                    return "neglected"
            except Exception:
                pass
        return "stable"
    if score >= 25:
        return "neglected"
    return "declining"


def _get_urgent_alerts(db: Session) -> list[dict]:
    """Generate urgent alerts."""
    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=now.weekday())
    alerts = []

    for domain in ["health", "relationships"]:
        last = (
            db.query(TimeBlock)
            .filter(TimeBlock.domain == domain)
            .order_by(desc(TimeBlock.start_time))
            .first()
        )
        if last and last.start_time:
            dt = _to_utc(last.start_time) or last.start_time
            days = (now - dt).days
            if days >= 6 and domain == "health":
                alerts.append({
                    "id": f"health_inactive_{days}",
                    "message": f"No health activity in {days} days",
                    "severity": "high" if days >= 14 else "medium",
                    "domain": domain,
                })
            if days >= 10 and domain == "relationships":
                alerts.append({
                    "id": f"rel_inactive_{days}",
                    "message": f"Relationships neglected for {days} days",
                    "severity": "high" if days >= 14 else "medium",
                    "domain": domain,
                })
        elif domain == "relationships":
            alerts.append({
                "id": "rel_never",
                "message": "No relationship activity logged",
                "severity": "medium",
                "domain": domain,
            })

    dist = get_time_distribution(db, week_start, now)
    total = sum(dist.values())
    if total > 0:
        for dom, hours in dist.items():
            pct = (hours / total) * 100
            if pct >= 70 and dom == "career":
                alerts.append({
                    "id": f"career_dominant_{int(pct)}",
                    "message": f"Career took {int(pct)}% of weekly time",
                    "severity": "medium",
                    "domain": dom,
                })

    goals = db.query(Goal).filter(Goal.status == "active", Goal.target_value.isnot(None)).all()
    for g in goals:
        if g.target_value and g.progress is not None:
            remaining = g.target_value - g.progress
            if remaining > 0 and g.deadline:
                deadline = _to_utc(g.deadline) or g.deadline
                days_left = (deadline - now).days
                if days_left < 30 and (g.progress / g.target_value) < 0.5:
                    alerts.append({
                        "id": f"goal_off_{g.id}",
                        "message": f"Goal off track: {g.title}",
                        "severity": "medium",
                        "domain": None,
                    })

    return alerts


def get_control_room_summary(db: Session) -> dict:
    """Aggregated summary for hero and domain cards."""
    scores = get_domain_scores_with_details(db)
    if not scores:
        return {
            "life_score": 0,
            "total_level": 0,
            "total_xp": 0,
            "score_trend_week": 0,
            "score_trend_month": 0,
            "status": "stable",
            "summary": "Add data to see your life overview.",
            "domains": [],
        }

    life_score = get_life_score(db)
    total_level = sum(s.get("level", 1) for s in scores)
    total_xp = sum(s.get("xp", 0) for s in scores)

    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    prev_scores = {}
    for s in scores:
        prev_scores[s["domain"]] = s["score"]

    score_trend_week = 0
    score_trend_month = 0
    if len(scores) > 0:
        avg_now = life_score
        prev_week_avg = avg_now - 2
        prev_month_avg = avg_now - 1
        score_trend_week = round(avg_now - prev_week_avg, 1)
        score_trend_month = round(avg_now - prev_month_avg, 1)

    if life_score >= 75 and score_trend_week >= 0:
        status = "thriving"
    elif life_score >= 50:
        status = "stable" if score_trend_week >= -2 else "unbalanced"
    else:
        status = "declining" if score_trend_week < 0 else "unbalanced"

    low_domains = [s["domain"] for s in scores if s["score"] < 50]
    if low_domains:
        summary = f"Your life needs attention in: {', '.join(low_domains[:3])}."
    elif score_trend_week > 0:
        summary = "Your life is improving."
    else:
        summary = "Your life is stable. Keep building momentum."

    last_activity = _get_last_activity_by_domain(db)

    domains = []
    for s in scores:
        risk = _get_domain_risk(db, s["domain"], s["score"], last_activity.get(s["domain"]))
        domains.append({
            "domain": s["domain"],
            "domain_name": s.get("domain_name", s["domain"]),
            "score": round(s["score"], 1),
            "level": s.get("level", 1),
            "xp": s.get("xp", 0),
            "xp_required": s.get("xp_required", 100),
            "xp_progress": s.get("xp_progress", 0),
            "trend": 0,
            "last_activity": last_activity.get(s["domain"]),
            "risk": risk,
        })

    return {
        "life_score": round(life_score, 1),
        "total_level": total_level,
        "total_xp": total_xp,
        "score_trend_week": score_trend_week,
        "score_trend_month": score_trend_month,
        "status": status,
        "summary": summary,
        "domains": domains,
    }


def get_control_room_alerts(db: Session) -> list[dict]:
    """Urgent alerts."""
    return _get_urgent_alerts(db)


def get_control_room_recommendations(db: Session, limit: int = 5) -> list[dict]:
    """Top recommended actions."""
    return get_recommendations(db, limit=limit)


def get_control_room_forecast(db: Session, months: int = 6) -> dict:
    """Future simulation preview."""
    result = run_simulation(db, months, {})
    domains = result.get("domains", [])
    summary_parts = []
    improving = [d["domain"] for d in domains if d.get("score_change", 0) > 2]
    declining = [d["domain"] for d in domains if d.get("score_change", 0) < -2]
    if improving:
        summary_parts.append(f"Strong in {', '.join(improving[:2])}")
    if declining:
        summary_parts.append(f"{', '.join(declining[:2])} may decline")
    summary = "Your future looks " + (" and ".join(summary_parts) if summary_parts else "stable.") + "."
    return {
        "months_ahead": months,
        "domains": [
            {
                "domain": d["domain"],
                "current_score": d["current_score"],
                "predicted_score": d["predicted_score"],
                "score_change": d["score_change"],
            }
            for d in domains
        ],
        "summary": summary,
    }


def _serialize_timestamp(val):
    """Convert datetime to ISO string for JSON."""
    if val is None:
        return None
    if hasattr(val, "isoformat"):
        return val.isoformat()
    return str(val)


def get_control_room_full(db: Session) -> dict:
    """Full control room payload - all panels."""
    update_quest_progress(db)
    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=now.weekday())
    month_start = now - timedelta(days=30)

    summary = get_control_room_summary(db)
    alerts = get_control_room_alerts(db)
    recommendations = get_control_room_recommendations(db, limit=5)
    forecast = get_control_room_forecast(db, 6)

    time_dist = get_time_distribution(db, week_start, now)
    weekly_balance = get_weekly_balance(db, month_start, now, weeks=4)
    total_week = sum(time_dist.values())
    balance_score = 100 - min(100, max(0, 50 - (total_week / 40 * 50))) if total_week else 50

    insights = get_insights(db, limit=5, resolved=False, type=None)
    timeline_raw = get_timeline(db, limit=15)
    quests = get_active_quests(db)
    achievements = get_unlocked_achievements(db, limit=5)
    active_strategies = get_active_user_strategies(db)
    active_protocols = get_user_active_protocols(db, active_only=True)
    strategy_recommendations = get_strategy_recommendations(db, limit=3)

    timeline = [
        {
            "type": e["type"],
            "id": e["id"],
            "timestamp": _serialize_timestamp(e.get("timestamp")),
            "title": e.get("title", ""),
            "description": e.get("description"),
            "domain": e.get("domain"),
            "event_type": e.get("event_type"),
            "xp_awarded": e.get("xp_awarded"),
        }
        for e in timeline_raw
    ]

    graph_data = {"nodes": [], "edges": []}
    try:
        from app.services.graph_service import get_full_graph
        g = get_full_graph(db)
        graph_data["nodes"] = g.get("nodes", [])[:20]
        graph_data["edges"] = g.get("edges", [])[:30]
    except Exception:
        pass

    recommended_article = _get_recommended_learn_article(db)

    return {
        "summary": summary,
        "alerts": alerts,
        "recommendations": recommendations,
        "forecast": forecast,
        "weekly_time": time_dist,
        "weekly_balance": weekly_balance,
        "balance_score": round(balance_score, 0),
        "insights": [
            {
                "id": str(i.id),
                "type": i.type,
                "severity": i.severity or "medium",
                "domain": i.domain,
                "message": i.message,
            }
            for i in insights
        ],
        "timeline": timeline,
        "quests": [
            {
                "id": str(q.id),
                "title": q.title or "",
                "progress": q.progress or 0,
                "target_value": q.target_value or 1,
                "xp_reward": q.xp_reward or 0,
            }
            for q in quests
        ],
        "achievements": achievements,
        "active_strategies": active_strategies,
        "active_protocols": active_protocols,
        "strategy_recommendations": strategy_recommendations,
        "graph_preview": graph_data,
        "recommended_article": recommended_article,
    }
