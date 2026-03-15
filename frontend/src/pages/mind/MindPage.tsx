import { useQuery } from '@tanstack/react-query'
import { Typography, Button, Row, Col } from 'antd'
import { CloudOutlined, SyncOutlined, SafetyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { mindEngineService } from '../../services/mindEngine'
import { useTheme } from '../../hooks/useTheme'
import { EmotionalWeatherChart, TriggerLoopMap, RegulationToolkitCard } from '../../components/mind'

const { Title, Text } = Typography

const MIND_ACCENT = '#64748b'

export function MindPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['mind-engine', 'dashboard'],
    queryFn: () => mindEngineService.getDashboard({ weather_days: 14 }),
  })

  const { data: regulationUses = [] } = useQuery({
    queryKey: ['mind-engine', 'regulation'],
    queryFn: () => mindEngineService.listRegulationUses({ days: 30, limit: 10 }),
  })

  const { data: loops = [] } = useQuery({
    queryKey: ['mind-engine', 'loops'],
    queryFn: () => mindEngineService.listLoops(),
  })

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>Mind Engine</Title>
          <Text type="secondary" style={{ fontSize: 14 }}>Emotional weather, triggers, thought patterns, and regulation</Text>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button icon={<CloudOutlined />} onClick={() => navigate('/app/mind/emotions')} style={{ borderRadius: 10 }}>Emotions</Button>
          <Button icon={<SyncOutlined />} onClick={() => navigate('/app/mind/loops')} style={{ borderRadius: 10 }}>Loops</Button>
          <Button icon={<SafetyOutlined />} onClick={() => navigate('/app/mind/regulation')} style={{ borderRadius: 10 }}>Regulation</Button>
        </div>
      </div>

      {dashboard?.trend_insights && dashboard.trend_insights.length > 0 && (
        <div style={{ marginBottom: 24, padding: 16, borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`, borderLeftWidth: 4, borderLeftColor: MIND_ACCENT }}>
          <Text strong style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>Pattern insights</Text>
          <ul style={{ margin: 0, paddingLeft: 20, color: theme.textSecondary, fontSize: 13, lineHeight: 1.6 }}>
            {dashboard.trend_insights.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <EmotionalWeatherChart data={dashboard?.emotional_weather ?? []} loading={isLoading} />
          <div style={{ marginTop: 24 }}>
            <TriggerLoopMap triggers={dashboard?.recent_triggers ?? []} loops={loops} loading={isLoading} />
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`, minWidth: 80, textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 11 }}>Emotions</Text>
              <div style={{ fontSize: 20, fontWeight: 700, color: MIND_ACCENT }}>{dashboard?.emotions_count ?? 0}</div>
            </div>
            <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`, minWidth: 80, textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 11 }}>Triggers</Text>
              <div style={{ fontSize: 20, fontWeight: 700, color: MIND_ACCENT }}>{dashboard?.triggers_count ?? 0}</div>
            </div>
            <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`, minWidth: 80, textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 11 }}>Loops</Text>
              <div style={{ fontSize: 20, fontWeight: 700, color: MIND_ACCENT }}>{dashboard?.loops_count ?? 0}</div>
            </div>
            <div style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`, minWidth: 80, textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 11 }}>Regulation</Text>
              <div style={{ fontSize: 20, fontWeight: 700, color: MIND_ACCENT }}>{dashboard?.regulation_uses_count ?? 0}</div>
            </div>
          </div>
          <RegulationToolkitCard uses={regulationUses} topTools={dashboard?.top_tools ?? []} loading={isLoading} />
        </Col>
      </Row>
    </div>
  )
}
