"""Learn / Knowledge base API: categories, articles, search."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func, distinct

from app.api.deps import get_db
from app.models import KnowledgeCategory, KnowledgeArticle, KnowledgeTag, ArticleTag

router = APIRouter()


@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    """List all knowledge categories with article counts."""
    categories = db.query(KnowledgeCategory).order_by(KnowledgeCategory.name).all()
    result = []
    for c in categories:
        count = db.query(func.count(KnowledgeArticle.id)).filter(KnowledgeArticle.category_id == c.id).scalar() or 0
        result.append({
            "id": str(c.id),
            "key": c.key,
            "name": c.name,
            "description": c.description,
            "icon": c.icon,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "article_count": count,
        })
    return result


@router.get("/articles")
def list_articles(
    category_key: str | None = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    featured: bool = Query(False),
    db: Session = Depends(get_db),
):
    """List articles, optionally by category. featured=true returns a few for homepage."""
    q = (
        db.query(KnowledgeArticle)
        .options(joinedload(KnowledgeArticle.category), joinedload(KnowledgeArticle.article_tag_assocs).joinedload(ArticleTag.tag))
        .order_by(KnowledgeArticle.created_at.desc())
    )
    if category_key:
        cat = db.query(KnowledgeCategory).filter(KnowledgeCategory.key == category_key).first()
        if not cat:
            raise HTTPException(status_code=404, detail="Category not found")
        q = q.filter(KnowledgeArticle.category_id == cat.id)
    if featured:
        q = q.limit(6)
    else:
        q = q.offset(offset).limit(limit)
    articles = q.all()
    return [_article_list_item(a) for a in articles]


def _article_list_item(a: KnowledgeArticle):
    return {
        "id": str(a.id),
        "slug": a.slug,
        "title": a.title,
        "subtitle": a.subtitle,
        "summary": a.summary,
        "difficulty_level": a.difficulty_level,
        "evidence_level": a.evidence_level,
        "reading_time_minutes": a.reading_time_minutes,
        "created_at": a.created_at.isoformat() if a.created_at else None,
        "category_key": a.category.key if a.category else "",
        "category_name": a.category.name if a.category else "",
        "tags": [{"id": str(t.tag.id), "name": t.tag.name, "key": t.tag.key} for t in a.article_tag_assocs],
    }


@router.get("/articles/{slug}")
def get_article(slug: str, db: Session = Depends(get_db)):
    """Get a single article by slug with full content."""
    article = (
        db.query(KnowledgeArticle)
        .options(joinedload(KnowledgeArticle.category), joinedload(KnowledgeArticle.article_tag_assocs).joinedload(ArticleTag.tag))
        .filter(KnowledgeArticle.slug == slug)
        .first()
    )
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    related = (
        db.query(KnowledgeArticle)
        .options(joinedload(KnowledgeArticle.category))
        .filter(
            KnowledgeArticle.category_id == article.category_id,
            KnowledgeArticle.id != article.id,
        )
        .order_by(KnowledgeArticle.created_at.desc())
        .limit(3)
        .all()
    )
    return {
        "id": str(article.id),
        "slug": article.slug,
        "title": article.title,
        "subtitle": article.subtitle,
        "summary": article.summary,
        "content_markdown": article.content_markdown,
        "difficulty_level": article.difficulty_level,
        "evidence_level": article.evidence_level,
        "reading_time_minutes": article.reading_time_minutes,
        "related_strategy_ids": [str(x) for x in (article.related_strategy_ids or [])],
        "created_at": article.created_at.isoformat() if article.created_at else None,
        "updated_at": article.updated_at.isoformat() if article.updated_at else None,
        "category": {
            "id": str(article.category.id),
            "key": article.category.key,
            "name": article.category.name,
            "description": article.category.description,
            "icon": article.category.icon,
        },
        "tags": [{"id": str(t.tag.id), "name": t.tag.name, "key": t.tag.key} for t in article.article_tag_assocs],
        "related_articles": [
            {
                "id": str(a.id),
                "slug": a.slug,
                "title": a.title,
                "summary": a.summary,
                "reading_time_minutes": a.reading_time_minutes,
                "category_name": a.category.name if a.category else "",
            }
            for a in related
        ],
    }


@router.get("/search")
def search_articles(
    q: str = Query(..., min_length=1),
    category_key: str | None = Query(None),
    tag_key: str | None = Query(None),
    limit: int = Query(20, le=50),
    db: Session = Depends(get_db),
):
    """Search articles by title, summary, content, category, or tag."""
    term = f"%{q.strip()}%"
    query = (
        db.query(KnowledgeArticle)
        .options(joinedload(KnowledgeArticle.category), joinedload(KnowledgeArticle.article_tag_assocs).joinedload(ArticleTag.tag))
        .filter(
            or_(
                KnowledgeArticle.title.ilike(term),
                KnowledgeArticle.subtitle.ilike(term),
                KnowledgeArticle.summary.ilike(term),
                KnowledgeArticle.content_markdown.ilike(term),
            )
        )
    )
    if category_key:
        cat = db.query(KnowledgeCategory).filter(KnowledgeCategory.key == category_key).first()
        if cat:
            query = query.filter(KnowledgeArticle.category_id == cat.id)
    if tag_key:
        tag = db.query(KnowledgeTag).filter(KnowledgeTag.key == tag_key).first()
        if tag:
            query = query.join(ArticleTag).filter(ArticleTag.tag_id == tag.id)
    articles = query.distinct().order_by(KnowledgeArticle.created_at.desc()).limit(limit).all()
    return [_article_list_item(a) for a in articles]


@router.get("/recommended")
def get_recommended_article(db: Session = Depends(get_db)):
    """Return one recommended article for 'Learn Something Today' widget."""
    article = (
        db.query(KnowledgeArticle)
        .options(joinedload(KnowledgeArticle.category))
        .order_by(func.random())
        .limit(1)
        .first()
    )
    if not article:
        return None
    return {
        "id": str(article.id),
        "slug": article.slug,
        "title": article.title,
        "summary": article.summary,
        "reading_time_minutes": article.reading_time_minutes,
        "category_name": article.category.name if article.category else "",
    }
