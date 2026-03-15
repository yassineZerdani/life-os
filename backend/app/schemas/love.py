"""Relationship Depth System API schemas."""
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel
from typing import Optional


# ----- LoveProfile -----
class LoveProfileCreate(BaseModel):
    partner_name: Optional[str] = None
    relationship_status: str = "active"
    anniversary_date: Optional[date] = None
    notes: Optional[str] = None


class LoveProfileUpdate(BaseModel):
    partner_name: Optional[str] = None
    relationship_status: Optional[str] = None
    anniversary_date: Optional[date] = None
    notes: Optional[str] = None


class LoveProfileResponse(BaseModel):
    id: UUID
    user_id: int
    partner_name: Optional[str]
    relationship_status: str
    anniversary_date: Optional[date]
    notes: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- LovePulseEntry -----
class LovePulseEntryCreate(BaseModel):
    date: date
    closeness_score: Optional[float] = None
    communication_score: Optional[float] = None
    trust_score: Optional[float] = None
    tension_score: Optional[float] = None
    support_score: Optional[float] = None
    future_alignment_score: Optional[float] = None
    notes: Optional[str] = None


class LovePulseEntryResponse(BaseModel):
    id: UUID
    user_id: int
    date: date
    closeness_score: Optional[float]
    communication_score: Optional[float]
    trust_score: Optional[float]
    tension_score: Optional[float]
    support_score: Optional[float]
    future_alignment_score: Optional[float]
    notes: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- LoveMemory -----
class LoveMemoryCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[date] = None
    category: str  # milestone | moment | trip | plan | promise | repair | other
    media_url: Optional[str] = None


class LoveMemoryResponse(BaseModel):
    id: UUID
    user_id: int
    title: str
    description: Optional[str]
    date: Optional[date]
    category: str
    media_url: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- ConflictEntry -----
class ConflictEntryCreate(BaseModel):
    date: date
    trigger: Optional[str] = None
    what_i_felt: Optional[str] = None
    what_they_may_have_felt: Optional[str] = None
    what_happened: Optional[str] = None
    repair_needed: Optional[str] = None
    status: str = "reflecting"


class ConflictEntryUpdate(BaseModel):
    trigger: Optional[str] = None
    what_i_felt: Optional[str] = None
    what_they_may_have_felt: Optional[str] = None
    what_happened: Optional[str] = None
    repair_needed: Optional[str] = None
    status: Optional[str] = None


class ConflictEntryResponse(BaseModel):
    id: UUID
    user_id: int
    date: date
    trigger: Optional[str]
    what_i_felt: Optional[str]
    what_they_may_have_felt: Optional[str]
    what_happened: Optional[str]
    repair_needed: Optional[str]
    status: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- SharedVisionItem -----
class SharedVisionItemCreate(BaseModel):
    category: str  # life | travel | home | family | career | values | other
    title: str
    description: Optional[str] = None
    target_date: Optional[date] = None
    status: str = "active"


class SharedVisionItemUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    target_date: Optional[date] = None
    status: Optional[str] = None


class SharedVisionItemResponse(BaseModel):
    id: UUID
    user_id: int
    category: str
    title: str
    description: Optional[str]
    target_date: Optional[date]
    status: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- ReconnectAction -----
class ReconnectActionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str  # date | conversation | gesture | ritual | surprise | other
    due_date: Optional[date] = None


class ReconnectActionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[date] = None
    completed: Optional[bool] = None


class ReconnectActionResponse(BaseModel):
    id: UUID
    user_id: int
    title: str
    description: Optional[str]
    category: str
    due_date: Optional[date]
    completed: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- Dashboard -----
class LoveDashboardResponse(BaseModel):
    profile: Optional[LoveProfileResponse]
    latest_pulse: Optional[LovePulseEntryResponse]
    conflicts_pending_repair: int
    reconnect_pending: int
    insights: list[str] = []
