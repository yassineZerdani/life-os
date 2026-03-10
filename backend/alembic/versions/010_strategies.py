"""Strategies, strategy steps, and user strategies

Revision ID: 010
Revises: 009
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision: str = '010'
down_revision: Union[str, None] = '009'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'strategies',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('domain', sa.String(50), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('difficulty', sa.String(20), nullable=True),
        sa.Column('estimated_impact', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_strategies_domain'), 'strategies', ['domain'], unique=False)

    op.create_table(
        'strategy_steps',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('strategy_id', UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('frequency', sa.String(100), nullable=True),
        sa.Column('xp_reward', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['strategy_id'], ['strategies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'user_strategies',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('strategy_id', UUID(as_uuid=True), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('active', sa.Boolean(), nullable=True),
        sa.Column('adherence_score', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['strategy_id'], ['strategies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('user_strategies')
    op.drop_table('strategy_steps')
    op.drop_table('strategies')
