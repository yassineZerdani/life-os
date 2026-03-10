from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class ExperienceBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: datetime
    location: Optional[str] = None
    photos: List[str] = []
    people_involved: List[str] = []
    emotional_rating: Optional[float] = None


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    location: Optional[str] = None
    photos: Optional[List[str]] = None
    people_involved: Optional[List[str]] = None
    emotional_rating: Optional[float] = None


class ExperienceResponse(ExperienceBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
