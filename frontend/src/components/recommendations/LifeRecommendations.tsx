import { useQuery } from '@tanstack/react-query'
import { Card, Empty, Typography } from 'antd'
import { BulbOutlined } from '@ant-design/icons'
import { recommendationsService } from '../../services/recommendations'
import type { Recommendation } from '../../services/recommendations'

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

interface LifeRecommendationsProps {
  limit?: number
  title?: string
}

function RecommendationItem({ r }: { r: Recommendation }) {
  const color = DOMAIN_COLORS[r.domain] || '#94a3b8'
  return (
    <div
      style={{
        padding: 12,
        marginBottom: 8,
        background: '#f8fafc',
        borderRadius: 6,
        borderLeft: `4px solid ${color}`,
      }}
    >
      <Typography.Text strong style={{ textTransform: 'capitalize' }}>
        {r.action}
      </Typography.Text>
      <span style={{ marginLeft: 8, fontSize: 12, color: '#64748b' }}>
        ({r.domain})
      </span>
      <div style={{ marginTop: 4, fontSize: 12, color: '#475569' }}>
        {r.reason}
      </div>
      <div style={{ marginTop: 4, fontSize: 11, color: '#94a3b8' }}>
        +{r.estimated_score_gain} score • {r.xp_reward} XP • {r.time_cost_minutes} min
      </div>
    </div>
  )
}

export function LifeRecommendations({ limit = 3, title = 'Recommended Actions' }: LifeRecommendationsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['recommendations', limit],
    queryFn: async () => {
      const res = await recommendationsService.list(limit)
      return res.recommendations
    },
  })

  const recommendations = data ?? []

  return (
    <Card
      title={
        <span>
          <BulbOutlined style={{ marginRight: 8 }} />
          {title}
        </span>
      }
      loading={isLoading}
    >
      {recommendations.length === 0 && !isLoading ? (
        <Empty description="No recommendations. Add more data to get personalized suggestions." />
      ) : (
        recommendations.map((r) => <RecommendationItem key={r.action_template_id} r={r} />)
      )}
    </Card>
  )
}
