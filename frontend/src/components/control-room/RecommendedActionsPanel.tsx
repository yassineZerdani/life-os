import { Card, Empty } from 'antd'
import { ClockCircleOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { Recommendation } from '../../types/controlRoom'
import { DOMAIN_COLORS } from './constants'

interface RecommendedActionsPanelProps {
  recommendations: Recommendation[]
  loading?: boolean
}

export function RecommendedActionsPanel({ recommendations, loading }: RecommendedActionsPanelProps) {
  const navigate = useNavigate()

  return (
    <Card
      title="Recommended Actions"
      loading={loading}
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {recommendations.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No recommendations yet"
          style={{ color: '#64748b' }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recommendations.map((r) => {
            const color = DOMAIN_COLORS[r.domain] || '#6366f1'
            return (
              <div
                key={r.action_template_id}
                onClick={() => navigate('/app/recommendations')}
                style={{
                  padding: 16,
                  background: '#f8fafc',
                  borderRadius: 8,
                  borderLeft: `4px solid ${color}`,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <ThunderboltOutlined style={{ color }} />
                  <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 15 }}>
                    {r.action}
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 11,
                      color: '#64748b',
                      textTransform: 'capitalize',
                    }}
                  >
                    {r.domain}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                  {r.reason}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#64748b' }}>
                  <span>
                    <ClockCircleOutlined /> ~{r.time_cost_minutes} min
                  </span>
                  <span>Impact: {r.impact.toFixed(1)}</span>
                  {r.xp_reward > 0 && (
                    <span style={{ color: '#eab308' }}>+{r.xp_reward} XP</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
