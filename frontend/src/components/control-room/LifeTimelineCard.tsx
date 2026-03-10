import { TrophyOutlined, ThunderboltOutlined, CalendarOutlined, StarOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { TimelineEvent } from '../../types/controlRoom'
import { useTheme } from '../../hooks/useTheme'
import { ControlRoomCard } from './ControlRoomCard'
import { DOMAIN_COLORS } from './constants'

interface LifeTimelineCardProps {
  events: TimelineEvent[]
  loading?: boolean
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  xp_event: <ThunderboltOutlined />,
  achievement: <TrophyOutlined />,
  experience: <CalendarOutlined />,
  life_event: <StarOutlined />,
}

function formatTimestamp(ts: string | null): string {
  if (!ts) return ''
  try {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 86400000) return 'Today'
    if (diff < 172800000) return 'Yesterday'
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export function LifeTimelineCard({ events, loading }: LifeTimelineCardProps) {
  const theme = useTheme()
  const navigate = useNavigate()

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
        Life Timeline
      </h3>
      {loading ? (
        <div style={{ color: theme.textMuted, fontSize: 15 }}>Loading…</div>
      ) : events.length === 0 ? (
        <div style={{ color: theme.textSecondary, fontSize: 15 }}>No recent events</div>
      ) : (
        <div
          style={{
            maxHeight: 320,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {events.map((e) => {
            const color = e.domain ? DOMAIN_COLORS[e.domain] || theme.accent : theme.accent
            const icon = TYPE_ICONS[e.type] || <StarOutlined />
            return (
              <div
                key={`${e.type}-${e.id}`}
                onClick={() => navigate('/app/timeline')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: 10,
                  background: theme.hoverBg,
                  borderRadius: theme.radius,
                  cursor: 'pointer',
                  borderLeft: `3px solid ${color}`,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.selectedBg
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.hoverBg
                }}
              >
                <span style={{ color, marginTop: 2 }}>{icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: theme.textPrimary, fontSize: 13 }}>{e.title}</div>
                  <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>
                    {formatTimestamp(e.timestamp)}
                    {e.domain && ` · ${e.domain}`}
                    {e.xp_awarded ? ` · +${e.xp_awarded} XP` : ''}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </ControlRoomCard>
  )
}
