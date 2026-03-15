/**
 * Life Work Engine dashboard: missions summary, leverage radar, achievements, opportunities, energy insights.
 */
import { useQuery } from '@tanstack/react-query'
import { Card, Typography, Button, Progress, Tag } from 'antd'
import { TrophyOutlined, AimOutlined, FolderOutlined, ThunderboltOutlined, BulbOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { careerService } from '../../services/career'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../../components/control-room/constants'

const { Title, Text } = Typography

const LEVERAGE_LABELS: Record<string, string> = {
  skills: 'Skills',
  reputation: 'Reputation',
  network: 'Network',
  assets_projects: 'Assets / Projects',
}

export function CareerPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['career', 'dashboard'],
    queryFn: () => careerService.getDashboard(),
  })

  if (isLoading || !dashboard) {
    return <div style={{ padding: 24, color: theme.textMuted }}>Loading Life Work Engine...</div>
  }

  const { missions, achievements_recent, opportunities_by_status, leverage, weakest_leverage_area, recommended_leverage_action, energy_insights } = dashboard
  const activeMissions = missions.filter((m) => m.status === 'active')

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            Life Work Engine
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Missions, leverage, achievements, and opportunities
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<AimOutlined />} onClick={() => navigate('/app/career/missions')} style={{ borderRadius: 10 }}>
            Missions
          </Button>
          <Button icon={<FolderOutlined />} onClick={() => navigate('/app/career/opportunities')} style={{ borderRadius: 10 }}>
            Opportunities
          </Button>
          <Button icon={<TrophyOutlined />} onClick={() => navigate('/app/career/achievements')} style={{ borderRadius: 10 }}>
            Achievements
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        <div>
          {/* Mission map summary */}
          <Card
            title={<span><AimOutlined style={{ marginRight: 8 }} />Mission Map</span>}
            style={{ marginBottom: 24, borderRadius: 16, border: `1px solid ${theme.contentCardBorder}` }}
            extra={<Button type="primary" size="small" onClick={() => navigate('/app/career/missions')}>View all</Button>}
          >
            {activeMissions.length === 0 ? (
              <>
                <Text type="secondary">No active missions. Define what matters and add a mission.</Text>
                <div style={{ marginTop: 12 }}>
                  <Button type="primary" onClick={() => navigate('/app/career/missions')}>Create mission</Button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activeMissions.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      border: `1px solid ${theme.contentCardBorder}`,
                      background: theme.hoverBg,
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate('/app/career/missions')}
                  >
                    <Text strong style={{ fontSize: 15 }}>{m.title}</Text>
                    {m.phase && <Tag color={DOMAIN_COLORS.career} style={{ marginLeft: 8 }}>{m.phase}</Tag>}
                    <div style={{ marginTop: 6, fontSize: 12, color: theme.textMuted }}>
                      {m.milestones.filter((x) => x.status === 'completed').length} / {m.milestones.length} milestones
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent achievements */}
          <Card
            title={<span><TrophyOutlined style={{ marginRight: 8 }} />Recent achievements</span>}
            style={{ marginBottom: 24, borderRadius: 16, border: `1px solid ${theme.contentCardBorder}` }}
            extra={<Button type="link" size="small" onClick={() => navigate('/app/career/achievements')}>View all</Button>}
          >
            {achievements_recent.length === 0 ? (
              <Text type="secondary">Log meaningful wins: shipped product, landed client, hard project.</Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {achievements_recent.slice(0, 5).map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 13 }}>{a.title}</Text>
                    <Tag>{a.category}</Tag>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          {/* Career leverage radar (as bars) */}
          <Card
            title={<span><BulbOutlined style={{ marginRight: 8 }} />Career leverage</span>}
            style={{ marginBottom: 24, borderRadius: 16, border: `1px solid ${theme.contentCardBorder}`, position: 'sticky', top: 24 }}
          >
            {leverage.length === 0 ? (
              <Text type="secondary">Rate your levers to see gaps.</Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {leverage.map((l) => (
                  <div key={l.area}>
                    <Text style={{ fontSize: 12 }}>{LEVERAGE_LABELS[l.area] || l.area}</Text>
                    <Progress percent={Math.round(l.score * 10)} size="small" strokeColor={DOMAIN_COLORS.career} />
                  </div>
                ))}
                {weakest_leverage_area && (
                  <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: theme.hoverBg }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Weakest: {LEVERAGE_LABELS[weakest_leverage_area]}</Text>
                    {recommended_leverage_action && (
                      <div style={{ fontSize: 12, marginTop: 4 }}>{recommended_leverage_action}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Opportunities count */}
          <Card
            title="Opportunities"
            style={{ marginBottom: 24, borderRadius: 16, border: `1px solid ${theme.contentCardBorder}` }}
            extra={<Button type="link" size="small" onClick={() => navigate('/app/career/opportunities')}>Pipeline</Button>}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(opportunities_by_status).map(([s, c]) => (
                <Tag key={s}>{s}: {c}</Tag>
              ))}
              {Object.keys(opportunities_by_status).length === 0 && (
                <Text type="secondary">No opportunities yet.</Text>
              )}
            </div>
          </Card>

          {/* Work-energy insights */}
          {energy_insights.length > 0 && (
            <Card
              title={<span><ThunderboltOutlined style={{ marginRight: 8 }} />Work–energy</span>}
              style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder}` }}
            >
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: theme.textSecondary }}>
                {energy_insights.map((insight, i) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
