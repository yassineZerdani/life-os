import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, List, Empty, Button, Progress, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { strategyLibraryService } from '../../services/strategyLibrary'
import { DOMAIN_COLORS } from '../control-room/constants'
import { useTheme } from '../../hooks/useTheme'

interface DomainStrategySectionProps {
  domainSlug: string
}

const EVIDENCE_COLORS: Record<string, string> = {
  high: '#22c55e',
  moderate: '#3b82f6',
  emerging: '#f59e0b',
  reflective: '#8b5cf6',
}

export function DomainStrategySection({ domainSlug }: DomainStrategySectionProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const theme = useTheme()

  const { data: activeProtocols = [] } = useQuery({
    queryKey: ['strategy-library', 'active'],
    queryFn: strategyLibraryService.activeProtocols,
  })

  const { data: recommendations = [] } = useQuery({
    queryKey: ['strategy-library', 'recommendations', domainSlug],
    queryFn: () => strategyLibraryService.recommendations(10, domainSlug),
  })

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategy-library', 'domain', domainSlug],
    queryFn: () => strategyLibraryService.listByDomain(domainSlug),
  })

  const activateMutation = useMutation({
    mutationFn: strategyLibraryService.activateProtocol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-library', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['control-room', 'full'] })
    },
  })

  const activeForDomain = activeProtocols.filter((p) => p.domain_key === domainSlug)
  const activeProtocolIds = new Set(activeForDomain.map((p) => p.protocol_id))

  const color = DOMAIN_COLORS[domainSlug] || theme.accent

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {activeForDomain.length > 0 && (
        <Card
          title="Active Protocols"
          style={{
            background: theme.contentCardBg,
            border: `1px solid ${theme.contentCardBorder}`,
            boxShadow: theme.shadow,
          }}
        >
          {activeForDomain.map((p) => (
            <div key={p.id} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, color: theme.textPrimary, marginBottom: 8 }}>{p.strategy_name}</div>
              <Progress
                percent={Math.round(p.adherence_score)}
                strokeColor={color}
                size="small"
                style={{ marginBottom: 8 }}
              />
              <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 12 }}>
                Adherence: {Math.round(p.adherence_score)}%
              </div>
              <List
                size="small"
                dataSource={p.steps}
                renderItem={(st) => (
                  <List.Item>
                    <span style={{ color: theme.textPrimary }}>{st.title}</span>
                    {st.frequency && (
                      <span style={{ fontSize: 11, color: theme.textMuted }}> — {st.frequency}</span>
                    )}
                  </List.Item>
                )}
              />
            </div>
          ))}
        </Card>
      )}

      {recommendations.length > 0 && (
        <Card
          title="Recommended for You"
          style={{
            background: theme.contentCardBg,
            border: `1px solid ${theme.contentCardBorder}`,
            boxShadow: theme.shadow,
          }}
        >
          <List
            size="small"
            dataSource={recommendations}
            renderItem={(r) => {
              const isActive = activeProtocolIds.has(r.protocol_id)
              return (
                <List.Item
                  extra={
                    !isActive && (
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => activateMutation.mutate(r.protocol_id)}
                        loading={activateMutation.isPending}
                      >
                        Start
                      </Button>
                    )
                  }
                >
                  <div>
                    <div style={{ fontWeight: 600, color: theme.textPrimary }}>{r.strategy_name}</div>
                    <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>{r.why_recommended}</div>
                    <div style={{ marginTop: 8 }}>
                      <Tag color={EVIDENCE_COLORS[r.evidence_level]} style={{ fontSize: 10 }}>{r.evidence_level}</Tag>
                      <Tag style={{ fontSize: 10 }}>{r.estimated_benefit} benefit</Tag>
                    </div>
                  </div>
                </List.Item>
              )
            }}
          />
        </Card>
      )}

      <Card
        title="Strategy Library"
        style={{
          background: theme.contentCardBg,
          border: `1px solid ${theme.contentCardBorder}`,
          boxShadow: theme.shadow,
        }}
        extra={
          <Button type="link" size="small" onClick={() => navigate(`/app/strategies/${domainSlug}`)}>
            View all
          </Button>
        }
      >
        {strategies.length === 0 ? (
          <Empty description="No strategies for this domain yet" style={{ color: theme.textSecondary }} />
        ) : (
          <List
            dataSource={strategies.slice(0, 5)}
            renderItem={(s) => (
              <List.Item
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/app/strategies/${domainSlug}?strategy=${s.id}`)}
              >
                <div>
                  <div style={{ fontWeight: 600, color: theme.textPrimary }}>{s.name}</div>
                  {s.description && (
                    <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>{s.description}</div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <Tag color={EVIDENCE_COLORS[s.evidence_level]} style={{ fontSize: 10 }}>{s.evidence_level}</Tag>
                    <Tag style={{ fontSize: 10 }}>{s.impact_level}</Tag>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}
