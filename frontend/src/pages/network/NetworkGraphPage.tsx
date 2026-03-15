/**
 * Network graph — full view of contacts and opportunities.
 */
import { useQuery } from '@tanstack/react-query'
import { Card, Typography, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { networkService } from '../../services/network'
import { useTheme } from '../../hooks/useTheme'
import { NetworkGraphView } from '../../components/network'

const { Title, Text } = Typography

export function NetworkGraphPage() {
  const theme = useTheme()
  const navigate = useNavigate()

  const { data: graph, isLoading } = useQuery({
    queryKey: ['network', 'graph'],
    queryFn: () => networkService.getGraph(),
  })

  if (isLoading) {
    return (
      <div style={{ padding: 24, color: theme.textMuted }}>
        Loading graph…
      </div>
    )
  }

  if (!graph || graph.nodes.length === 0) {
    return (
      <div style={{ padding: '24px 32px 48px', maxWidth: 800, margin: '0 auto' }}>
        <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
          Network graph
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Add contacts to see your network. You appear in the center; contacts and opportunities radiate out.
        </Text>
        <Button type="primary" onClick={() => navigate('/app/network/contacts')} style={{ borderRadius: 10 }}>
          Add contacts
        </Button>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            Network graph
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Mentors, peers, collaborators, clients, and opportunities
          </Text>
        </div>
        <Button onClick={() => navigate('/app/network')}>Back to dashboard</Button>
      </div>
      <Card
        style={{
          borderRadius: 16,
          border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
          background: theme.contentCardBg ?? undefined,
          overflow: 'hidden',
        }}
      >
        <NetworkGraphView
          nodes={graph.nodes}
          edges={graph.edges}
          width={800}
          height={500}
          onNodeClick={(id) => {
            if (id !== 'user' && !id.startsWith('opp-')) navigate(`/app/network/contacts?highlight=${id}`)
            if (id.startsWith('opp-')) navigate('/app/network/opportunities')
          }}
        />
      </Card>
    </div>
  )
}
