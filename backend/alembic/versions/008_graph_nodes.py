"""Life graph nodes and edges

Revision ID: 008
Revises: 007
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB


revision: str = '008'
down_revision: Union[str, None] = '007'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'graph_nodes',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('extra_data', JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_graph_nodes_type'), 'graph_nodes', ['type'], unique=False)

    op.create_table(
        'graph_edges',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('source_id', UUID(as_uuid=True), nullable=False),
        sa.Column('target_id', UUID(as_uuid=True), nullable=False),
        sa.Column('relation_type', sa.String(100), nullable=False),
        sa.Column('extra_data', JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['source_id'], ['graph_nodes.id']),
        sa.ForeignKeyConstraint(['target_id'], ['graph_nodes.id']),
    )
    op.create_index(op.f('ix_graph_edges_source_id'), 'graph_edges', ['source_id'], unique=False)
    op.create_index(op.f('ix_graph_edges_target_id'), 'graph_edges', ['target_id'], unique=False)


def downgrade() -> None:
    op.drop_table('graph_edges')
    op.drop_table('graph_nodes')
