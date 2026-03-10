from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


class InsightResponse(BaseModel):
    id: str
    type: str
    domain: Optional[str] = None
    message: str
    severity: str
    created_at: Optional[datetime] = None
    resolved: bool = False

    class Config:
        from_attributes = True

    @field_validator("id", mode="before")
    @classmethod
    def id_to_str(cls, v):
        return str(v) if v is not None else ""
