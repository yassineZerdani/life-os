"""Life Memory Engine API schemas."""
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel
from typing import Optional


# ----- LifeExperience -----
class LifeExperienceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    date: date
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: str
    emotional_tone: Optional[str] = None
    intensity_score: Optional[float] = None
    meaning_score: Optional[float] = None
    aliveness_score: Optional[float] = None
    lesson_note: Optional[str] = None


class LifeExperienceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: Optional[str] = None
    emotional_tone: Optional[str] = None
    intensity_score: Optional[float] = None
    meaning_score: Optional[float] = None
    aliveness_score: Optional[float] = None
    lesson_note: Optional[str] = None


class LifeExperienceResponse(BaseModel):
    id: UUID
    user_id: int
    title: str
    description: Optional[str]
    date: date
    location_name: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    category: str
    emotional_tone: Optional[str]
    intensity_score: Optional[float]
    meaning_score: Optional[float]
    aliveness_score: Optional[float]
    lesson_note: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- LifeExperiencePerson -----
class LifeExperiencePersonCreate(BaseModel):
    experience_id: UUID
    person_name: str
    relationship_type: Optional[str] = None


class LifeExperiencePersonResponse(BaseModel):
    id: UUID
    experience_id: UUID
    person_name: str
    relationship_type: Optional[str]

    class Config:
        from_attributes = True


# ----- LifeExperienceMedia -----
class LifeExperienceMediaCreate(BaseModel):
    experience_id: UUID
    media_type: str
    media_url: str


class LifeExperienceMediaResponse(BaseModel):
    id: UUID
    experience_id: UUID
    media_type: str
    media_url: str

    class Config:
        from_attributes = True


# ----- SeasonOfLife -----
class SeasonOfLifeCreate(BaseModel):
    title: str
    start_date: date
    end_date: Optional[date] = None
    summary: Optional[str] = None


class SeasonOfLifeUpdate(BaseModel):
    title: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    summary: Optional[str] = None


class SeasonOfLifeResponse(BaseModel):
    id: UUID
    user_id: int
    title: str
    start_date: date
    end_date: Optional[date]
    summary: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- LifeExperienceTag -----
class LifeExperienceTagCreate(BaseModel):
    experience_id: UUID
    tag: str


class LifeExperienceTagResponse(BaseModel):
    id: UUID
    experience_id: UUID
    tag: str

    class Config:
        from_attributes = True


# ----- Dashboard, timeline, map -----
class LifeMemoryDashboardResponse(BaseModel):
    experiences_count: int
    peak_aliveness_count: int
    peak_meaning_count: int
    insights: list[str] = []
    future_suggestions: list[str] = []


class ExperienceWithRelations(BaseModel):
    experience: LifeExperienceResponse
    people: list[LifeExperiencePersonResponse] = []
    media: list[LifeExperienceMediaResponse] = []
    tags: list[str] = []


class MapPoint(BaseModel):
    id: str
    title: str
    latitude: float
    longitude: float
    date: Optional[date]
    category: str
    emotional_tone: Optional[str]
    aliveness_score: Optional[float]
    meaning_score: Optional[float]
