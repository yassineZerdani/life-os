"""Social Capital Engine API — dashboard, contacts, interactions, opportunities, reciprocity, communities."""
from datetime import datetime, timezone
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models import User
from app.models import (
    Contact,
    ContactInteraction,
    ConnectionOpportunity,
    ReciprocityEntry,
    Community,
)
from app.schemas.network import (
    ContactCreate,
    ContactUpdate,
    ContactResponse,
    ContactInteractionCreate,
    ContactInteractionResponse,
    ConnectionOpportunityCreate,
    ConnectionOpportunityUpdate,
    ConnectionOpportunityResponse,
    ReciprocityEntryCreate,
    ReciprocityEntryResponse,
    CommunityCreate,
    CommunityUpdate,
    CommunityResponse,
    NetworkDashboardResponse,
    DormantTieInfo,
    NetworkGraphResponse,
    GraphNode,
    GraphEdge,
)
from app.services.network_service import (
    get_dormant_ties,
    social_capital_score,
    collect_insights,
    build_graph,
)

router = APIRouter()


@router.get("/dashboard", response_model=NetworkDashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    contacts_count = db.query(Contact).filter(Contact.user_id == user.id).count()
    dormant_list = get_dormant_ties(db, user.id)
    dormant_count = len(dormant_list)
    open_opportunities_count = (
        db.query(ConnectionOpportunity)
        .filter(
            ConnectionOpportunity.user_id == user.id,
            ConnectionOpportunity.status == "open",
        )
        .count()
    )
    score = social_capital_score(db, user.id)
    insights = collect_insights(
        db, user.id, dormant_list, open_opportunities_count
    )
    dormant_ties = [
        DormantTieInfo(
            contact=ContactResponse.model_validate(d["contact"]),
            days_since_contact=d["days_since_contact"],
            reason=d["reason"],
        )
        for d in dormant_list[:20]
    ]
    return NetworkDashboardResponse(
        contacts_count=contacts_count,
        dormant_count=dormant_count,
        open_opportunities_count=open_opportunities_count,
        social_capital_score=score,
        insights=insights,
        dormant_ties=dormant_ties,
    )


@router.get("/graph", response_model=NetworkGraphResponse)
def get_graph(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    nodes, edges = build_graph(db, user.id)
    return NetworkGraphResponse(
        nodes=[GraphNode(**n) for n in nodes],
        edges=[GraphEdge(**e) for e in edges],
    )


@router.get("/contacts", response_model=list[ContactResponse])
def list_contacts(
    category: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Contact).filter(Contact.user_id == user.id)
    if category:
        q = q.filter(Contact.category == category)
    return q.order_by(Contact.name).all()


@router.post("/contacts", response_model=ContactResponse)
def create_contact(
    body: ContactCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = Contact(
        user_id=user.id,
        name=body.name,
        category=body.category,
        company=body.company,
        role=body.role,
        notes=body.notes,
        trust_score=body.trust_score,
        warmth_score=body.warmth_score,
        opportunity_score=body.opportunity_score,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return ContactResponse.model_validate(c)


@router.get("/contacts/{contact_id}", response_model=ContactResponse)
def get_contact(
    contact_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.user_id == user.id,
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contact not found")
    return ContactResponse.model_validate(c)


@router.patch("/contacts/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: UUID,
    body: ContactUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.user_id == user.id,
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contact not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return ContactResponse.model_validate(c)


@router.delete("/contacts/{contact_id}", status_code=204)
def delete_contact(
    contact_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.user_id == user.id,
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contact not found")
    db.delete(c)
    db.commit()
    return None


@router.get("/contacts/{contact_id}/interactions", response_model=list[ContactInteractionResponse])
def list_contact_interactions(
    contact_id: UUID,
    limit: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.user_id == user.id,
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contact not found")
    return (
        db.query(ContactInteraction)
        .filter(
            ContactInteraction.contact_id == contact_id,
            ContactInteraction.user_id == user.id,
        )
        .order_by(ContactInteraction.date.desc())
        .limit(limit)
        .all()
    )


@router.post("/interactions", response_model=ContactInteractionResponse)
def create_interaction(
    body: ContactInteractionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = db.query(Contact).filter(
        Contact.id == body.contact_id,
        Contact.user_id == user.id,
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contact not found")
    dt = datetime(
        body.date.year,
        body.date.month,
        body.date.day,
        12,
        0,
        0,
        tzinfo=timezone.utc,
    )
    if c.last_contact_at is None or dt > c.last_contact_at:
        c.last_contact_at = dt
    i = ContactInteraction(
        contact_id=body.contact_id,
        user_id=user.id,
        interaction_type=body.interaction_type,
        date=body.date,
        tone=body.tone,
        notes=body.notes,
    )
    db.add(i)
    db.commit()
    db.refresh(i)
    return ContactInteractionResponse.model_validate(i)


@router.get("/opportunities", response_model=list[ConnectionOpportunityResponse])
def list_opportunities(
    status: str | None = None,
    contact_id: UUID | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(ConnectionOpportunity).filter(
        ConnectionOpportunity.user_id == user.id
    )
    if status:
        q = q.filter(ConnectionOpportunity.status == status)
    if contact_id:
        q = q.filter(ConnectionOpportunity.contact_id == contact_id)
    return q.order_by(ConnectionOpportunity.created_at.desc()).all()


@router.post("/opportunities", response_model=ConnectionOpportunityResponse)
def create_opportunity(
    body: ConnectionOpportunityCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = db.query(Contact).filter(
        Contact.id == body.contact_id,
        Contact.user_id == user.id,
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contact not found")
    o = ConnectionOpportunity(
        contact_id=body.contact_id,
        user_id=user.id,
        opportunity_type=body.opportunity_type,
        title=body.title,
        description=body.description,
        status=body.status,
        potential_value=body.potential_value,
    )
    db.add(o)
    db.commit()
    db.refresh(o)
    return ConnectionOpportunityResponse.model_validate(o)


@router.patch("/opportunities/{opp_id}", response_model=ConnectionOpportunityResponse)
def update_opportunity(
    opp_id: UUID,
    body: ConnectionOpportunityUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    o = db.query(ConnectionOpportunity).filter(
        ConnectionOpportunity.id == opp_id,
        ConnectionOpportunity.user_id == user.id,
    ).first()
    if not o:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(o, k, v)
    db.commit()
    db.refresh(o)
    return ConnectionOpportunityResponse.model_validate(o)


@router.delete("/opportunities/{opp_id}", status_code=204)
def delete_opportunity(
    opp_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    o = db.query(ConnectionOpportunity).filter(
        ConnectionOpportunity.id == opp_id,
        ConnectionOpportunity.user_id == user.id,
    ).first()
    if not o:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    db.delete(o)
    db.commit()
    return None


@router.get("/contacts/{contact_id}/reciprocity", response_model=list[ReciprocityEntryResponse])
def list_reciprocity(
    contact_id: UUID,
    limit: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.user_id == user.id,
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contact not found")
    return (
        db.query(ReciprocityEntry)
        .filter(
            ReciprocityEntry.contact_id == contact_id,
            ReciprocityEntry.user_id == user.id,
        )
        .order_by(ReciprocityEntry.date.desc())
        .limit(limit)
        .all()
    )


@router.post("/reciprocity", response_model=ReciprocityEntryResponse)
def create_reciprocity(
    body: ReciprocityEntryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = db.query(Contact).filter(
        Contact.id == body.contact_id,
        Contact.user_id == user.id,
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contact not found")
    r = ReciprocityEntry(
        contact_id=body.contact_id,
        user_id=user.id,
        support_given=body.support_given,
        support_received=body.support_received,
        notes=body.notes,
        date=body.date,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return ReciprocityEntryResponse.model_validate(r)


@router.get("/communities", response_model=list[CommunityResponse])
def list_communities(
    type_: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Community).filter(Community.user_id == user.id)
    if type_:
        q = q.filter(Community.type == type_)
    return q.order_by(Community.name).all()


@router.post("/communities", response_model=CommunityResponse)
def create_community(
    body: CommunityCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    co = Community(
        user_id=user.id,
        name=body.name,
        type=body.type,
        description=body.description,
        relevance_score=body.relevance_score,
    )
    db.add(co)
    db.commit()
    db.refresh(co)
    return CommunityResponse.model_validate(co)


@router.patch("/communities/{community_id}", response_model=CommunityResponse)
def update_community(
    community_id: UUID,
    body: CommunityUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    co = db.query(Community).filter(
        Community.id == community_id,
        Community.user_id == user.id,
    ).first()
    if not co:
        raise HTTPException(status_code=404, detail="Community not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(co, k, v)
    db.commit()
    db.refresh(co)
    return CommunityResponse.model_validate(co)


@router.delete("/communities/{community_id}", status_code=204)
def delete_community(
    community_id: UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    co = db.query(Community).filter(
        Community.id == community_id,
        Community.user_id == user.id,
    ).first()
    if not co:
        raise HTTPException(status_code=404, detail="Community not found")
    db.delete(co)
    db.commit()
    return None
