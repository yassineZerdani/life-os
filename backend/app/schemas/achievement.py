from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


class AchievementBase(BaseModel):
    title: str
    description: Optional[str] = None
    domain: Optional[str] = None
    date: Optional[datetime] = None
    xp_awarded: float = 0.0


class AchievementCreate(AchievementBase):
    pass


class AchievementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    domain: Optional[str] = None
    date: Optional[datetime] = None
    xp_awarded: Optional[float] = None


class AchievementResponse(AchievementBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @field_validator("id", mode="before")
    @classmethod
    def id_to_str(cls, v):
        return str(v) if v is not None else ""
