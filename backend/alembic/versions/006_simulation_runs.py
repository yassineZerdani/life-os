"""Simulation runs for future life projection

Revision ID: 006
Revises: 005
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB


revision: str = '006'
down_revision: Union[str, None] = '005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'simulation_runs',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('months_ahead', sa.Integer(), nullable=False),
        sa.Column('scenario_parameters', JSONB(), nullable=True),
        sa.Column('result', JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('simulation_runs')
