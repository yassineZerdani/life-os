import { Card } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '../../services/analytics'
import dayjs from 'dayjs'

export function WeeklyLifeBalanceCard() {
  const weekStart = dayjs().startOf('week').format('YYYY-MM-DD')
  const weekEnd = dayjs().endOf('week').format('YYYY-MM-DD')

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'weekly-balance', weekStart, weekEnd],
    queryFn: () => analyticsService.weeklyBalance(weekStart, weekEnd, 1),
  })

  const weekData = data?.[0]
  if (!weekData) {
    return (
      <Card title="This Week" size="small" loading={isLoading}>
        <div style={{ color: '#64748b', fontSize: 12 }}>No time logged this week.</div>
      </Card>
    )
  }

  const total = Object.entries(weekData)
    .filter(([k]) => k !== 'week')
    .reduce((a, [, v]) => a + Number(v), 0)

  return (
    <Card title="This Week" size="small" loading={isLoading}>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#6366f1' }}>{total}h</div>
      <div style={{ fontSize: 12, color: '#64748b' }}>Total tracked</div>
      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {Object.entries(weekData)
          .filter(([k, v]) => k !== 'week' && Number(v) > 0)
          .map(([domain, hours]) => (
            <span key={domain} style={{ fontSize: 11, color: '#64748b' }}>
              {domain}: {hours}h
            </span>
          ))}
      </div>
    </Card>
  )
}
