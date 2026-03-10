import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Input, Card, Typography, Spin } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'
import { learnService } from '../../services/learn'
import '../../styles/learn.css'

const { Title, Text } = Typography

export function LearnSearchPage() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const navigate = useNavigate()
  const theme = useTheme()
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['learn', 'search', q],
    queryFn: () => learnService.search(q, { limit: 30 }),
    enabled: q.length >= 1,
  })

  return (
    <div className="learn-container" style={{ paddingBottom: 48 }}>
      <Title level={3} style={{ color: theme.textPrimary, marginBottom: 24 }}>
        Search
      </Title>
      <Input
        placeholder="Search by title, tag, category, keywords..."
        prefix={<SearchOutlined style={{ color: theme.textMuted }} />}
        size="large"
        defaultValue={q}
        allowClear
        onPressEnter={(e) => {
          const v = (e.target as HTMLInputElement).value?.trim()
          navigate(v ? `/app/learn/search?q=${encodeURIComponent(v)}` : '/app/learn')
        }}
        style={{
          maxWidth: 560,
          marginBottom: 32,
          borderRadius: theme.radius,
          borderColor: theme.border,
        }}
      />
      {q && isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      )}
      {q && !isLoading && (
        <>
          <Text style={{ color: theme.textSecondary, marginBottom: 16, display: 'block' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} for “{q}”
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {results.map((a) => (
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
                <Text type="secondary" style={{ fontSize: 14 }} ellipsis={{ rows: 2 }}>
                  {a.summary || a.subtitle}
                </Text>
                <div style={{ marginTop: 12, fontSize: 12, color: theme.textMuted }}>
                  {a.category_name} · {a.reading_time_minutes ?? '—'} min
                  {a.difficulty_level && ` · ${a.difficulty_level}`}
                </div>
              </Card>
            ))}
          </div>
          {results.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: theme.textMuted }}>
              No articles match your search.
            </div>
          )}
        </>
      )}
      {!q && (
        <div style={{ color: theme.textMuted }}>
          Enter a search term and press Enter.
        </div>
      )}
    </div>
  )
}
