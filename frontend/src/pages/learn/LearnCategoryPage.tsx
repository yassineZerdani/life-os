import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'
import { learnService } from '../../services/learn'
import { LEARN_CATEGORY_COLORS } from '../../components/control-room/constants'
import '../../styles/learn.css'

const { Title, Text } = Typography

export function LearnCategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const { data: categories = [] } = useQuery({
    queryKey: ['learn', 'categories'],
    queryFn: learnService.categories,
  })
  const category = categories.find((c) => c.key === slug)
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['learn', 'articles', slug],
    queryFn: () => learnService.articles({ category_key: slug!, limit: 50 }),
    enabled: !!slug,
  })

  const color = slug ? (LEARN_CATEGORY_COLORS[slug] || theme.accent) : theme.accent
  return (
    <div className="learn-container" style={{ paddingBottom: 48 }}>
      <button
        type="button"
        onClick={() => navigate('/app/learn')}
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
        <ArrowLeftOutlined /> Back to Learn
      </button>
      {category && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ width: 48, height: 4, borderRadius: 2, background: color, marginBottom: 16 }} />
          <Title level={2} style={{ margin: 0, color: theme.textPrimary }}>
            {category.name}
          </Title>
          {category.description && (
            <Text style={{ color: theme.textSecondary, fontSize: 16, display: 'block', marginTop: 8 }}>
              {category.description}
            </Text>
          )}
        </div>
      )}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {articles.map((a) => (
            <Card
              key={a.id}
              className="learn-card"
              hoverable
              onClick={() => navigate(`/app/learn/article/${a.slug}`)}
              style={{
                border: `1px solid ${theme.border}`,
                borderRadius: 12,
                background: theme.contentCardBg,
              }}
              styles={{ body: { padding: 20 } }}
            >
              <Title level={5} style={{ margin: 0, color: theme.textPrimary, marginBottom: 8 }}>
                {a.title}
              </Title>
              <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.5 }} ellipsis={{ rows: 2 }}>
                {a.summary || a.subtitle}
              </Text>
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: theme.textMuted }}>
                  {a.reading_time_minutes ?? '—'} min
                </span>
                {a.difficulty_level && (
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: theme.accentLight,
                      color: theme.accent,
                      textTransform: 'capitalize',
                    }}
                  >
                    {a.difficulty_level}
                  </span>
                )}
                {a.evidence_level && (
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: theme.hoverBg,
                      color: theme.textSecondary,
                      textTransform: 'capitalize',
                    }}
                  >
                    {a.evidence_level} evidence
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      {!isLoading && articles.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: theme.textMuted }}>
          No articles in this category yet.
        </div>
      )}
    </div>
  )
}
