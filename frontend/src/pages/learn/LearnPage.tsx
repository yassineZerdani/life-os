import { useQuery } from '@tanstack/react-query'
import { Row, Col, Card, Typography, Input, Spin } from 'antd'
import { BookOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { learnService } from '../../services/learn'
import { LEARN_CATEGORY_COLORS } from '../../components/control-room/constants'
import '../../styles/learn.css'

const { Title, Text } = Typography

export function LearnPage() {
  const navigate = useNavigate()
  const theme = useTheme()
  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ['learn', 'categories'],
    queryFn: learnService.categories,
  })
  const { data: featured = [], isLoading: featLoading } = useQuery({
    queryKey: ['learn', 'articles', 'featured'],
    queryFn: () => learnService.articles({ featured: true }),
  })
  const { data: recent = [], isLoading: recentLoading } = useQuery({
    queryKey: ['learn', 'articles', 'recent'],
    queryFn: () => learnService.articles({ limit: 8 }),
  })

  const isLoading = catLoading || featLoading
  return (
    <div className="learn-container" style={{ paddingBottom: 48 }}>
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, color: theme.accent }}>
          <BookOutlined />
        </div>
        <Title level={1} style={{ margin: 0, color: theme.textPrimary, fontSize: 36 }}>
          Life Knowledge Library
        </Title>
        <Text style={{ fontSize: 18, color: theme.textSecondary, display: 'block', marginTop: 12 }}>
          Evidence-based strategies, psychology frameworks, health protocols, and productivity systems.
        </Text>
      </div>

      <div style={{ marginBottom: 32 }}>
        <Input
          placeholder="Search articles..."
          prefix={<SearchOutlined style={{ color: theme.textMuted }} />}
          size="large"
          allowClear
          onPressEnter={(e) => {
            const q = (e.target as HTMLInputElement).value?.trim()
            if (q) navigate(`/app/learn/search?q=${encodeURIComponent(q)}`)
          }}
          style={{
            maxWidth: 480,
            margin: '0 auto',
            display: 'block',
            borderRadius: theme.radius,
            borderColor: theme.border,
          }}
        />
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <Title level={4} style={{ color: theme.textSecondary, marginBottom: 16 }}>
                Featured
              </Title>
              <Row gutter={[16, 16]}>
                {featured.slice(0, 6).map((a) => (
                  <Col xs={24} sm={12} lg={8} key={a.id}>
                    <Card
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
                      <Text strong style={{ color: theme.textPrimary, fontSize: 16, display: 'block', marginBottom: 8 }}>
                        {a.title}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.5 }} ellipsis={{ rows: 2 }}>
                        {a.summary || a.subtitle}
                      </Text>
                      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: theme.textMuted }}>
                          {a.reading_time_minutes} min
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
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          <Title level={4} style={{ color: theme.textSecondary, marginBottom: 16 }}>
            Browse by category
          </Title>
          <Row gutter={[12, 12]} style={{ marginBottom: 40 }}>
            {categories.map((c) => {
              const color = LEARN_CATEGORY_COLORS[c.key] || theme.accent
              return (
                <Col xs={12} sm={8} md={6} key={c.id}>
                  <Card
                    className="learn-card"
                    hoverable
                    onClick={() => navigate(`/app/learn/category/${c.key}`)}
                    style={{
                      borderLeft: `4px solid ${color}`,
                      borderRadius: 12,
                      background: theme.contentCardBg,
                      border: `1px solid ${theme.border}`,
                    }}
                    styles={{ body: { padding: 16 } }}
                  >
                    <Text strong style={{ color: theme.textPrimary, display: 'block' }}>
                      {c.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{c.article_count} articles</Text>
                  </Card>
                </Col>
              )
            })}
          </Row>

          {!recentLoading && recent.length > 0 && (
            <div>
              <Title level={4} style={{ color: theme.textSecondary, marginBottom: 16 }}>
                Recently added
              </Title>
              <Row gutter={[16, 16]}>
                {recent.slice(0, 6).map((a) => (
                  <Col xs={24} sm={12} lg={8} key={a.id}>
                    <Card
                      className="learn-card"
                      hoverable
                      onClick={() => navigate(`/app/learn/article/${a.slug}`)}
                      style={{
                        border: `1px solid ${theme.border}`,
                        borderRadius: 12,
                        background: theme.contentCardBg,
                      }}
                      styles={{ body: { padding: 16 } }}
                    >
                      <Text strong style={{ color: theme.textPrimary, display: 'block', marginBottom: 4 }}>
                        {a.title}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{a.category_name} · {a.reading_time_minutes ?? '—'} min</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </>
      )}
    </div>
  )
}
