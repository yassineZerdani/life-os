"""Pydantic schemas for Learn / Knowledge API."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class KnowledgeCategoryOut(BaseModel):
    id: UUID
    key: str
    name: str
    description: str | None
    icon: str | None
    created_at: datetime | None
    article_count: int = 0

    class Config:
        from_attributes = True


class KnowledgeTagOut(BaseModel):
    id: UUID
    name: str
    key: str

    class Config:
        from_attributes = True


class KnowledgeArticleListItem(BaseModel):
    id: UUID
    slug: str
    title: str
    subtitle: str | None
    summary: str | None
    difficulty_level: str | None
    evidence_level: str | None
    reading_time_minutes: int | None
    created_at: datetime | None
    category_key: str
    category_name: str
    tags: list[KnowledgeTagOut]

    class Config:
        from_attributes = True


class KnowledgeArticleDetail(BaseModel):
    id: UUID
    slug: str
    title: str
    subtitle: str | None
    summary: str | None
    content_markdown: str | None
    difficulty_level: str | None
    evidence_level: str | None
    reading_time_minutes: int | None
    related_strategy_ids: list[str] | None
    created_at: datetime | None
    updated_at: datetime | None
    category: KnowledgeCategoryOut
    tags: list[KnowledgeTagOut]

    class Config:
        from_attributes = True
