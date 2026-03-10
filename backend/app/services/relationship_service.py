from sqlalchemy.orm import Session
from app.models import Relationship
from app.schemas.relationship import RelationshipCreate, RelationshipUpdate


def get_relationships(db: Session):
    return db.query(Relationship).order_by(Relationship.name).all()


def get_relationship_by_id(db: Session, relationship_id: int):
    return db.query(Relationship).filter(Relationship.id == relationship_id).first()


def create_relationship(db: Session, relationship: RelationshipCreate):
    db_rel = Relationship(**relationship.model_dump())
    db.add(db_rel)
    db.flush()
    from app.services.graph_integration import create_node_for_relationship
    create_node_for_relationship(db, db_rel)
    db.commit()
    db.refresh(db_rel)
    return db_rel


def update_relationship(db: Session, relationship_id: int, relationship: RelationshipUpdate):
    db_rel = get_relationship_by_id(db, relationship_id)
    if not db_rel:
        return None
    update_data = relationship.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_rel, key, value)
    db.commit()
    db.refresh(db_rel)
    return db_rel


def delete_relationship(db: Session, relationship_id: int):
    db_rel = get_relationship_by_id(db, relationship_id)
    if db_rel:
        db.delete(db_rel)
        db.commit()
        return True
    return False
