from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NoteBase(BaseModel):
    title: str
    content: str
    domain_id: int


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class NoteResponse(NoteBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
