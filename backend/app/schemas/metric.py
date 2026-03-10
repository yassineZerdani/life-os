from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


class MetricDefinitionBase(BaseModel):
    name: str
    domain: str
    unit: str = ""
    weight: float = 1.0


class MetricDefinitionCreate(MetricDefinitionBase):
    pass


class MetricDefinitionUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    weight: Optional[float] = None


class MetricDefinitionResponse(MetricDefinitionBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @field_validator("id", mode="before")
    @classmethod
    def id_to_str(cls, v):
        return str(v) if v is not None else ""


class MetricEntryCreate(BaseModel):
    metric_id: str
    value: float
    timestamp: Optional[datetime] = None
    note: Optional[str] = None


class MetricEntryResponse(BaseModel):
    id: str
    metric_id: str

    value: float
    timestamp: datetime
    note: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
