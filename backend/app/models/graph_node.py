from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid


class GraphNode(Base):
    __tablename__ = "graph_nodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String(50), index=True, nullable=False)
    name = Column(String(200), nullable=False)
    extra_data = Column(JSONB, nullable=True, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    outgoing_edges = relationship(
        "GraphEdge",
        foreign_keys="GraphEdge.source_id",
        back_populates="source_node",
    )
    incoming_edges = relationship(
        "GraphEdge",
        foreign_keys="GraphEdge.target_id",
        back_populates="target_node",
    )
