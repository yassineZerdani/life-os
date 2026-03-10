import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Empty, Button, Progress, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { strategyLibraryService } from '../../services/strategyLibrary'
import type { ActiveStrategy } from '../../types/strategy'
import type { ActiveProtocolCard, StrategyRecommendationCard } from '../../types/controlRoom'
import { DOMAIN_COLORS } from './constants'
import { useTheme } from '../../hooks/useTheme'

interface ActiveStrategiesPanelProps {
  strategies: ActiveStrategy[]
  activeProtocols?: ActiveProtocolCard[]
  strategyRecommendations?: StrategyRecommendationCard[]
  loading?: boolean
}

export function ActiveStrategiesPanel({
  strategies,
  activeProtocols = [],
  strategyRecommendations = [],
  loading,
}: ActiveStrategiesPanelProps) {
  const navigate = useNavigate()
  const theme = useTheme()
  const queryClient = useQueryClient()
  const activateMutation = useMutation({
    mutationFn: strategyLibraryService.activateProtocol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['control-room', 'full'] })
      queryClient.invalidateQueries({ queryKey: ['strategy-library', 'active'] })
    },
  })
  const items = activeProtocols.length > 0 ? activeProtocols : strategies
  const isProtocols = activeProtocols.length > 0

  const topRec = strategyRecommendations.find(
    (r) => !activeProtocols.some((p) => p.protocol_id === r.protocol_id)
  )

  return (
    <Card
      title="Active Strategies"
      loading={loading}
      style={{
        background: theme.contentCardBg,
        border: `1px solid ${theme.contentCardBorder}`,
        boxShadow: theme.shadow,
      }}
      extra={
        <Button
          type="link"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => navigate('/app/strategies')}
        >
          Add
        </Button>
      }
    >
      {topRec && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: theme.hoverBg,
            borderRadius: 8,
            borderLeft: `4px solid ${theme.accent}`,
          }}
        >
          <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 4 }}>Top recommendation</div>
          <div style={{ fontWeight: 600, color: theme.textPrimary }}>{topRec.strategy_name}</div>
          <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 8 }}>{topRec.why_recommended}</div>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => topRec && activateMutation.mutate(topRec.protocol_id)}
            loading={activateMutation.isPending}
          >
            Start
          </Button>
        </div>
      )}

      {items.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No active strategies. Browse the Strategy Library to start one."
          style={{ color: theme.textSecondary }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((s) => {
            const domain = isProtocols ? (s as ActiveProtocolCard).domain_key : (s as ActiveStrategy).domain
            const name = isProtocols ? (s as ActiveProtocolCard).strategy_name : (s as ActiveStrategy).name
            const color = DOMAIN_COLORS[domain] || theme.accent
            return (
              <div
                key={s.id}
                onClick={() => navigate(isProtocols ? `/app/strategies/${domain}` : `/app/${domain}`)}
                style={{
                  padding: 14,
                  background: theme.hoverBg,
                  borderRadius: 8,
                  borderLeft: `4px solid ${color}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: theme.textPrimary, fontSize: 14 }}>{name}</span>
                  <Tag style={{ fontSize: 10, textTransform: 'capitalize' }}>{domain}</Tag>
                </div>
                <Progress
                  percent={Math.round(s.adherence_score)}
                  size="small"
                  strokeColor={color}
                  showInfo={false}
                />
                <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 4 }}>
                  Adherence: {Math.round(s.adherence_score)}%
                </div>
                {s.steps.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 11, color: theme.textSecondary }}>
                    {s.steps.slice(0, 2).map((st) => st.title).join(' • ')}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
