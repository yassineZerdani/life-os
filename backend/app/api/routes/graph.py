from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.graph import GraphNodeCreate, GraphNodeResponse, GraphEdgeCreate
from app.services import graph_service
from app.models import Relationship, Experience, Achievement
from app.services.graph_integration import (
    create_node_for_relationship,
    create_nodes_for_experience,
    create_node_for_achievement,
)

router = APIRouter()


@router.post("/node", response_model=GraphNodeResponse)
def create_node(body: GraphNodeCreate, db: Session = Depends(get_db)):
    """Create a graph node."""
    try:
        node = graph_service.create_node(db, body.type, body.name, body.metadata)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return node


@router.post("/edge")
def create_edge(body: GraphEdgeCreate, db: Session = Depends(get_db)):
    """Create a relationship between nodes."""
    edge = graph_service.create_edge(
        db, body.source_id, body.target_id, body.relation_type, body.metadata
    )
    return {
        "id": str(edge.id),
        "source_id": str(edge.source_id),
        "target_id": str(edge.target_id),
        "relation_type": edge.relation_type,
    }


@router.get("")
def get_graph(db: Session = Depends(get_db)):
    """Return full graph."""
    return graph_service.get_full_graph(db)


@router.get("/node/{node_id}")
def get_node(node_id: str, db: Session = Depends(get_db)):
    """Return node with connected edges."""
    result = graph_service.get_node_with_edges(db, node_id)
    if not result:
        raise HTTPException(status_code=404, detail="Node not found")
    return result


@router.get("/node/{node_id}/connected")
def get_connected_nodes(
    node_id: str,
    depth: int = Query(1, le=5),
    db: Session = Depends(get_db),
):
    """Get nodes connected within N hops."""
    return graph_service.get_connected_nodes(db, node_id, depth=depth)


@router.get("/path")
def get_shortest_path(
    source: str = Query(..., alias="source"),
    target: str = Query(..., alias="target"),
    db: Session = Depends(get_db),
):
    """Find shortest path between two nodes."""
    path = graph_service.find_shortest_path(db, source, target)
    if path is None:
        raise HTTPException(status_code=404, detail="No path found")
    return {"path": path}


@router.get("/node/{node_id}/connected-by-type")
def get_connected_by_type(
    node_id: str,
    type: str = Query(..., alias="type"),
    db: Session = Depends(get_db),
):
    """Find all nodes of given type connected to a person node."""
    return graph_service.get_nodes_of_type_connected_to_person(db, node_id, type)


@router.post("/sync")
def sync_graph(db: Session = Depends(get_db)):
    """Create graph nodes from existing relationships, experiences, achievements."""
    created = 0
    for r in db.query(Relationship).all():
        if create_node_for_relationship(db, r):
            created += 1
    for e in db.query(Experience).all():
        if create_nodes_for_experience(db, e):
            created += 1
    for a in db.query(Achievement).all():
        if create_node_for_achievement(db, a):
            created += 1
    db.commit()
    return {"status": "ok", "created": created}
