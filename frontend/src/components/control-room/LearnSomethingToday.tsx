import { Card, Typography } from 'antd'
import { BookOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

interface RecommendedArticle {
  id: string
  slug: string
  title: string
  summary: string | null
  reading_time_minutes: number | null
  category_name: string
}

interface LearnSomethingTodayProps {
  article: RecommendedArticle | null
  loading?: boolean
}

export function LearnSomethingToday({ article, loading }: LearnSomethingTodayProps) {
  const navigate = useNavigate()
  const theme = useTheme()
  if (loading || !article) return null
  return (
    <Card
      size="small"
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOutlined style={{ color: theme.accent }} />
          Learn something today
        </span>
      }
      hoverable
      onClick={() => navigate(`/app/learn/article/${article.slug}`)}
      style={{
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        background: theme.contentCardBg,
        cursor: 'pointer',
      }}
      styles={{ body: { padding: 16 } }}
    >
      <Text strong style={{ color: theme.textPrimary, display: 'block', marginBottom: 6 }}>
        {article.title}
      </Text>
      {article.summary && (
        <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.4 }} ellipsis={{ rows: 2 }}>
          {article.summary}
        </Text>
      )}
      <div style={{ marginTop: 10, fontSize: 12, color: theme.textMuted }}>
        {article.category_name}
        {article.reading_time_minutes != null && ` · ${article.reading_time_minutes} min`}
      </div>
    </Card>
  )
}
