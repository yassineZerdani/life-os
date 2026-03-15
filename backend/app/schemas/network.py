"""Social Capital Engine API schemas."""
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel
from typing import Optional


# ----- Contact -----
class ContactCreate(BaseModel):
    name: str
    category: str  # mentor | peer | collaborator | client | other
    company: Optional[str] = None
    role: Optional[str] = None
    notes: Optional[str] = None
    trust_score: Optional[float] = None
    warmth_score: Optional[float] = None
    opportunity_score: Optional[float] = None


class ContactUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    notes: Optional[str] = None
    trust_score: Optional[float] = None
    warmth_score: Optional[float] = None
    opportunity_score: Optional[float] = None
    last_contact_at: Optional[datetime] = None


class ContactResponse(BaseModel):
    id: UUID
    user_id: int
    name: str
    category: str
    company: Optional[str]
    role: Optional[str]
    notes: Optional[str]
    trust_score: Optional[float]
    warmth_score: Optional[float]
    opportunity_score: Optional[float]
    last_contact_at: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- ContactInteraction -----
class ContactInteractionCreate(BaseModel):
    contact_id: UUID
    interaction_type: str
    date: date
    tone: Optional[str] = None  # warm | neutral | formal | tense
    notes: Optional[str] = None


class ContactInteractionResponse(BaseModel):
    id: UUID
    contact_id: UUID
    user_id: int
    interaction_type: str
    date: date
    tone: Optional[str]
    notes: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- ConnectionOpportunity -----
class ConnectionOpportunityCreate(BaseModel):
    contact_id: UUID
    opportunity_type: str
    title: str
    description: Optional[str] = None
    status: str = "open"
    potential_value: Optional[float] = None


class ConnectionOpportunityUpdate(BaseModel):
    opportunity_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    potential_value: Optional[float] = None


class ConnectionOpportunityResponse(BaseModel):
    id: UUID
    contact_id: UUID
    user_id: int
    opportunity_type: str
    title: str
    description: Optional[str]
    status: str
    potential_value: Optional[float]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- ReciprocityEntry -----
class ReciprocityEntryCreate(BaseModel):
    contact_id: UUID
    support_given: Optional[str] = None
    support_received: Optional[str] = None
    notes: Optional[str] = None
    date: date


class ReciprocityEntryResponse(BaseModel):
    id: UUID
    contact_id: UUID
    user_id: int
    support_given: Optional[str]
    support_received: Optional[str]
    notes: Optional[str]
    date: date
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- Community -----
class CommunityCreate(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    relevance_score: Optional[float] = None


class CommunityUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    relevance_score: Optional[float] = None


class CommunityResponse(BaseModel):
    id: UUID
    user_id: int
    name: str
    type: str
    description: Optional[str]
    relevance_score: Optional[float]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ----- Dashboard & graph -----
class DormantTieInfo(BaseModel):
    contact: ContactResponse
    days_since_contact: Optional[int]
    reason: str  # e.g. "High trust but no contact in 90+ days"


class NetworkDashboardResponse(BaseModel):
    contacts_count: int
    dormant_count: int
    open_opportunities_count: int
    social_capital_score: Optional[float]  # 0-100 composite
    insights: list[str] = []
    dormant_ties: list[DormantTieInfo] = []


class GraphNode(BaseModel):
    id: str
    label: str
    category: str
    trust_score: Optional[float]
    warmth_score: Optional[float]
    opportunity_score: Optional[float]
    is_dormant: bool = False


class GraphEdge(BaseModel):
    source: str
    target: str
    label: Optional[str] = None


class NetworkGraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]
