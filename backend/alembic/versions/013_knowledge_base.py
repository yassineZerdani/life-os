"""Knowledge & Educational content (categories, articles, tags)

Revision ID: 013
Revises: 012
Create Date: 2025-03-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB


revision: str = '013'
down_revision: Union[str, None] = '012'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'knowledge_categories',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('key', sa.String(50), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_knowledge_categories_key'), 'knowledge_categories', ['key'], unique=True)

    op.create_table(
        'knowledge_articles',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('category_id', UUID(as_uuid=True), nullable=False),
        sa.Column('slug', sa.String(200), nullable=False),
        sa.Column('title', sa.String(300), nullable=False),
        sa.Column('subtitle', sa.String(500), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('content_markdown', sa.Text(), nullable=True),
        sa.Column('difficulty_level', sa.String(30), nullable=True),
        sa.Column('evidence_level', sa.String(30), nullable=True),
        sa.Column('reading_time_minutes', sa.Integer(), nullable=True),
        sa.Column('related_strategy_ids', JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['knowledge_categories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_knowledge_articles_slug'), 'knowledge_articles', ['slug'], unique=True)
    op.create_index(op.f('ix_knowledge_articles_category_id'), 'knowledge_articles', ['category_id'], unique=False)

    op.create_table(
        'knowledge_tags',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(80), nullable=False),
        sa.Column('key', sa.String(80), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_knowledge_tags_key'), 'knowledge_tags', ['key'], unique=True)

    op.create_table(
        'article_tags',
        sa.Column('id', UUID(as_uuid=True), nullable=False),
        sa.Column('article_id', UUID(as_uuid=True), nullable=False),
        sa.Column('tag_id', UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(['article_id'], ['knowledge_articles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['knowledge_tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('article_id', 'tag_id', name='uq_article_tag')
    )
    op.create_index(op.f('ix_article_tags_article_id'), 'article_tags', ['article_id'], unique=False)
    op.create_index(op.f('ix_article_tags_tag_id'), 'article_tags', ['tag_id'], unique=False)


def downgrade() -> None:
    op.drop_table('article_tags')
    op.drop_table('knowledge_tags')
    op.drop_table('knowledge_articles')
    op.drop_table('knowledge_categories')
