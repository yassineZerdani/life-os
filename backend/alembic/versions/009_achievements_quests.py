"""Achievement definitions, unlocks, and quests for gamification

Revision ID: 009
Revises: 008
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision: str = '009'
down_revision: Union[str, None] = '008'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'achievement_definitions',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('domain', sa.String(50), nullable=True),
        sa.Column('xp_reward', sa.Float(), nullable=True),
        sa.Column('condition_expression', sa.String(500), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_achievement_definitions_domain'), 'achievement_definitions', ['domain'], unique=False)

    op.create_table(
        'achievement_unlocks',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('achievement_id', UUID(as_uuid=True), nullable=False),
        sa.Column('unlocked_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['achievement_id'], ['achievement_definitions.id']),
    )

    op.create_table(
        'quests',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('domain', sa.String(50), nullable=True),
        sa.Column('xp_reward', sa.Float(), nullable=True),
        sa.Column('target_value', sa.Float(), nullable=True),
        sa.Column('progress', sa.Float(), nullable=True),
        sa.Column('deadline', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_quests_domain'), 'quests', ['domain'], unique=False)


def downgrade() -> None:
    op.drop_table('quests')
    op.drop_table('achievement_unlocks')
    op.drop_table('achievement_definitions')
