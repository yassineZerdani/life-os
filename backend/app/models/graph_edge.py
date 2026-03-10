from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid


class GraphEdge(Base):
    __tablename__ = "graph_edges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(UUID(as_uuid=True), ForeignKey("graph_nodes.id"), nullable=False)
    target_id = Column(UUID(as_uuid=True), ForeignKey("graph_nodes.id"), nullable=False)
    relation_type = Column(String(100), nullable=False)
    extra_data = Column(JSONB, nullable=True, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    source_node = relationship("GraphNode", foreign_keys=[source_id], back_populates="outgoing_edges")
    target_node = relationship("GraphNode", foreign_keys=[target_id], back_populates="incoming_edges")
