from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class XPEventCreate(BaseModel):
    domain: str
    xp_amount: float
    reason: str
    source_type: str
    source_id: Optional[str] = None


class XPEventResponse(BaseModel):
    id: str
    domain: str
    xp_amount: float
    reason: str
    source_type: str
    source_id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
