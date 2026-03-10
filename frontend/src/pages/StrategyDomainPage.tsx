import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router-dom'
import { Card, List, Tag, Button, Typography, Empty, Progress } from 'antd'
import { PlusOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { strategyLibraryService } from '../services/strategyLibrary'
import { DOMAIN_COLORS } from '../components/control-room/constants'
import { useTheme } from '../hooks/useTheme'

const { Title, Text } = Typography

const EVIDENCE_COLORS: Record<string, string> = {
  high: '#22c55e',
  moderate: '#3b82f6',
  emerging: '#f59e0b',
  reflective: '#8b5cf6',
}

export function StrategyDomainPage() {
  const { domainKey } = useParams<{ domainKey: string }>()
  const [searchParams] = useSearchParams()
  const strategyId = searchParams.get('strategy')
  const queryClient = useQueryClient()
  const theme = useTheme()

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategy-library', 'domain', domainKey],
    queryFn: () => strategyLibraryService.listByDomain(domainKey!),
    enabled: !!domainKey,
  })

  const { data: strategyDetail } = useQuery({
    queryKey: ['strategy-library', 'detail', strategyId],
    queryFn: () => strategyLibraryService.getDetail(strategyId!),
    enabled: !!strategyId,
  })

  const { data: activeProtocols = [] } = useQuery({
    queryKey: ['strategy-library', 'active'],
    queryFn: strategyLibraryService.activeProtocols,
  })

  const { data: recommendations = [] } = useQuery({
    queryKey: ['strategy-library', 'recommendations', domainKey],
    queryFn: () => strategyLibraryService.recommendations(5, domainKey ?? undefined),
  })

  const activateMutation = useMutation({
    mutationFn: strategyLibraryService.activateProtocol,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategy-library', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['control-room', 'full'] })
    },
  })

  const activeProtocolIds = new Set(activeProtocols.map((p) => p.protocol_id))
  const byCategory = strategies.reduce<Record<string, typeof strategies>>((acc, s) => {
    const c = s.category || 'other'
    if (!acc[c]) acc[c] = []
    acc[c].push(s)
    return acc
  }, {})

  const color = domainKey ? DOMAIN_COLORS[domainKey] || theme.accent : theme.accent

  if (!domainKey) return null

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: color, marginRight: 8 }} />
        <Title level={3} style={{ margin: 0, display: 'inline', textTransform: 'capitalize' }}>
          {domainKey} Strategies
        </Title>
      </div>

      {recommendations.length > 0 && (
        <Card title="Recommended for You" style={{ marginBottom: 24, borderLeft: `4px solid ${color}` }}>
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
                    <div style={{ fontWeight: 600 }}>{r.strategy_name}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{r.why_recommended}</Text>
                    <div style={{ marginTop: 4 }}>
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

      {activeProtocols.filter((p) => p.domain_key === domainKey).length > 0 && (
        <Card title="Your Active Protocols" style={{ marginBottom: 24 }}>
          {activeProtocols
            .filter((p) => p.domain_key === domainKey)
            .map((p) => (
              <div key={p.id} style={{ padding: 12, background: theme.hoverBg, borderRadius: 8, marginBottom: 8, borderLeft: `4px solid ${color}` }}>
                <div style={{ fontWeight: 600 }}>{p.strategy_name}</div>
                <Progress percent={Math.round(p.adherence_score)} size="small" strokeColor={color} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {p.steps.length} steps • Adherence: {Math.round(p.adherence_score)}%
                </Text>
              </div>
            ))}
        </Card>
      )}

      <Card title="Foundation Strategies">
        {byCategory.foundational?.length ? (
          <List
            dataSource={byCategory.foundational}
            renderItem={(s) => (
              <List.Item>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  {s.description && <Text type="secondary" style={{ fontSize: 12 }}>{s.description}</Text>}
                  <div style={{ marginTop: 8 }}>
                    <Tag color={EVIDENCE_COLORS[s.evidence_level]}>{s.evidence_level}</Tag>
                    <Tag>{s.impact_level}</Tag>
                    <Tag>{s.difficulty_level}</Tag>
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No foundational strategies" />
        )}
      </Card>

      {byCategory.targeted?.length > 0 && (
        <Card title="Targeted Strategies" style={{ marginTop: 16 }}>
          <List
            dataSource={byCategory.targeted}
            renderItem={(s) => (
              <List.Item>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  {s.description && <Text type="secondary" style={{ fontSize: 12 }}>{s.description}</Text>}
                  <Tag color={EVIDENCE_COLORS[s.evidence_level]}>{s.evidence_level}</Tag>
                </div>
              </List.Item>
            )}
          />
        </Card>
      )}

      {strategyDetail && (
        <Card
          title={strategyDetail.name}
          extra={
            strategyDetail.protocols?.[0] && !activeProtocolIds.has(strategyDetail.protocols[0].id) && (
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => activateMutation.mutate(strategyDetail.protocols![0].id)}
                loading={activateMutation.isPending}
              >
                Activate Protocol
              </Button>
            )
          }
          style={{ marginTop: 24 }}
        >
          <p>{strategyDetail.description}</p>
          {strategyDetail.when_to_use && <p><strong>When to use:</strong> {strategyDetail.when_to_use}</p>}
          {strategyDetail.protocols?.map((p) => (
            <div key={p.id} style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <Text type="secondary">{p.cadence} • {p.duration_days} days</Text>
              <List
                size="small"
                dataSource={p.steps}
                renderItem={(st) => (
                  <List.Item>
                    <CheckCircleOutlined style={{ color: theme.textMuted, marginRight: 8 }} />
                    {st.title} {st.frequency && `(${st.frequency})`}
                  </List.Item>
                )}
              />
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
