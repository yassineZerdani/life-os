"""
Graph Integration - auto-create graph nodes when life entities are added.

Creates GraphNodes and GraphEdges when:
- Relationship is added -> person node
- Experience is logged -> experience node + person nodes for people_involved + edges
- Achievement is recorded -> achievement node
"""
from sqlalchemy.orm import Session

from app.models import GraphNode, GraphEdge, Relationship, Experience, Achievement


def _get_or_create_person_node(db: Session, name: str, source: str, source_id) -> GraphNode:
    """Get existing person node by name or create new one."""
    existing = db.query(GraphNode).filter(
        GraphNode.type == "person",
        GraphNode.name == name,
    ).first()
    if existing:
        return existing
    node = GraphNode(
        type="person",
        name=name,
        extra_data={"source": source, "source_id": str(source_id)},
    )
    db.add(node)
    db.flush()
    return node


def create_node_for_relationship(db: Session, relationship: Relationship) -> GraphNode | None:
    """Create person node when relationship is added."""
    if not relationship.name:
        return None
    existing = db.query(GraphNode).filter(
        GraphNode.type == "person",
        GraphNode.extra_data.op("@>")(
            {"source": "relationship", "source_id": str(relationship.id)}
        ),
    ).first()
    if existing:
        return None
    return _get_or_create_person_node(db, relationship.name, "relationship", relationship.id)


def create_nodes_for_experience(db: Session, experience: Experience) -> GraphNode | None:
    """Create experience node and person nodes for people_involved, with edges."""
    if not experience.title:
        return None
    existing = db.query(GraphNode).filter(
        GraphNode.type == "experience",
        GraphNode.extra_data.op("@>")(
            {"source": "experience", "source_id": str(experience.id)}
        ),
    ).first()
    if existing:
        return None
    exp_node = GraphNode(
        type="experience",
        name=experience.title,
        extra_data={
            "source": "experience",
            "source_id": experience.id,
            "location": experience.location,
            "date": experience.date.isoformat() if experience.date else None,
        },
    )
    db.add(exp_node)
    db.flush()

    people = experience.people_involved or []
    if isinstance(people, str):
        people = [people]
    for p in people:
        if p:
            person_node = _get_or_create_person_node(db, str(p), "experience_people", experience.id)
            edge = GraphEdge(
                source_id=exp_node.id,
                target_id=person_node.id,
                relation_type="met",
            )
            db.add(edge)
    db.flush()
    return exp_node


def create_node_for_achievement(db: Session, achievement: Achievement) -> GraphNode | None:
    """Create achievement node when achievement is recorded."""
    if not achievement.title:
        return None
    existing = db.query(GraphNode).filter(
        GraphNode.type == "achievement",
        GraphNode.extra_data.op("@>")(
            {"source": "achievement", "source_id": str(achievement.id)}
        ),
    ).first()
    if existing:
        return None
    node = GraphNode(
        type="achievement",
        name=achievement.title,
        extra_data={
            "source": "achievement",
            "source_id": str(achievement.id),
            "domain": achievement.domain,
        },
    )
    db.add(node)
    db.flush()
    return node
