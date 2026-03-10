from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    domain_id: int
    progress: float = 0.0
    target_value: Optional[float] = None
    target_unit: Optional[str] = None
    deadline: Optional[datetime] = None
    status: str = "active"


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    progress: Optional[float] = None
    target_value: Optional[float] = None
    target_unit: Optional[str] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = None


class GoalResponse(GoalBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
