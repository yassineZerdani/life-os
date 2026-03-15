"""Journal / Today API — diary entries, extraction, suggested updates."""
from datetime import date, timedelta
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models import (
    User,
    JournalEntry,
    ExtractedSignal,
    SuggestedDomainUpdate,
)
from app.schemas.journal import (
    JournalEntryUpdate,
    JournalEntryResponse,
    JournalEntryListItemResponse,
    SuggestedDomainUpdateResponse,
    SuggestedDomainUpdateConfirm,
    SuggestedDomainUpdateEdit,
    TodaySummaryResponse,
)
from app.services.journal_intelligence_service import analyze_entry

router = APIRouter()


def _get_or_create_entry_for_date(
    db: Session, user_id: int, d: date
) -> JournalEntry:
    entry = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user_id, JournalEntry.date == d)
        .first()
    )
    if entry:
        return entry
    entry = JournalEntry(user_id=user_id, date=d)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def _streak_days(db: Session, user_id: int, up_to: date) -> int:
    streak = 0
    d = up_to
    while True:
        e = (
            db.query(JournalEntry)
            .filter(JournalEntry.user_id == user_id, JournalEntry.date == d)
            .first()
        )
        if not e or not (e.raw_text and e.raw_text.strip()):
            break
        streak += 1
        d -= timedelta(days=1)
    return streak


@router.get("/entries", response_model=list[JournalEntryListItemResponse])
def list_recent_entries(
    limit: int = 20,
    from_date: str | None = None,
    to_date: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.user_id == user.id,
            JournalEntry.raw_text.isnot(None),
            JournalEntry.raw_text != "",
        )
    )
    if from_date:
        try:
            fd = date.fromisoformat(from_date)
            q = q.filter(JournalEntry.date >= fd)
        except ValueError:
            pass
    if to_date:
        try:
            td = date.fromisoformat(to_date)
            q = q.filter(JournalEntry.date <= td)
        except ValueError:
            pass
    entries = (
        q.order_by(JournalEntry.date.desc())
        .limit(max(1, min(limit, 90)))
        .all()
    )
    return entries


@router.get("/today", response_model=TodaySummaryResponse)
def get_today(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    today = date.today()
    entry = _get_or_create_entry_for_date(db, user.id, today)
    streak = _streak_days(db, user.id, today)
    suggested = (
        db.query(SuggestedDomainUpdate)
        .filter(
            SuggestedDomainUpdate.journal_entry_id == entry.id,
            SuggestedDomainUpdate.status == "pending",
        )
        .all()
    )
    signals = (
        db.query(ExtractedSignal)
        .filter(ExtractedSignal.journal_entry_id == entry.id)
        .all()
    )
    return TodaySummaryResponse(
        entry=entry,
        streak_days=streak,
        suggested_updates=suggested,
        extracted_signals=signals,
    )


@router.get("/entries/{entry_date}", response_model=JournalEntryResponse)
def get_entry_by_date(
    entry_date: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        d = date.fromisoformat(entry_date)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date format (use YYYY-MM-DD)",
        )
    entry = _get_or_create_entry_for_date(db, user.id, d)
    return entry


@router.patch("/today", response_model=JournalEntryResponse)
def update_today(
    body: JournalEntryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    today = date.today()
    entry = _get_or_create_entry_for_date(db, user.id, today)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(entry, k, v)
    db.commit()
    db.refresh(entry)
    return entry


@router.post("/today/analyze")
def analyze_today(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    today = date.today()
    entry = _get_or_create_entry_for_date(db, user.id, today)
    analyze_entry(db, entry)
    suggested = (
        db.query(SuggestedDomainUpdate)
        .filter(SuggestedDomainUpdate.journal_entry_id == entry.id)
        .all()
    )
    return {"suggested_count": len(suggested), "entry_id": str(entry.id)}


@router.get(
    "/entries/{entry_id}/suggestions",
    response_model=list[SuggestedDomainUpdateResponse],
)
def list_suggestions(
    entry_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == user.id,
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return (
        db.query(SuggestedDomainUpdate)
        .filter(SuggestedDomainUpdate.journal_entry_id == entry.id)
        .all()
    )


@router.patch(
    "/suggestions/{suggestion_id}",
    response_model=SuggestedDomainUpdateResponse,
)
def confirm_or_reject_suggestion(
    suggestion_id: UUID,
    body: SuggestedDomainUpdateConfirm,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    s = (
        db.query(SuggestedDomainUpdate)
        .join(JournalEntry)
        .filter(
            SuggestedDomainUpdate.id == suggestion_id,
            JournalEntry.user_id == user.id,
        )
        .first()
    )
    if not s:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    if body.status not in ("pending", "confirmed", "rejected", "edited"):
        raise HTTPException(status_code=400, detail="Invalid status")
    s.status = body.status
    db.commit()
    db.refresh(s)
    return s


@router.patch(
    "/suggestions/{suggestion_id}/edit",
    response_model=SuggestedDomainUpdateResponse,
)
def edit_suggestion(
    suggestion_id: UUID,
    body: SuggestedDomainUpdateEdit,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    s = (
        db.query(SuggestedDomainUpdate)
        .join(JournalEntry)
        .filter(
            SuggestedDomainUpdate.id == suggestion_id,
            JournalEntry.user_id == user.id,
        )
        .first()
    )
    if not s:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    s.status = body.status
    if body.payload_json is not None:
        s.payload_json = body.payload_json
    db.commit()
    db.refresh(s)
    return s


@router.get("/streak")
def get_streak(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return {"streak_days": _streak_days(db, user.id, date.today())}
