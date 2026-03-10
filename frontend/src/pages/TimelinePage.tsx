import { useQuery } from '@tanstack/react-query'
import { Card, Timeline, Empty } from 'antd'
import { timelineService } from '../services/timeline'
import type { TimelineEvent } from '../types'
import dayjs from 'dayjs'

const typeColors: Record<string, string> = {
  xp_event: 'green',
  life_event: 'blue',
  achievement: 'gold',
  experience: 'purple',
}

export function TimelinePage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['timeline'],
    queryFn: () => timelineService.get(100),
  })

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 28 }}>Life Timeline</h1>
      <Card loading={isLoading}>
        {!events?.length ? (
          <Empty description="No events yet. Log activities to build your timeline!" />
        ) : (
          <Timeline
            items={(events as TimelineEvent[]).map((e) => ({
              color: typeColors[e.type] ?? 'gray',
              children: (
                <div>
                  <div style={{ fontWeight: 500, fontSize: 15 }}>{e.title}</div>
                  {e.xp_awarded != null && e.xp_awarded > 0 && (
                    <span style={{ fontSize: 12, color: '#22c55e', marginLeft: 4 }}>
                      +{e.xp_awarded} XP {e.domain ? `(${e.domain})` : ''}
                    </span>
                  )}
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    {dayjs(e.timestamp).format('MMM D, YYYY HH:mm')}
                  </div>
                </div>
              ),
            }))}
          />
        )}
      </Card>
    </div>
  )
}
