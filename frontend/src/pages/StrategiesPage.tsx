import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Row, Col, Card, List, Button, Typography } from 'antd'
import { AimOutlined, PlusOutlined } from '@ant-design/icons'
import { strategiesService } from '../services/strategies'
import { DOMAIN_COLORS } from '../components/control-room/constants'

const { Title } = Typography

export function StrategiesPage() {
  const queryClient = useQueryClient()

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies', 'recommended'],
    queryFn: () => strategiesService.recommended(50),
  })

  const { data: active = [] } = useQuery({
    queryKey: ['strategies', 'active'],
    queryFn: strategiesService.active,
  })

  const activateMutation = useMutation({
    mutationFn: strategiesService.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['control-room', 'full'] })
    },
  })

  const activeIds = new Set(active.map((s) => s.strategy_id))
  const byDomain = strategies.reduce<Record<string, typeof strategies>>((acc, s) => {
    if (!acc[s.domain]) acc[s.domain] = []
    acc[s.domain].push(s)
    return acc
  }, {})

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <AimOutlined style={{ fontSize: 28, color: '#6366f1' }} />
        <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
          Life Strategies
        </Title>
      </div>

      {active.length > 0 && (
        <Card
          title="Your Active Strategies"
          style={{
            marginBottom: 24,
            background: '#fff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <List
            dataSource={active}
            renderItem={(s) => (
              <List.Item>
                <div>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{s.name}</span>
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      color: '#64748b',
                      textTransform: 'capitalize',
                    }}
                  >
                    {s.domain}
                  </span>
                </div>
                <span style={{ color: '#64748b' }}>Adherence: {Math.round(s.adherence_score)}%</span>
              </List.Item>
            )}
          />
        </Card>
      )}

      <Title level={5} style={{ color: '#64748b', marginBottom: 16 }}>
        Recommended by Domain
      </Title>
      <Row gutter={[16, 16]}>
        {Object.entries(byDomain).map(([domain, items]) => (
          <Col xs={24} md={12} lg={8} key={domain}>
            <Card
              title={
                <span style={{ textTransform: 'capitalize' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: DOMAIN_COLORS[domain] || '#64748b',
                      marginRight: 8,
                    }}
                  />
                  {domain}
                </span>
              }
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <List
                dataSource={items}
                renderItem={(s) => {
                  const isActive = activeIds.has(s.id)
                  return (
                    <List.Item
                      extra={
                        !isActive && (
                          <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => activateMutation.mutate(s.id)}
                            loading={activateMutation.isPending}
                          >
                            Activate
                          </Button>
                        )
                      }
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                          Impact: {s.estimated_impact}% • {s.difficulty}
                        </div>
                      </div>
                    </List.Item>
                  )
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
