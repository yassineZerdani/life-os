import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, List, Progress, Button, Typography, Empty, Tag } from 'antd'
import { CheckOutlined, StopOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { strategyLibraryService } from '../services/strategyLibrary'
import { DOMAIN_COLORS } from '../components/control-room/constants'
import { useTheme } from '../hooks/useTheme'

const { Title, Text } = Typography

export function ActiveProtocolsPage() {
  const navigate = useNavigate()
  const theme = useTheme()
  const queryClient = useQueryClient()

  const { data: activeProtocols = [], isLoading } = useQuery({
    queryKey: ['strategy-library', 'active'],
    queryFn: strategyLibraryService.activeProtocols,
  })

  const { data: recommendations = [] } = useQuery({
    queryKey: ['strategy-library', 'recommendations'],
    queryFn: () => strategyLibraryService.recommendations(5),
  })

  const activateMutation = useMutation({
    mutationFn: strategyLibraryService.activateProtocol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-library', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['strategy-library', 'recommendations'] })
      queryClient.invalidateQueries({ queryKey: ['control-room', 'full'] })
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: strategyLibraryService.deactivateProtocol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-library', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['control-room', 'full'] })
    },
  })

  const activeProtocolIds = new Set(activeProtocols.map((p) => p.protocol_id))
  const topRecommendation = recommendations.find((r) => !activeProtocolIds.has(r.protocol_id))

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: theme.textPrimary }}>
          Active Protocols
        </Title>
        <Text style={{ color: theme.textSecondary }}>
          Track adherence and progress on your active strategies
        </Text>
      </div>

      {topRecommendation && (
        <Card
          title="Top Recommendation"
          style={{
            marginBottom: 24,
            borderLeft: `4px solid ${theme.accent}`,
            background: theme.hoverBg,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{topRecommendation.strategy_name}</div>
            <Text type="secondary">{topRecommendation.why_recommended}</Text>
          </div>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => activateMutation.mutate(topRecommendation.protocol_id)}
            loading={activateMutation.isPending}
          >
            Start This Protocol
          </Button>
        </Card>
      )}

      <Card title="Your Active Protocols">
        {isLoading ? (
          <Card loading />
        ) : activeProtocols.length === 0 ? (
          <Empty
            description="No active protocols. Browse the Strategy Library to start one."
            style={{ padding: 24 }}
          >
            <Button type="primary" onClick={() => navigate('/app/strategies')}>
              Browse Strategy Library
            </Button>
          </Empty>
        ) : (
          <List
            dataSource={activeProtocols}
            renderItem={(p) => {
              const color = DOMAIN_COLORS[p.domain_key] || theme.accent
              return (
                <List.Item
                  extra={
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<StopOutlined />}
                      onClick={() => deactivateMutation.mutate(p.id)}
                      loading={deactivateMutation.isPending}
                    >
                      Stop
                    </Button>
                  }
                >
                  <div
                    onClick={() => navigate(`/app/strategies/${p.domain_key}`)}
                    style={{
                      flex: 1,
                      padding: 16,
                      background: theme.hoverBg,
                      borderRadius: 8,
                      borderLeft: `4px solid ${color}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: theme.textPrimary }}>{p.strategy_name}</span>
                      <Tag style={{ textTransform: 'capitalize' }}>{p.domain_key}</Tag>
                    </div>
                    <Progress
                      percent={Math.round(p.adherence_score)}
                      size="small"
                      strokeColor={color}
                      style={{ marginBottom: 8 }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {p.steps.length} steps • {p.cadence}
                    </Text>
                    {p.steps.length > 0 && (
                      <div style={{ marginTop: 8, fontSize: 12, color: theme.textSecondary }}>
                        {p.steps.slice(0, 3).map((s) => s.title).join(' • ')}
                      </div>
                    )}
                  </div>
                </List.Item>
              )
            }}
          />
        )}
      </Card>
    </div>
  )
}
