import { useQuery } from '@tanstack/react-query'
import { Row, Col, Card, Typography, Tag, Empty } from 'antd'
import { BulbOutlined, RightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { strategyLibraryService } from '../services/strategyLibrary'
import { DOMAIN_COLORS } from '../components/control-room/constants'
import { useTheme } from '../hooks/useTheme'

const { Title, Text } = Typography

const DOMAINS = [
  'health', 'wealth', 'skills', 'network', 'career',
  'relationships', 'experiences', 'identity',
]

const EVIDENCE_COLORS: Record<string, string> = {
  high: '#22c55e',
  moderate: '#3b82f6',
  emerging: '#f59e0b',
  reflective: '#8b5cf6',
}

export function StrategyLibraryPage() {
  const navigate = useNavigate()
  const theme = useTheme()

  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ['strategy-library', 'list'],
    queryFn: () => strategyLibraryService.list(),
  })

  const byDomain = strategies.reduce<Record<string, typeof strategies>>((acc, s) => {
    if (!acc[s.domain_key]) acc[s.domain_key] = []
    acc[s.domain_key].push(s)
    return acc
  }, {})

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <BulbOutlined style={{ fontSize: 28, color: theme.accent }} />
        <div>
          <Title level={3} style={{ margin: 0, color: theme.textPrimary }}>
            Strategy Library
          </Title>
          <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
            Evidence-based strategies to guide each life domain
          </Text>
        </div>
      </div>

      <Card
        style={{
          marginBottom: 24,
          background: theme.contentCardBg,
          border: `1px solid ${theme.contentCardBorder}`,
          boxShadow: theme.shadow,
        }}
      >
        <Title level={5} style={{ color: theme.textSecondary, marginBottom: 16 }}>
          Browse by Domain
        </Title>
        <Row gutter={[12, 12]}>
          {DOMAINS.map((domain) => {
            const count = byDomain[domain]?.length ?? 0
            const color = DOMAIN_COLORS[domain] || theme.accent
            return (
              <Col xs={12} sm={8} md={6} key={domain}>
                <Card
                  size="small"
                  hoverable
                  onClick={() => navigate(`/app/strategies/${domain}`)}
                  style={{
                    borderLeft: `4px solid ${color}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ textTransform: 'capitalize', fontWeight: 600, color: theme.textPrimary }}>
                    {domain}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {count} strategies
                  </Text>
                </Card>
              </Col>
            )
          })}
        </Row>
      </Card>

      <Title level={5} style={{ color: theme.textSecondary, marginBottom: 16 }}>
        All Strategies
      </Title>
      {isLoading ? (
        <Card loading />
      ) : strategies.length === 0 ? (
        <Empty description="No strategies in library. Run seed_strategy_library.py to populate." />
      ) : (
        <Row gutter={[16, 16]}>
          {strategies.slice(0, 24).map((s) => (
            <Col xs={24} md={12} lg={8} key={s.id}>
              <Card
                size="small"
                hoverable
                onClick={() => navigate(`/app/strategies/${s.domain_key}?strategy=${s.id}`)}
                style={{
                  border: `1px solid ${theme.contentCardBorder}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: DOMAIN_COLORS[s.domain_key] || theme.accent,
                      marginRight: 8,
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  />
                  <span style={{ fontWeight: 600, color: theme.textPrimary, flex: 1 }}>{s.name}</span>
                  <RightOutlined style={{ color: theme.textMuted, fontSize: 12 }} />
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                  <Tag color={EVIDENCE_COLORS[s.evidence_level] || 'default'} style={{ fontSize: 10 }}>
                    {s.evidence_level}
                  </Tag>
                  <Tag style={{ fontSize: 10 }}>{s.impact_level} impact</Tag>
                  <Tag style={{ fontSize: 10 }}>{s.difficulty_level}</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                  {s.category} • {s.domain_key}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
