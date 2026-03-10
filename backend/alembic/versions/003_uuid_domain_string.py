"""UUID and domain string refactor

Revision ID: 003
Revises: 002
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # Drop old RPG tables (data will be re-seeded)
    op.drop_table('life_events')
    op.drop_table('xp_events')
    op.drop_table('domain_scores')
    op.drop_table('metric_entries')
    op.drop_table('metrics')

    # Drop achievements to recreate with new schema
    op.drop_table('achievements')

    # Create metric_definitions
    op.create_table(
        'metric_definitions',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(100), nullable=True),
        sa.Column('domain', sa.String(50), nullable=True),
        sa.Column('unit', sa.String(50), nullable=True),
        sa.Column('weight', sa.Float(), nullable=True, server_default='1.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_metric_definitions_domain'), 'metric_definitions', ['domain'], unique=False)

    # Create metric_entries
    op.create_table(
        'metric_entries',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('metric_id', UUID(as_uuid=True), nullable=False),
        sa.Column('value', sa.Float(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('note', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['metric_id'], ['metric_definitions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create domain_scores
    op.create_table(
        'domain_scores',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('domain', sa.String(50), nullable=True),
        sa.Column('score', sa.Float(), nullable=True, server_default='0'),
        sa.Column('level', sa.Integer(), nullable=True, server_default='1'),
        sa.Column('xp', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('domain')
    )
    # Create xp_events
    op.create_table(
        'xp_events',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('domain', sa.String(50), nullable=True),
        sa.Column('xp_amount', sa.Float(), nullable=True),
        sa.Column('reason', sa.String(200), nullable=True),
        sa.Column('source_type', sa.String(50), nullable=True),
        sa.Column('source_id', UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_xp_events_domain'), 'xp_events', ['domain'], unique=False)

    # Create life_events
    op.create_table(
        'life_events',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(200), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('domain', sa.String(50), nullable=True),
        sa.Column('event_type', sa.String(50), nullable=True),
        sa.Column('xp_awarded', sa.Float(), nullable=True, server_default='0'),
        sa.Column('date', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_life_events_domain'), 'life_events', ['domain'], unique=False)

    # Create achievements (new schema)
    op.create_table(
        'achievements',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(200), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('domain', sa.String(50), nullable=True),
        sa.Column('date', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('xp_awarded', sa.Float(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_achievements_domain'), 'achievements', ['domain'], unique=False)


def downgrade() -> None:
    op.drop_table('achievements')
    op.drop_table('life_events')
    op.drop_table('xp_events')
    op.drop_table('domain_scores')
    op.drop_table('metric_entries')
    op.drop_table('metric_definitions')
    # Recreate old tables would require 001/002 schema - skip for brevity
