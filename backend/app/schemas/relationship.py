from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Any


class RelationshipBase(BaseModel):
    name: str
    relationship_type: str
    notes: Optional[str] = None
    last_contact_date: Optional[datetime] = None
    important_dates: List[dict] = []


class RelationshipCreate(RelationshipBase):
    pass


class RelationshipUpdate(BaseModel):
    name: Optional[str] = None
    relationship_type: Optional[str] = None
    notes: Optional[str] = None
    last_contact_date: Optional[datetime] = None
    important_dates: Optional[List[dict]] = None


class RelationshipResponse(RelationshipBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
