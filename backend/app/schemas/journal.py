"""Journal / Today diary API schemas."""
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel
from typing import Optional, Any


class JournalEntryCreate(BaseModel):
    title: Optional[str] = None
    raw_text: Optional[str] = None
    mood: Optional[str] = None
    energy: Optional[str] = None


class JournalEntryUpdate(BaseModel):
    title: Optional[str] = None
    raw_text: Optional[str] = None
    mood: Optional[str] = None
    energy: Optional[str] = None


class JournalEntryResponse(BaseModel):
    id: UUID
    user_id: int
    date: date
    title: Optional[str]
    raw_text: Optional[str]
    mood: Optional[str]
    energy: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class JournalEntryListItemResponse(BaseModel):
    id: UUID
    user_id: int
    date: date
    title: Optional[str]
    raw_text: Optional[str]
    mood: Optional[str]
    energy: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class JournalPromptResponseSchema(BaseModel):
    id: UUID
    prompt_key: str
    response_value: Optional[str]

    class Config:
        from_attributes = True


class ExtractedSignalResponse(BaseModel):
    id: UUID
    domain: str
    signal_type: str
    value_json: Optional[dict[str, Any]]
    confidence: Optional[float]
    source_text: Optional[str]

    class Config:
        from_attributes = True


class SuggestedDomainUpdateResponse(BaseModel):
    id: UUID
    journal_entry_id: UUID
    domain: str
    update_type: str
    payload_json: Optional[dict[str, Any]]
    confidence: Optional[float]
    status: str

    class Config:
        from_attributes = True


class SuggestedDomainUpdateConfirm(BaseModel):
    status: str  # confirmed | rejected | edited


class SuggestedDomainUpdateEdit(BaseModel):
    status: str = "edited"
    payload_json: Optional[dict[str, Any]] = None


class TodaySummaryResponse(BaseModel):
    entry: Optional[JournalEntryResponse]
    streak_days: int
    suggested_updates: list[SuggestedDomainUpdateResponse]
    extracted_signals: list[ExtractedSignalResponse]
