/**
 * Organ Health Dashboard — health score, nutrition, movement, sleep, signals, metrics.
 */
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, Spin, Typography, Tag, List, Progress, Row, Col } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { bodyIntelligenceService } from '../../services/bodyIntelligence'
import { useTheme } from '../../hooks/useTheme'

const { Title, Text } = Typography

function scoreColor(score: number) {
  if (score >= 75) return '#22c55e'
  if (score >= 50) return '#eab308'
  return '#ef4444'
}

export function OrganDashboardPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['body-intelligence', 'organ-dashboard', slug],
    queryFn: () => bodyIntelligenceService.getOrganDashboardBySlug(slug!),
    enabled: !!slug,
  })

  if (isLoading || !dashboard) {
    return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />
  }

  const { organ, health_score, tracked_metrics, risk_signals } = dashboard

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button
        type="button"
        onClick={() => navigate('/app/health/body-map')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
          padding: '8px 12px',
          border: 'none',
          borderRadius: theme.radius,
          background: theme.hoverBg,
          color: theme.textSecondary,
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        <ArrowLeftOutlined /> Back to Body Map
      </button>

      <Title level={2} style={{ marginBottom: 8 }}>
        {organ.name}
      </Title>
      {organ.system && (
        <Tag color="blue" style={{ marginBottom: 16 }}>{organ.system.name}</Tag>
      )}
      {organ.description && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          {organ.description}
        </Text>
      )}

      {health_score != null && (
        <Card title="Health score" style={{ marginBottom: 24 }}>
          <Progress
            type="circle"
            percent={Math.round(health_score.score)}
            strokeColor={scoreColor(health_score.score)}
            format={() => (
              <span style={{ color: scoreColor(health_score.score), fontWeight: 700 }}>
                {Math.round(health_score.score)}
              </span>
            )}
          />
          {health_score.factors && Object.keys(health_score.factors).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Factors: </Text>
              {Object.entries(health_score.factors)
                .filter(([k]) => !k.endsWith('_matched'))
                .map(([k, v]) => (
                  <Tag key={k}>{k}: {typeof v === 'number' ? Math.round(v) : String(v)}</Tag>
                ))}
            </div>
          )}
        </Card>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Nutrition needs" size="small">
            {organ.nutrition_requirements?.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {organ.nutrition_requirements.map((n) => (
                  <Tag key={n}>{n.replace(/_/g, ' ')}</Tag>
                ))}
              </div>
            ) : (
              <Text type="secondary">No specific nutrients defined.</Text>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Movement needs" size="small">
            {organ.movement_requirements?.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {organ.movement_requirements.map((m) => (
                  <Tag key={m}>{m.replace(/_/g, ' ')}</Tag>
                ))}
              </div>
            ) : (
              <Text type="secondary">No specific movement defined.</Text>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Sleep support" size="small">
            {organ.sleep_requirements?.length ? (
              <List
                size="small"
                dataSource={organ.sleep_requirements}
                renderItem={(s) => <List.Item>{s}</List.Item>}
              />
            ) : (
              <Text type="secondary">No specific sleep requirements.</Text>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Risk signals & symptoms" size="small">
            {risk_signals?.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">Signals: </Text>
                {risk_signals.map((r) => (
                  <Tag key={r} color="orange">{r}</Tag>
                ))}
              </div>
            )}
            {organ.signals?.length || organ.symptoms?.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(organ.signals || []).concat(organ.symptoms || []).map((s) => (
                  <Tag key={s}>{s.replace(/_/g, ' ')}</Tag>
                ))}
              </div>
            ) : (
              <Text type="secondary">None defined.</Text>
            )}
          </Card>
        </Col>
      </Row>

      {organ.functions?.length > 0 && (
        <Card title="Functions" size="small" style={{ marginTop: 16 }}>
          <List
            size="small"
            dataSource={organ.functions}
            renderItem={(f) => <List.Item>{f}</List.Item>}
          />
        </Card>
      )}

      {tracked_metrics?.length > 0 && (
        <Card title="Tracked metrics" size="small" style={{ marginTop: 16 }}>
          <List
            dataSource={tracked_metrics}
            renderItem={(m) => (
              <List.Item>
                <Text strong>{m.name}</Text>
                {m.unit && <Text type="secondary"> ({m.unit})</Text>}
                {m.latest_value != null && (
                  <Text style={{ marginLeft: 8 }}>Latest: {m.latest_value}</Text>
                )}
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  )
}
