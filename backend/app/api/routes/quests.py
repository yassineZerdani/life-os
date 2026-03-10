from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services.quest_generator import get_active_quests, complete_quest, generate_quests
from app.services.quest_service import update_quest_progress

router = APIRouter()


@router.get("")
def list_quests(db: Session = Depends(get_db)):
    """Return active quests."""
    update_quest_progress(db)
    quests = get_active_quests(db)
    return [
        {
            "id": str(q.id),
            "title": q.title,
            "description": q.description,
            "domain": q.domain,
            "xp_reward": q.xp_reward,
            "target_value": q.target_value,
            "progress": q.progress,
            "deadline": q.deadline.isoformat() if q.deadline else None,
            "completed": q.completed,
        }
        for q in quests
    ]


@router.post("/generate")
def generate_new_quests(db: Session = Depends(get_db)):
    """Generate new quests based on user patterns."""
    created = generate_quests(db)
    return {"created": len(created)}


@router.post("/{quest_id}/complete")
def complete_quest_endpoint(quest_id: str, db: Session = Depends(get_db)):
    """Mark quest completed and reward XP."""
    result = complete_quest(db, quest_id)
    if not result:
        raise HTTPException(status_code=404, detail="Quest not found or already completed")
    return result
