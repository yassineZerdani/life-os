from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DomainBase(BaseModel):
    slug: str
    name: str
    layer: str
    description: Optional[str] = None
    icon: Optional[str] = None


class DomainCreate(DomainBase):
    pass


class DomainUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None


class DomainResponse(DomainBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
