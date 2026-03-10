"""Action templates and completions for life decision engine

Revision ID: 007
Revises: 006
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision: str = '007'
down_revision: Union[str, None] = '006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'action_templates',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('domain', sa.String(50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('xp_reward', sa.Float(), nullable=True),
        sa.Column('estimated_score_impact', sa.Float(), nullable=True),
        sa.Column('time_cost_minutes', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_action_templates_domain'), 'action_templates', ['domain'], unique=False)

    op.create_table(
        'action_completions',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('action_template_id', UUID(as_uuid=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['action_template_id'], ['action_templates.id']),
    )


def downgrade() -> None:
    op.drop_table('action_completions')
    op.drop_table('action_templates')
