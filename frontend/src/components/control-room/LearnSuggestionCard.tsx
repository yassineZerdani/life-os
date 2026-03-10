import { BookOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { ControlRoomCard } from './ControlRoomCard'

interface RecommendedArticle {
  id: string
  slug: string
  title: string
  summary: string | null
  reading_time_minutes: number | null
  category_name: string
}

interface LearnSuggestionCardProps {
  article: RecommendedArticle | null
  loading?: boolean
}

export function LearnSuggestionCard({ article, loading }: LearnSuggestionCardProps) {
  const theme = useTheme()
  const navigate = useNavigate()

  if (loading || !article) {
    return (
      <ControlRoomCard>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: theme.textPrimary,
            margin: 0,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <BookOutlined style={{ color: theme.accent }} />
          Learn Suggestion
        </h3>
        <div style={{ color: theme.textMuted, fontSize: 15 }}>No suggestion right now.</div>
      </ControlRoomCard>
    )
  }

  return (
    <ControlRoomCard
      style={{ cursor: 'pointer' }}
      gradient={false}
    >
      <div
        onClick={() => navigate(`/app/learn/article/${article.slug}`)}
        style={{ display: 'block' }}
      >
        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: theme.textPrimary,
            margin: 0,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <BookOutlined style={{ color: theme.accent }} />
          Learn Suggestion
        </h3>
        <div
          style={{
            fontWeight: 600,
            color: theme.textPrimary,
            fontSize: 15,
            marginBottom: 6,
            lineHeight: 1.4,
          }}
        >
          {article.title}
        </div>
        {article.summary && (
          <div
            style={{
              fontSize: 13,
              color: theme.textSecondary,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {article.summary}
          </div>
        )}
        <div style={{ marginTop: 10, fontSize: 12, color: theme.textMuted }}>
          {article.category_name}
          {article.reading_time_minutes != null && ` · ${article.reading_time_minutes} min`}
        </div>
      </div>
    </ControlRoomCard>
  )
}
