from pydantic import BaseModel, field_validator, model_validator
from datetime import datetime
from typing import Optional, Any


class GraphNodeCreate(BaseModel):
    type: str
    name: str
    metadata: Optional[dict[str, Any]] = None


class GraphEdgeCreate(BaseModel):
    source_id: str
    target_id: str
    relation_type: str
    metadata: Optional[dict[str, Any]] = None


class GraphNodeResponse(BaseModel):
    id: str
    type: str
    name: str
    metadata: dict[str, Any] = {}
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    @model_validator(mode="before")
    @classmethod
    def map_extra_data(cls, v):
        if hasattr(v, "extra_data"):
            return {
                "id": v.id,
                "type": v.type,
                "name": v.name,
                "metadata": v.extra_data or {},
                "created_at": v.created_at,
            }
        return v

    @field_validator("id", mode="before")
    @classmethod
    def id_to_str(cls, v):
        return str(v) if v is not None else ""
