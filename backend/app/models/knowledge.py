"""
Knowledge & Educational content models.
Categories, articles, tags for the Learn section.
"""
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import uuid


class KnowledgeCategory(Base):
    """Category for organizing learn articles (Health, Psychology, Finance, etc.)."""
    __tablename__ = "knowledge_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(50), nullable=False, unique=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    articles = relationship(
        "KnowledgeArticle",
        back_populates="category",
        cascade="all, delete-orphan",
        order_by="KnowledgeArticle.created_at.desc()",
    )


class KnowledgeArticle(Base):
    """Educational article (markdown content)."""
    __tablename__ = "knowledge_articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_categories.id", ondelete="CASCADE"), nullable=False, index=True)
    slug = Column(String(200), nullable=False, unique=True, index=True)
    title = Column(String(300), nullable=False)
    subtitle = Column(String(500), nullable=True)
    summary = Column(Text, nullable=True)
    content_markdown = Column(Text, nullable=True)
    difficulty_level = Column(String(30), nullable=True)  # beginner, intermediate, advanced
    evidence_level = Column(String(30), nullable=True)  # high, moderate, emerging
    reading_time_minutes = Column(Integer, nullable=True)
    related_strategy_ids = Column(JSONB, nullable=True)  # list of strategy_library_item UUIDs
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    category = relationship("KnowledgeCategory", back_populates="articles")
    article_tag_assocs = relationship(
        "ArticleTag",
        back_populates="article",
        cascade="all, delete-orphan",
    )

    @property
    def tag_list(self):
        return [a.tag for a in self.article_tag_assocs]


class KnowledgeTag(Base):
    """Tag for cross-cutting topics (e.g. CBT, budgeting)."""
    __tablename__ = "knowledge_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(80), nullable=False)
    key = Column(String(80), nullable=False, unique=True, index=True)

    article_tag_assocs = relationship("ArticleTag", back_populates="tag", cascade="all, delete-orphan")


class ArticleTag(Base):
    """Many-to-many: article <-> tag."""
    __tablename__ = "article_tags"
    __table_args__ = (UniqueConstraint("article_id", "tag_id", name="uq_article_tag"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_articles.id", ondelete="CASCADE"), nullable=False, index=True)
    tag_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_tags.id", ondelete="CASCADE"), nullable=False, index=True)

    article = relationship("KnowledgeArticle", back_populates="article_tag_assocs")
    tag = relationship("KnowledgeTag", back_populates="article_tag_assocs")
