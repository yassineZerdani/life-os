"""
Graph Service - life graph queries and operations.

Provides CRUD for nodes/edges and helper queries:
- get connected nodes
- find shortest path between nodes
- find all nodes of a type connected to a person
"""
from collections import deque
from typing import Any
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models import GraphNode, GraphEdge

NODE_TYPES = {"person", "skill", "experience", "goal", "achievement", "place", "project"}


def create_node(db: Session, type: str, name: str, metadata: dict | None = None) -> GraphNode:
    if type not in NODE_TYPES:
        raise ValueError(f"Invalid node type: {type}")
    node = GraphNode(type=type, name=name, extra_data=metadata or {})
    db.add(node)
    db.commit()
    db.refresh(node)
    return node


def create_edge(db: Session, source_id: str, target_id: str, relation_type: str, metadata: dict | None = None) -> GraphEdge:
    import uuid
    edge = GraphEdge(
        source_id=uuid.UUID(source_id),
        target_id=uuid.UUID(target_id),
        relation_type=relation_type,
        extra_data=metadata or {},
    )
    db.add(edge)
    db.commit()
    db.refresh(edge)
    return edge


def get_full_graph(db: Session) -> dict[str, Any]:
    """Return full graph as nodes and edges for visualization."""
    nodes = db.query(GraphNode).all()
    edges = db.query(GraphEdge).all()
    return {
        "nodes": [
            {
                "id": str(n.id),
                "type": n.type,
                "name": n.name,
                "metadata": n.extra_data or {},
                "created_at": n.created_at.isoformat() if n.created_at else None,
            }
            for n in nodes
        ],
        "edges": [
            {
                "id": str(e.id),
                "source_id": str(e.source_id),
                "target_id": str(e.target_id),
                "relation_type": e.relation_type,
                "metadata": e.extra_data or {},
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            for e in edges
        ],
    }


def get_node_with_edges(db: Session, node_id: str) -> dict[str, Any] | None:
    """Return node with connected edges."""
    import uuid
    node = db.query(GraphNode).filter(GraphNode.id == uuid.UUID(node_id)).first()
    if not node:
        return None
    outgoing = db.query(GraphEdge).filter(GraphEdge.source_id == node.id).all()
    incoming = db.query(GraphEdge).filter(GraphEdge.target_id == node.id).all()
    targets = {e.target_id for e in outgoing} | {e.source_id for e in incoming}
    connected = db.query(GraphNode).filter(GraphNode.id.in_(targets)).all() if targets else []
    return {
        "node": {
            "id": str(node.id),
            "type": node.type,
            "name": node.name,
            "metadata": node.extra_data or {},
            "created_at": node.created_at.isoformat() if node.created_at else None,
        },
        "outgoing_edges": [
            {"id": str(e.id), "target_id": str(e.target_id), "relation_type": e.relation_type}
            for e in outgoing
        ],
        "incoming_edges": [
            {"id": str(e.id), "source_id": str(e.source_id), "relation_type": e.relation_type}
            for e in incoming
        ],
        "connected_nodes": [
            {"id": str(n.id), "type": n.type, "name": n.name}
            for n in connected
        ],
    }


def get_connected_nodes(db: Session, node_id: str, depth: int = 1) -> list[dict]:
    """Get nodes connected within N hops."""
    import uuid
    seen = {uuid.UUID(node_id)}
    frontier = deque([(uuid.UUID(node_id), 0)])
    result = []

    while frontier:
        nid, d = frontier.popleft()
        if d > depth:
            continue
        edges = db.query(GraphEdge).filter(
            or_(GraphEdge.source_id == nid, GraphEdge.target_id == nid)
        ).all()
        for e in edges:
            other = e.target_id if e.source_id == nid else e.source_id
            if other not in seen:
                seen.add(other)
                node = db.query(GraphNode).filter(GraphNode.id == other).first()
                if node:
                    result.append({"id": str(node.id), "type": node.type, "name": node.name, "depth": d + 1})
                    frontier.append((other, d + 1))

    return result


def find_shortest_path(db: Session, source_id: str, target_id: str) -> list[str] | None:
    """BFS to find shortest path (returns node ids)."""
    import uuid
    sid, tid = uuid.UUID(source_id), uuid.UUID(target_id)
    if sid == tid:
        return [source_id]
    parent: dict = {}
    frontier = deque([sid])
    parent[sid] = None

    while frontier:
        nid = frontier.popleft()
        if nid == tid:
            path = []
            while nid:
                path.append(str(nid))
                nid = parent.get(nid)
            return path[::-1]
        edges = db.query(GraphEdge).filter(
            or_(GraphEdge.source_id == nid, GraphEdge.target_id == nid)
        ).all()
        for e in edges:
            other = e.target_id if e.source_id == nid else e.source_id
            if other not in parent:
                parent[other] = nid
                frontier.append(other)

    return None


def get_nodes_of_type_connected_to_person(db: Session, person_node_id: str, node_type: str) -> list[dict]:
    """Find all nodes of given type connected to a person node."""
    connected = get_connected_nodes(db, person_node_id, depth=5)
    return [c for c in connected if c["type"] == node_type]
