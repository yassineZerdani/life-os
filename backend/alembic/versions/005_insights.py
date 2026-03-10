"""Insights for life analytics

Revision ID: 005
Revises: 004
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision: str = '005'
down_revision: Union[str, None] = '004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'insights',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('type', sa.String(50), nullable=True),
        sa.Column('domain', sa.String(50), nullable=True),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('severity', sa.String(20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('resolved', sa.Boolean(), nullable=True, server_default='false'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_insights_domain'), 'insights', ['domain'], unique=False)
    op.create_index(op.f('ix_insights_type'), 'insights', ['type'], unique=False)


def downgrade() -> None:
    op.drop_table('insights')
