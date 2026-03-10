import { ThunderboltOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { Recommendation } from '../../types/controlRoom'
import { useTheme } from '../../hooks/useTheme'
import { ControlRoomCard } from './ControlRoomCard'
import { DOMAIN_COLORS } from './constants'

interface TopRecommendationsCardProps {
  recommendations: Recommendation[]
  loading?: boolean
}

export function TopRecommendationsCard({ recommendations, loading }: TopRecommendationsCardProps) {
  const theme = useTheme()
  const navigate = useNavigate()
  const top = recommendations.slice(0, 3)

  return (
    <ControlRoomCard>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: theme.textPrimary,
          margin: 0,
          marginBottom: 16,
        }}
      >
        Top Recommendations
      </h3>
      {loading ? (
        <div style={{ color: theme.textMuted, fontSize: 15 }}>Loading…</div>
      ) : top.length === 0 ? (
        <div style={{ color: theme.textSecondary, fontSize: 15 }}>
          No recommendations yet. Complete domains to get personalized actions.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {top.map((r) => {
            const color = DOMAIN_COLORS[r.domain] ?? theme.accent
            return (
              <div
                key={r.action_template_id}
                onClick={() => navigate('/app/recommendations')}
                style={{
                  padding: 14,
                  background: theme.hoverBg,
                  borderRadius: theme.radius,
                  borderLeft: `4px solid ${color}`,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.selectedBg
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.hoverBg
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <ThunderboltOutlined style={{ color }} />
                  <span style={{ fontWeight: 600, color: theme.textPrimary, fontSize: 15 }}>
                    {r.action}
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 11,
                      color: theme.textMuted,
                      textTransform: 'capitalize',
                    }}
                  >
                    {r.domain}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 8 }}>
                  {r.reason}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: theme.textMuted }}>
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
    </ControlRoomCard>
  )
}
