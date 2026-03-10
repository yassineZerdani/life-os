import { api } from './api'

export interface KnowledgeCategory {
  id: string
  key: string
  name: string
  description: string | null
  icon: string | null
  created_at: string | null
  article_count: number
}

export interface KnowledgeTag {
  id: string
  name: string
  key: string
}

export interface KnowledgeArticleListItem {
  id: string
  slug: string
  title: string
  subtitle: string | null
  summary: string | null
  difficulty_level: string | null
  evidence_level: string | null
  reading_time_minutes: number | null
  created_at: string | null
  category_key: string
  category_name: string
  tags: KnowledgeTag[]
}

export interface KnowledgeArticleDetail extends KnowledgeArticleListItem {
  content_markdown: string | null
  related_strategy_ids: string[] | null
  related_articles?: RecommendedArticle[]
  updated_at: string | null
  category: KnowledgeCategory
}

export interface RecommendedArticle {
  id: string
  slug: string
  title: string
  summary: string | null
  reading_time_minutes: number | null
  category_name: string
}

export const learnService = {
  categories: () => api.get<KnowledgeCategory[]>('/learn/categories'),

  articles: (params?: { category_key?: string; limit?: number; offset?: number; featured?: boolean }) => {
    const q = new URLSearchParams()
    if (params?.category_key) q.set('category_key', params.category_key)
    if (params?.limit != null) q.set('limit', String(params.limit))
    if (params?.offset != null) q.set('offset', String(params.offset))
    if (params?.featured) q.set('featured', 'true')
    const query = q.toString()
    return api.get<KnowledgeArticleListItem[]>(`/learn/articles${query ? `?${query}` : ''}`)
  },

  articleBySlug: (slug: string) =>
    api.get<KnowledgeArticleDetail>(`/learn/articles/${encodeURIComponent(slug)}`),

  search: (q: string, params?: { category_key?: string; tag_key?: string; limit?: number }) => {
    const searchParams = new URLSearchParams({ q })
    if (params?.category_key) searchParams.set('category_key', params.category_key)
    if (params?.tag_key) searchParams.set('tag_key', params.tag_key)
    if (params?.limit != null) searchParams.set('limit', String(params.limit))
    return api.get<KnowledgeArticleListItem[]>(`/learn/search?${searchParams}`)
  },

  recommended: () => api.get<RecommendedArticle | null>('/learn/recommended'),
}
