from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.insight import InsightResponse
from app.services import insight_service

router = APIRouter()


@router.get("", response_model=list[InsightResponse])
def list_insights(
    limit: int = 50,
    resolved: bool | None = None,
    type: str | None = None,
    db: Session = Depends(get_db),
):
    """Get latest insights."""
    insights = insight_service.get_insights(db, limit=limit, resolved=resolved, type=type)
    return [InsightResponse.model_validate(i) for i in insights]


@router.post("/run", response_model=list[InsightResponse])
def run_insight_engine(db: Session = Depends(get_db)):
    """Trigger insight engine manually."""
    insights = insight_service.run_engine(db)
    return [InsightResponse.model_validate(i) for i in insights]


@router.patch("/{insight_id}/resolve", response_model=InsightResponse)
def resolve_insight(insight_id: str, db: Session = Depends(get_db)):
    """Mark insight as resolved."""
    insight = insight_service.resolve_insight(db, insight_id)
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")
    return InsightResponse.model_validate(insight)
