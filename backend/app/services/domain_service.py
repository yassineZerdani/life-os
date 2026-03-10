from sqlalchemy.orm import Session
from app.models import Domain
from app.schemas.domain import DomainCreate, DomainUpdate


def get_domains(db: Session):
    return db.query(Domain).all()


def get_domain_by_id(db: Session, domain_id: int):
    return db.query(Domain).filter(Domain.id == domain_id).first()


def get_domain_by_slug(db: Session, slug: str):
    return db.query(Domain).filter(Domain.slug == slug).first()


def create_domain(db: Session, domain: DomainCreate):
    db_domain = Domain(**domain.model_dump())
    db.add(db_domain)
    db.commit()
    db.refresh(db_domain)
    return db_domain


def update_domain(db: Session, domain_id: int, domain: DomainUpdate):
    db_domain = get_domain_by_id(db, domain_id)
    if not db_domain:
        return None
    update_data = domain.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_domain, key, value)
    db.commit()
    db.refresh(db_domain)
    return db_domain
