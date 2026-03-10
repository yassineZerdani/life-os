import { Card, Timeline, Empty } from 'antd'
import type { RecentActivity } from '../../types'
import dayjs from 'dayjs'

interface RecentEventsTimelineProps {
  activities: RecentActivity[]
  loading?: boolean
}

export function RecentEventsTimeline({ activities, loading }: RecentEventsTimelineProps) {
  return (
    <Card title="Recent Activities" loading={loading}>
      {activities.length === 0 ? (
        <Empty description="No recent activities" />
      ) : (
        <Timeline
          items={activities.slice(0, 10).map((a) => ({
            color: a.type === 'achievement' ? 'green' : a.type === 'experience' ? 'blue' : 'gray',
            children: (
              <div>
                <div style={{ fontWeight: 500 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {dayjs(a.timestamp).format('MMM D, YYYY HH:mm')}
                </div>
              </div>
            ),
          }))}
        />
      )}
    </Card>
  )
}
