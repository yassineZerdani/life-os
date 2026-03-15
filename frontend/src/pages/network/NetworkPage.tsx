/**
 * Social Capital Engine — dashboard: score, dormant ties, opportunities, graph preview.
 */
import { useQuery } from '@tanstack/react-query'
import { Card, Typography, Button, Progress } from 'antd'
import { ApartmentOutlined, TeamOutlined, AimOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { networkService } from '../../services/network'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../../components/control-room/constants'
import { DormantTiesPanel, OpportunityNetworkPanel, NetworkGraphView } from '../../components/network'

const { Title, Text } = Typography

export function NetworkPage() {
  const theme = useTheme()
  const navigate = useNavigate()

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['network', 'dashboard'],
    queryFn: () => networkService.getDashboard(),
  })

  const { data: graph } = useQuery({
    queryKey: ['network', 'graph'],
    queryFn: () => networkService.getGraph(),
    enabled: !!dashboard && dashboard.contacts_count > 0,
  })

  const { data: opportunities } = useQuery({
    queryKey: ['network', 'opportunities'],
    queryFn: () => networkService.listOpportunities('open'),
    enabled: !!dashboard,
  })

  if (isLoading || !dashboard) {
    return (
      <div style={{ padding: 24, color: theme.textMuted }}>
        Loading social capital…
      </div>
    )
  }

  const {
    contacts_count,
    dormant_count,
    open_opportunities_count,
    social_capital_score,
    insights,
    dormant_ties,
  } = dashboard

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            Social capital
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Your relationship network, dormant ties, and opportunity map
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            icon={<ApartmentOutlined />}
            onClick={() => navigate('/app/network/graph')}
            style={{ borderRadius: 10 }}
          >
            Graph
          </Button>
          <Button
            icon={<UserOutlined />}
            onClick={() => navigate('/app/network/contacts')}
            style={{ borderRadius: 10 }}
          >
            Contacts
          </Button>
          <Button
            icon={<AimOutlined />}
            onClick={() => navigate('/app/network/opportunities')}
            style={{ borderRadius: 10 }}
          >
            Opportunities
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <Card size="small" style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Contacts</Text>
              <div style={{ fontSize: 28, fontWeight: 700, color: DOMAIN_COLORS.network }}>{contacts_count}</div>
            </Card>
            <Card size="small" style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Dormant ties</Text>
              <div style={{ fontSize: 28, fontWeight: 700, color: dormant_count > 0 ? '#f59e0b' : theme.textSecondary }}>
                {dormant_count}
              </div>
            </Card>
            <Card size="small" style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Open opportunities</Text>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{open_opportunities_count}</div>
            </Card>
          </div>

          {social_capital_score != null && (
            <Card
              size="small"
              style={{
                marginBottom: 24,
                borderRadius: 16,
                border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
                background: theme.contentCardBg ?? undefined,
              }}
            >
              <Text strong style={{ fontSize: 13 }}>Social capital score</Text>
              <Progress
                percent={Math.round(social_capital_score)}
                strokeColor={DOMAIN_COLORS.network}
                style={{ marginTop: 8 }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Trust, warmth, recency, and opportunity potential
              </Text>
            </Card>
          )}

          {graph && graph.nodes.length > 0 && (
            <Card
              title={<span style={{ fontWeight: 600 }}>Network graph</span>}
              extra={<Button type="link" size="small" onClick={() => navigate('/app/network/graph')}>Full graph</Button>}
              style={{
                marginBottom: 24,
                borderRadius: 16,
                border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
                background: theme.contentCardBg ?? undefined,
              }}
            >
              <NetworkGraphView
                nodes={graph.nodes}
                edges={graph.edges}
                width={400}
                height={340}
                onNodeClick={(id) => {
                  if (id !== 'user' && !id.startsWith('opp-')) navigate(`/app/network/contacts?highlight=${id}`)
                }}
              />
            </Card>
          )}

          {insights.length > 0 && (
            <Card
              size="small"
              style={{
                borderRadius: 16,
                border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
                background: theme.contentCardBg ?? undefined,
              }}
            >
              <Text strong style={{ fontSize: 13 }}>Insights</Text>
              <ul style={{ margin: '8px 0 0', paddingLeft: 20, color: theme.textSecondary, fontSize: 13 }}>
                {insights.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div style={{ position: 'sticky', top: 24 }}>
          <DormantTiesPanel
            dormantTies={dormant_ties}
            onViewAll={() => navigate('/app/network/graph')}
            onReachOut={(id) => navigate(`/app/network/contacts?contact=${id}`)}
          />
          <div style={{ marginTop: 16 }}>
            <OpportunityNetworkPanel
              opportunities={opportunities ?? []}
              onAdd={() => navigate('/app/network/opportunities')}
              onOpen={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
