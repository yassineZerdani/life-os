import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Button, Spin } from 'antd'
import { ArrowLeftOutlined, BulbOutlined, BookOutlined } from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'
import { learnService } from '../../services/learn'
import { strategyLibraryService } from '../../services/strategyLibrary'
import { ArticleContent } from '../../components/learn/ArticleContent'
import { ArticleTOC, extractTocFromMarkdown } from '../../components/learn/ArticleTOC'
import { LEARN_CATEGORY_COLORS } from '../../components/control-room/constants'
import '../../styles/learn.css'

const { Title, Text } = Typography

export function LearnArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const [activeTocId, setActiveTocId] = useState<string>('')
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['learn', 'article', slug],
    queryFn: () => learnService.articleBySlug(slug!),
    enabled: !!slug,
  })
  const tocItems = article?.content_markdown ? extractTocFromMarkdown(article.content_markdown) : []
  const relatedStrategyIds = article?.related_strategy_ids ?? []
  const { data: strategies = [] } = useQuery({
    queryKey: ['strategy-library', 'list'],
    queryFn: () => strategyLibraryService.list(),
  })
  const relatedStrategies = strategies.filter((s) => relatedStrategyIds.includes(s.id))

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveTocId(e.target.id)
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )
    tocItems.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [tocItems, article?.slug])

  if (error || (!isLoading && !article)) {
    return (
      <div className="learn-container" style={{ padding: 48, textAlign: 'center', color: theme.textSecondary }}>
        Article not found.
        <Button type="link" onClick={() => navigate('/app/learn')}>Back to Learn</Button>
      </div>
    )
  }
  if (isLoading || !article) {
    return (
      <div className="learn-container" style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  const categoryKey = article.category?.key ?? (article as { category_key?: string }).category_key
  const categoryName = article.category?.name ?? (article as { category_name?: string }).category_name
  const categoryColor = categoryKey ? (LEARN_CATEGORY_COLORS[categoryKey] || theme.accent) : theme.accent

  return (
    <div className="learn-container" style={{ paddingBottom: 48 }}>
      <button
        type="button"
        onClick={() => navigate(categoryKey ? `/app/learn/category/${categoryKey}` : '/app/learn')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 24,
          padding: '8px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: theme.textSecondary,
          fontSize: 14,
        }}
      >
        <ArrowLeftOutlined /> Back to {categoryName || 'Learn'}
      </button>

      <div className="learn-article-layout">
        <article className="learn-article-main">
          <header style={{ marginBottom: 32 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: 6,
                background: categoryColor,
                color: '#fff',
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              {categoryName}
            </span>
            <Title level={1} className="learn-h1" style={{ color: theme.textPrimary, marginBottom: 8 }}>
              {article.title}
            </Title>
            {article.subtitle && (
              <Text style={{ fontSize: 18, color: theme.textSecondary, lineHeight: 1.5, display: 'block', marginBottom: 16 }}>
                {article.subtitle}
              </Text>
            )}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {article.reading_time_minutes != null && (
                <span style={{ fontSize: 14, color: theme.textMuted }}>{article.reading_time_minutes} min read</span>
              )}
              {article.evidence_level && (
                <span
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: theme.accentLight,
                    color: theme.accent,
                    textTransform: 'capitalize',
                  }}
                >
                  Evidence: {article.evidence_level}
                </span>
              )}
              {article.difficulty_level && (
                <span
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: theme.hoverBg,
                    color: theme.textSecondary,
                    textTransform: 'capitalize',
                  }}
                >
                  Difficulty: {article.difficulty_level}
                </span>
              )}
            </div>
            {article.tags?.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {article.tags.map((t) => (
                  <span key={t.id} style={{ fontSize: 12, color: theme.textMuted }}>#{t.name}</span>
                ))}
              </div>
            )}
          </header>
          <ArticleContent content={article.content_markdown || ''} />
          {(article.related_articles?.length ?? 0) > 0 && (
            <section style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${theme.border}` }}>
              <Title level={4} style={{ color: theme.textPrimary, marginBottom: 16 }}>
                <BookOutlined style={{ marginRight: 8 }} />
                Related articles
              </Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {article.related_articles?.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => navigate(`/app/learn/article/${a.slug}`)}
                    style={{
                      textAlign: 'left',
                      padding: 12,
                      borderRadius: 8,
                      border: `1px solid ${theme.border}`,
                      background: theme.hoverBg,
                      color: theme.textPrimary,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    <span style={{ display: 'block', fontWeight: 600 }}>{a.title}</span>
                    {a.summary && (
                      <span style={{ fontSize: 12, color: theme.textSecondary, display: 'block', marginTop: 4 }}>
                        {a.summary.slice(0, 100)}{a.summary.length > 100 ? '…' : ''}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: theme.textMuted, marginTop: 4, display: 'block' }}>
                      {a.category_name}{a.reading_time_minutes != null ? ` · ${a.reading_time_minutes} min` : ''}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
          {relatedStrategies.length > 0 && (
            <section style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${theme.border}` }}>
              <Title level={4} style={{ color: theme.textPrimary, marginBottom: 16 }}>
                <BulbOutlined style={{ marginRight: 8 }} />
                Related strategies
              </Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {relatedStrategies.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => navigate(`/app/strategies`)}
                    style={{
                      textAlign: 'left',
                      padding: 12,
                      borderRadius: 8,
                      border: `1px solid ${theme.border}`,
                      background: theme.hoverBg,
                      color: theme.textPrimary,
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </section>
          )}
        </article>
        <aside>
          <ArticleTOC items={tocItems} activeId={activeTocId} />
        </aside>
      </div>
    </div>
  )
}
