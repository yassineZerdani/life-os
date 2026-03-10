import { Card } from 'antd'
import dayjs from 'dayjs'

interface HeatmapDay {
  date: string
  total_minutes: number
  domains: Record<string, number>
}

interface MonthlyHeatmapProps {
  data: HeatmapDay[]
  loading?: boolean
}

export function MonthlyHeatmap({ data, loading }: MonthlyHeatmapProps) {
  const byDate = new Map(data.map((d) => [d.date, d]))
  const maxMinutes = Math.max(...data.map((d) => d.total_minutes), 1)

  if (data.length === 0) {
    return (
      <Card title="Activity Heatmap" loading={loading}>
        <div style={{ color: '#64748b', textAlign: 'center', padding: 24 }}>
          No activity data for this period. Log time blocks to see your heatmap.
        </div>
      </Card>
    )
  }

  const start = data[0]?.date ? dayjs(data[0].date) : dayjs()
  const end = data[data.length - 1]?.date ? dayjs(data[data.length - 1].date) : dayjs()
  const days: string[] = []
  let d = start
  while (d.isBefore(end) || d.isSame(end, 'day')) {
    days.push(d.format('YYYY-MM-DD'))
    d = d.add(1, 'day')
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const firstDayOfWeek = start.day()
  const padding = Array(firstDayOfWeek).fill(null)

  return (
    <Card title="Activity Heatmap" loading={loading}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: '#64748b' }}>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <div
            key={p}
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: `rgba(99, 102, 241, ${p})`,
            }}
          />
        ))}
        <span style={{ fontSize: 12, color: '#64748b' }}>More</span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(7, 1fr)`,
          gap: 2,
          maxWidth: 600,
        }}
      >
        {weekDays.map((wd) => (
          <div key={wd} style={{ fontSize: 10, color: '#64748b', padding: 4 }}>
            {wd}
          </div>
        ))}
        {padding.map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((date) => {
          const dayData = byDate.get(date)
          const mins = dayData?.total_minutes ?? 0
          const intensity = Math.min(1, mins / maxMinutes)
          return (
            <div
              key={date}
              title={dayData ? `${date}: ${mins}min` : date}
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: dayData
                  ? `rgba(99, 102, 241, ${0.2 + intensity * 0.8})`
                  : '#f1f5f9',
              }}
            />
          )
        })}
      </div>
    </Card>
  )
}
