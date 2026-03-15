"""Persona Lab API schemas."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from typing import Optional


# ----- PersonaIdentityProfile -----
class PersonaIdentityProfileCreate(BaseModel):
    current_self_summary: Optional[str] = None
    ideal_self_summary: Optional[str] = None
    public_self_summary: Optional[str] = None
    private_self_summary: Optional[str] = None
    values_summary: Optional[str] = None


class PersonaIdentityProfileUpdate(BaseModel):
    current_self_summary: Optional[str] = None
    ideal_self_summary: Optional[str] = None
    public_self_summary: Optional[str] = None
    private_self_summary: Optional[str] = None
    values_summary: Optional[str] = None


class PersonaIdentityProfileResponse(BaseModel):
    id: UUID
    user_id: int
    current_self_summary: Optional[str]
    ideal_self_summary: Optional[str]
    public_self_summary: Optional[str]
    private_self_summary: Optional[str]
    values_summary: Optional[str]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- PersonaValue -----
class PersonaValueCreate(BaseModel):
    name: str
    description: Optional[str] = None
    priority_score: Optional[float] = None


class PersonaValueUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    priority_score: Optional[float] = None


class PersonaValueResponse(BaseModel):
    id: UUID
    user_id: int
    name: str
    description: Optional[str]
    priority_score: Optional[float]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- PersonaPrinciple -----
class PersonaPrincipleCreate(BaseModel):
    title: str
    description: Optional[str] = None
    active: bool = True


class PersonaPrincipleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    active: Optional[bool] = None


class PersonaPrincipleResponse(BaseModel):
    id: UUID
    user_id: int
    title: str
    description: Optional[str]
    active: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- PersonaNarrativeEntry -----
class PersonaNarrativeEntryCreate(BaseModel):
    title: str
    description: Optional[str] = None
    time_period: Optional[str] = None
    type: str  # who_i_was | who_i_am | who_i_am_becoming | defining_moment | identity_shift


class PersonaNarrativeEntryResponse(BaseModel):
    id: UUID
    user_id: int
    title: str
    description: Optional[str]
    time_period: Optional[str]
    type: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- PersonaAspect -----
class PersonaAspectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    strength_score: Optional[float] = None
    tension_score: Optional[float] = None
    active: bool = True


class PersonaAspectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    strength_score: Optional[float] = None
    tension_score: Optional[float] = None
    active: Optional[bool] = None


class PersonaAspectResponse(BaseModel):
    id: UUID
    user_id: int
    name: str
    description: Optional[str]
    strength_score: Optional[float]
    tension_score: Optional[float]
    active: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- IdentityDriftSignal -----
class IdentityDriftSignalCreate(BaseModel):
    source: str
    description: str
    severity: str = "medium"


class IdentityDriftSignalResponse(BaseModel):
    id: UUID
    user_id: int
    source: str
    description: str
    severity: str
    detected_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- Dashboard -----
class PersonaDashboardResponse(BaseModel):
    profile: Optional[PersonaIdentityProfileResponse]
    values_count: int
    principles_count: int
    narrative_count: int
    aspects_count: int
    drift_signals_count: int
    alignment_insights: list[str] = []
    drift_signals: list[IdentityDriftSignalResponse] = []
