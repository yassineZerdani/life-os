import { Card, Timeline, Empty } from 'antd'
import type { TimelineEvent } from '../../types'
import dayjs from 'dayjs'

interface TimelineViewProps {
  events: TimelineEvent[]
  loading?: boolean
  title?: string
}

const typeColors: Record<string, string> = {
  xp_event: 'green',
  life_event: 'blue',
  achievement: 'gold',
  experience: 'purple',
  metric: 'gray',
}

export function TimelineView({ events, loading, title = 'Life Timeline' }: TimelineViewProps) {
  return (
    <Card title={title} loading={loading}>
      {events.length === 0 ? (
        <Empty description="No events yet" />
      ) : (
        <Timeline
          items={events.slice(0, 20).map((e) => ({
            color: typeColors[e.type] ?? 'gray',
            children: (
              <div>
                <div style={{ fontWeight: 500 }}>{e.title}</div>
                {e.xp_awarded != null && e.xp_awarded > 0 && (
                  <span style={{ fontSize: 11, color: '#22c55e', marginLeft: 4 }}>
                    +{e.xp_awarded} XP
                  </span>
                )}
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {dayjs(e.timestamp).format('MMM D, YYYY HH:mm')}
                </div>
              </div>
            ),
          }))}
        />
      )}
    </Card>
  )
}
