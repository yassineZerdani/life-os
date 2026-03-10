import { Card, Empty } from 'antd'
import { TrophyOutlined, ThunderboltOutlined, CalendarOutlined, StarOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { TimelineEvent } from '../../types/controlRoom'
import { DOMAIN_COLORS } from './constants'

interface LifeTimelinePanelProps {
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

export function LifeTimelinePanel({ events, loading }: LifeTimelinePanelProps) {
  const navigate = useNavigate()

  return (
    <Card
      title="Life Timeline"
      loading={loading}
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {events.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No recent events"
          style={{ color: '#64748b' }}
        />
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
            const color = e.domain ? DOMAIN_COLORS[e.domain] || '#64748b' : '#6366f1'
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
                  background: '#f8fafc',
                  borderRadius: 8,
                  cursor: 'pointer',
                  borderLeft: `3px solid ${color}`,
                }}
              >
                <span style={{ color, marginTop: 2 }}>{icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#0f172a', fontSize: 13 }}>{e.title}</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
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
    </Card>
  )
}
