from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.services import note_service

router = APIRouter()


@router.get("", response_model=list[NoteResponse])
def list_notes(
    domain_id: int | None = Query(None),
    db: Session = Depends(get_db)
):
    return note_service.get_notes(db, domain_id)


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = note_service.get_note_by_id(db, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.post("", response_model=NoteResponse)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    return note_service.create_note(db, note)


@router.patch("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note: NoteUpdate, db: Session = Depends(get_db)):
    result = note_service.update_note(db, note_id, note)
    if not result:
        raise HTTPException(status_code=404, detail="Note not found")
    return result


@router.delete("/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    if not note_service.delete_note(db, note_id):
        raise HTTPException(status_code=404, detail="Note not found")
    return {"ok": True}
