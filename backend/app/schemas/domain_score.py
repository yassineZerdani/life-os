from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DomainScoreResponse(BaseModel):
    id: str
    domain: str
    domain_name: str
    score: float
    level: int
    xp: int
    xp_required: float
    xp_progress: float
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
