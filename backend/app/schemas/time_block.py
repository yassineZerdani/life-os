from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TimeBlockCreate(BaseModel):
    domain: str
    title: str
    start_time: datetime
    end_time: datetime
    notes: Optional[str] = None


class TimeBlockUpdate(BaseModel):
    title: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    notes: Optional[str] = None


class TimeBlockResponse(BaseModel):
    id: str
    domain: str
    title: str
    start_time: datetime
    end_time: datetime
    duration_minutes: float
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
