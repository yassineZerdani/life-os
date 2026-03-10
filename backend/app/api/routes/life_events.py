from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.life_event import LifeEventCreate, LifeEventUpdate, LifeEventResponse
from app.services import life_event_service

router = APIRouter()


@router.get("", response_model=list[LifeEventResponse])
def list_life_events(
    domain: str | None = Query(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    return life_event_service.get_life_events(db, domain, limit)


@router.get("/{event_id}", response_model=LifeEventResponse)
def get_life_event(event_id: str, db: Session = Depends(get_db)):
    event = life_event_service.get_life_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Life event not found")
    return event


@router.post("", response_model=LifeEventResponse)
def create_life_event(event: LifeEventCreate, db: Session = Depends(get_db)):
    return life_event_service.create_life_event(db, event)


@router.patch("/{event_id}", response_model=LifeEventResponse)
def update_life_event(event_id: str, event: LifeEventUpdate, db: Session = Depends(get_db)):
    result = life_event_service.update_life_event(db, event_id, event)
    if not result:
        raise HTTPException(status_code=404, detail="Life event not found")
    return result


@router.delete("/{event_id}")
def delete_life_event(event_id: str, db: Session = Depends(get_db)):
    if not life_event_service.delete_life_event(db, event_id):
        raise HTTPException(status_code=404, detail="Life event not found")
    return {"ok": True}
