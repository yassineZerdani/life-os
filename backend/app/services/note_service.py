from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import Note
from app.schemas.note import NoteCreate, NoteUpdate


def get_notes(db: Session, domain_id: int | None = None):
    q = db.query(Note)
    if domain_id:
        q = q.filter(Note.domain_id == domain_id)
    return q.order_by(desc(Note.updated_at)).all()


def get_note_by_id(db: Session, note_id: int):
    return db.query(Note).filter(Note.id == note_id).first()


def create_note(db: Session, note: NoteCreate):
    db_note = Note(**note.model_dump())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


def update_note(db: Session, note_id: int, note: NoteUpdate):
    db_note = get_note_by_id(db, note_id)
    if not db_note:
        return None
    update_data = note.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_note, key, value)
    db.commit()
    db.refresh(db_note)
    return db_note


def delete_note(db: Session, note_id: int):
    db_note = get_note_by_id(db, note_id)
    if db_note:
        db.delete(db_note)
        db.commit()
        return True
    return False
