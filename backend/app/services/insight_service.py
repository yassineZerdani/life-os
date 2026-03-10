"""Insight service - CRUD and engine trigger."""
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import Insight
from app.services.insight_engine import run_insight_engine


def get_insights(
    db: Session,
    limit: int = 50,
    resolved: bool | None = None,
    type: str | None = None,
) -> list[Insight]:
    """Get latest insights, optionally filtered."""
    q = db.query(Insight).order_by(desc(Insight.created_at))
    if resolved is not None:
        q = q.filter(Insight.resolved == resolved)
    if type:
        q = q.filter(Insight.type == type)
    return q.limit(limit).all()


def resolve_insight(db: Session, insight_id: str) -> Insight | None:
    """Mark insight as resolved."""
    import uuid
    uid = uuid.UUID(insight_id)
    insight = db.query(Insight).filter(Insight.id == uid).first()
    if not insight:
        return None
    insight.resolved = True
    db.commit()
    db.refresh(insight)
    return insight


def run_engine(db: Session) -> list[Insight]:
    """Trigger insight engine manually."""
    return run_insight_engine(db)
