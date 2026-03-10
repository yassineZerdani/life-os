from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.relationship import RelationshipCreate, RelationshipUpdate, RelationshipResponse
from app.services import relationship_service

router = APIRouter()


@router.get("", response_model=list[RelationshipResponse])
def list_relationships(db: Session = Depends(get_db)):
    return relationship_service.get_relationships(db)


@router.get("/{relationship_id}", response_model=RelationshipResponse)
def get_relationship(relationship_id: int, db: Session = Depends(get_db)):
    rel = relationship_service.get_relationship_by_id(db, relationship_id)
    if not rel:
        raise HTTPException(status_code=404, detail="Relationship not found")
    return rel


@router.post("", response_model=RelationshipResponse)
def create_relationship(relationship: RelationshipCreate, db: Session = Depends(get_db)):
    return relationship_service.create_relationship(db, relationship)


@router.patch("/{relationship_id}", response_model=RelationshipResponse)
def update_relationship(relationship_id: int, relationship: RelationshipUpdate, db: Session = Depends(get_db)):
    result = relationship_service.update_relationship(db, relationship_id, relationship)
    if not result:
        raise HTTPException(status_code=404, detail="Relationship not found")
    return result


@router.delete("/{relationship_id}")
def delete_relationship(relationship_id: int, db: Session = Depends(get_db)):
    if not relationship_service.delete_relationship(db, relationship_id):
        raise HTTPException(status_code=404, detail="Relationship not found")
    return {"ok": True}
