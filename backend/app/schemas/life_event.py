from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LifeEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    domain: str
    event_type: str
    date: Optional[datetime] = None
    xp_awarded: float = 0.0


class LifeEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    date: Optional[datetime] = None
    xp_awarded: Optional[float] = None


class LifeEventResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    domain: str
    event_type: str
    date: Optional[datetime] = None
    xp_awarded: float
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
