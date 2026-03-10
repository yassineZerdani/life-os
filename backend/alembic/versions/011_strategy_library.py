"""Strategy Library and Protocol Engine

Revision ID: 011
Revises: 010
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB


revision: str = '011'
down_revision: Union[str, None] = '010'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'strategy_library_items',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('domain_key', sa.String(50), nullable=False),
        sa.Column('module_key', sa.String(50), nullable=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('evidence_level', sa.String(30), nullable=False),
        sa.Column('impact_level', sa.String(20), nullable=False),
        sa.Column('difficulty_level', sa.String(20), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('when_to_use', sa.Text(), nullable=True),
        sa.Column('contraindications', sa.Text(), nullable=True),
        sa.Column('active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_strategy_library_items_domain_key'), 'strategy_library_items', ['domain_key'], unique=False)
    op.create_index(op.f('ix_strategy_library_items_module_key'), 'strategy_library_items', ['module_key'], unique=False)

    op.create_table(
        'strategy_protocols',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('strategy_id', UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('cadence', sa.String(50), nullable=False),
        sa.Column('duration_days', sa.Integer(), nullable=True),
        sa.Column('instructions_json', JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['strategy_id'], ['strategy_library_items.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'protocol_steps',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('protocol_id', UUID(as_uuid=True), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('frequency', sa.String(100), nullable=True),
        sa.Column('target_metric_key', sa.String(100), nullable=True),
        sa.Column('xp_reward', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['protocol_id'], ['strategy_protocols.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'user_active_protocols',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('protocol_id', UUID(as_uuid=True), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('active', sa.Boolean(), nullable=True),
        sa.Column('adherence_score', sa.Float(), nullable=True),
        sa.Column('effectiveness_score', sa.Float(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['protocol_id'], ['strategy_protocols.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'protocol_checkins',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('user_active_protocol_id', UUID(as_uuid=True), nullable=False),
        sa.Column('checked_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('completed_steps_json', JSONB(), nullable=True),
        sa.Column('adherence_value', sa.Float(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['user_active_protocol_id'], ['user_active_protocols.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('protocol_checkins')
    op.drop_table('user_active_protocols')
    op.drop_table('protocol_steps')
    op.drop_table('strategy_protocols')
    op.drop_table('strategy_library_items')
