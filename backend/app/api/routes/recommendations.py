from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.recommendation import RecommendationsResponse
from app.services.life_decision_engine import get_recommendations
from app.models import ActionTemplate, ActionCompletion
from app.services import xp_service


router = APIRouter()


@router.get("", response_model=RecommendationsResponse)
def list_recommendations(
    limit: int = Query(5, le=20),
    db: Session = Depends(get_db),
):
    """Return recommended actions for life optimization."""
    recs = get_recommendations(db, limit=limit)
    return RecommendationsResponse(recommendations=recs)


@router.post("/{action_template_id}/complete")
def complete_recommendation(
    action_template_id: str,
    db: Session = Depends(get_db),
):
    """Mark as completed and award XP."""
    import uuid
    template = db.query(ActionTemplate).filter(ActionTemplate.id == uuid.UUID(action_template_id)).first()
    if not template:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Action template not found")


    completion = ActionCompletion(action_template_id=template.id)
    db.add(completion)
    db.flush()

    xp_service.award_xp(
        db,
        domain=template.domain,
        xp_amount=template.xp_reward or 0,
        reason=f"Completed: {template.title}",
        source_type="recommendation",
        source_id=template.id,
    )
    db.commit()
    return {"status": "completed", "xp_awarded": template.xp_reward}
