from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.domain import DomainCreate, DomainUpdate, DomainResponse
from app.services import domain_service
from app.services.scoring_service import get_domain_scores_with_details, recalculate_all_domain_scores

router = APIRouter()


@router.get("/scores")
def get_domain_scores(db: Session = Depends(get_db)):
    """Get domain scores with level and XP (RPG scoring system)."""
    return get_domain_scores_with_details(db)


@router.post("/scores/recalculate")
def recalculate_scores(db: Session = Depends(get_db)):
    """Recalculate all domain scores from metrics."""
    recalculate_all_domain_scores(db)
    return {"ok": True}


@router.get("", response_model=list[DomainResponse])
def list_domains(db: Session = Depends(get_db)):
    return domain_service.get_domains(db)


@router.get("/{domain_id}", response_model=DomainResponse)
def get_domain(domain_id: int, db: Session = Depends(get_db)):
    domain = domain_service.get_domain_by_id(db, domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    return domain


@router.get("/slug/{slug}", response_model=DomainResponse)
def get_domain_by_slug(slug: str, db: Session = Depends(get_db)):
    domain = domain_service.get_domain_by_slug(db, slug)
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    return domain


@router.post("", response_model=DomainResponse)
def create_domain(domain: DomainCreate, db: Session = Depends(get_db)):
    return domain_service.create_domain(db, domain)


@router.patch("/{domain_id}", response_model=DomainResponse)
def update_domain(domain_id: int, domain: DomainUpdate, db: Session = Depends(get_db)):
    result = domain_service.update_domain(db, domain_id, domain)
    if not result:
        raise HTTPException(status_code=404, detail="Domain not found")
    return result
