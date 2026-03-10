"""RPG scoring system

Revision ID: 002
Revises: 001
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('metrics', sa.Column('weight', sa.Float(), nullable=True, server_default='1.0'))

    op.create_table(
        'domain_scores',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('domain_id', sa.Integer(), nullable=True),
        sa.Column('score', sa.Float(), nullable=True, server_default='0'),
        sa.Column('level', sa.Integer(), nullable=True, server_default='1'),
        sa.Column('xp', sa.Float(), nullable=True, server_default='0'),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['domain_id'], ['domains.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('domain_id')
    )
    op.create_index(op.f('ix_domain_scores_id'), 'domain_scores', ['id'], unique=False)

    op.create_table(
        'xp_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('domain_id', sa.Integer(), nullable=True),
        sa.Column('xp_amount', sa.Float(), nullable=True),
        sa.Column('reason', sa.String(200), nullable=True),
        sa.Column('source_type', sa.String(50), nullable=True),
        sa.Column('source_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['domain_id'], ['domains.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_xp_events_id'), 'xp_events', ['id'], unique=False)

    op.create_table(
        'life_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(200), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('domain_id', sa.Integer(), nullable=True),
        sa.Column('event_type', sa.String(50), nullable=True),
        sa.Column('date', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('xp_awarded', sa.Float(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['domain_id'], ['domains.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_life_events_id'), 'life_events', ['id'], unique=False)


def downgrade() -> None:
    op.drop_table('life_events')
    op.drop_table('xp_events')
    op.drop_table('domain_scores')
    op.drop_column('metrics', 'weight')
