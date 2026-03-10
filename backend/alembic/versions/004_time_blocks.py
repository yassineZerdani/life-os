"""Time blocks for time tracking

Revision ID: 004
Revises: 003
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision: str = '004'
down_revision: Union[str, None] = '003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'time_blocks',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('domain', sa.String(50), nullable=True),
        sa.Column('title', sa.String(200), nullable=True),
        sa.Column('start_time', sa.DateTime(timezone=True), nullable=True),
        sa.Column('end_time', sa.DateTime(timezone=True), nullable=True),
        sa.Column('duration_minutes', sa.Float(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_time_blocks_domain'), 'time_blocks', ['domain'], unique=False)
    op.create_index(op.f('ix_time_blocks_start_time'), 'time_blocks', ['start_time'], unique=False)


def downgrade() -> None:
    op.drop_table('time_blocks')
