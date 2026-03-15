"""Family Command Center API schemas."""
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel
from typing import Optional, Any


# ----- FamilyMember -----
class FamilyMemberCreate(BaseModel):
    name: str
    relationship_type: str  # parent | sibling | partner | child | extended | other
    birth_date: Optional[date] = None
    contact_info: Optional[str] = None
    notes: Optional[str] = None
    closeness_score: Optional[float] = None
    tension_score: Optional[float] = None
    support_level: Optional[str] = None
    parent_id: Optional[UUID] = None


class FamilyMemberUpdate(BaseModel):
    name: Optional[str] = None
    relationship_type: Optional[str] = None
    birth_date: Optional[date] = None
    contact_info: Optional[str] = None
    notes: Optional[str] = None
    closeness_score: Optional[float] = None
    tension_score: Optional[float] = None
    support_level: Optional[str] = None
    parent_id: Optional[UUID] = None


class FamilyMemberResponse(BaseModel):
    id: UUID
    user_id: int
    name: str
    relationship_type: str
    birth_date: Optional[date]
    contact_info: Optional[str]
    notes: Optional[str]
    closeness_score: Optional[float]
    tension_score: Optional[float]
    support_level: Optional[str]
    parent_id: Optional[UUID]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- FamilyInteraction -----
class FamilyInteractionCreate(BaseModel):
    family_member_id: UUID
    interaction_type: str  # call | visit | message | event | other
    date: date
    emotional_tone: Optional[str] = None
    notes: Optional[str] = None


class FamilyInteractionResponse(BaseModel):
    id: UUID
    family_member_id: UUID
    user_id: int
    interaction_type: str
    date: date
    emotional_tone: Optional[str]
    notes: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- FamilyResponsibility -----
class FamilyResponsibilityCreate(BaseModel):
    family_member_id: Optional[UUID] = None
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: str = "pending"
    category: str  # health | appointment | follow_up | financial | emotional | logistics | other


class FamilyResponsibilityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    category: Optional[str] = None


class FamilyResponsibilityResponse(BaseModel):
    id: UUID
    user_id: int
    family_member_id: Optional[UUID]
    title: str
    description: Optional[str]
    due_date: Optional[date]
    status: str
    category: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- FamilyMemory -----
class FamilyMemoryCreate(BaseModel):
    family_member_id: Optional[UUID] = None
    title: str
    description: Optional[str] = None
    date: Optional[date] = None
    media_url: Optional[str] = None
    tags: Optional[list[str]] = None


class FamilyMemoryResponse(BaseModel):
    id: UUID
    user_id: int
    family_member_id: Optional[UUID]
    title: str
    description: Optional[str]
    date: Optional[date]
    media_url: Optional[str]
    tags: Optional[list[str]]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- FamilyDynamicNote -----
class FamilyDynamicNoteCreate(BaseModel):
    family_member_id: Optional[UUID] = None
    pattern_type: str  # conflict | fragile | closeness_cycle | communication | support_gap
    trigger_notes: Optional[str] = None
    safe_topics: Optional[str] = None
    difficult_topics: Optional[str] = None
    notes: Optional[str] = None


class FamilyDynamicNoteResponse(BaseModel):
    id: UUID
    user_id: int
    family_member_id: Optional[UUID]
    pattern_type: str
    trigger_notes: Optional[str]
    safe_topics: Optional[str]
    difficult_topics: Optional[str]
    notes: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- Dashboard -----
class FamilyDashboardResponse(BaseModel):
    members: list[FamilyMemberResponse]
    responsibilities_pending: int
    recent_interactions_count: int
    memories_count: int
    high_support_members: list[FamilyMemberResponse]
