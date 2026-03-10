import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Spin, Empty, Typography } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { recommendationsService } from '../services/recommendations'

const DOMAIN_COLORS: Record<string, string> = {
  health: '#22c55e',
  wealth: '#eab308',
  skills: '#6366f1',
  network: '#8b5cf6',
  career: '#f97316',
  relationships: '#ec4899',
  experiences: '#06b6d4',
  identity: '#64748b',
}

export function RecommendationsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['recommendations', 'full'],
    queryFn: async () => {
      const res = await recommendationsService.list(10)
      return res.recommendations
    },
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => recommendationsService.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const recommendations = data ?? []

  return (
    <div>
      <h1 style={{ marginBottom: 8, fontSize: 28 }}>Life Recommendations</h1>
      <p style={{ marginBottom: 24, color: '#64748b' }}>
        Actions ranked by impact to improve your life balance and domain scores. Mark as completed
        to earn XP.
      </p>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : recommendations.length === 0 ? (
        <Card>
          <Empty description="No recommendations. Add more data to get personalized suggestions." />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recommendations.map((r) => (
            <Card
              key={r.action_template_id}
              size="small"
              style={{ borderLeft: `4px solid ${DOMAIN_COLORS[r.domain] || '#94a3b8'}` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {r.action}
                    <span style={{ marginLeft: 8, fontSize: 14, fontWeight: 400, color: '#64748b' }}>
                      ({r.domain})
                    </span>
                  </Typography.Title>
                  <p style={{ margin: '8px 0 0', color: '#475569', fontSize: 13 }}>
                    {r.reason}
                  </p>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>
                    Expected: +{r.estimated_score_gain} score • {r.xp_reward} XP • {r.time_cost_minutes} min
                  </div>
                </div>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={completeMutation.isPending && completeMutation.variables === r.action_template_id}
                  onClick={() => completeMutation.mutate(r.action_template_id)}
                >
                  Mark complete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
