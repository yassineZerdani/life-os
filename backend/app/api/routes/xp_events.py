from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.xp_event import XPEventCreate, XPEventResponse
from app.services import xp_service

router = APIRouter()


@router.get("", response_model=list[XPEventResponse])
def list_xp_events(
    domain: str | None = Query(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    return xp_service.get_xp_events(db, domain, limit)


@router.post("", response_model=XPEventResponse)
def create_xp_event(event: XPEventCreate, db: Session = Depends(get_db)):
    return xp_service.award_xp(
        db,
        domain=event.domain,
        xp_amount=event.xp_amount,
        reason=event.reason,
        source_type=event.source_type,
        source_id=event.source_id,
    )
