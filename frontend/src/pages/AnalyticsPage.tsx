import { useState } from 'react'
import { DatePicker } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '../services/analytics'
import { DomainTimePieChart } from '../components/analytics/DomainTimePieChart'
import { WeeklyBalanceChart } from '../components/analytics/WeeklyBalanceChart'
import { MonthlyHeatmap } from '../components/analytics/MonthlyHeatmap'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ])
  const startDate = dateRange[0]?.format('YYYY-MM-DD') ?? ''
  const endDate = dateRange[1]?.format('YYYY-MM-DD') ?? ''

  const { data: timeDistribution, isLoading: distLoading } = useQuery({
    queryKey: ['analytics', 'time-distribution', startDate, endDate],
    queryFn: () => analyticsService.timeDistribution(startDate, endDate),
    enabled: !!startDate && !!endDate,
  })

  const { data: weeklyBalance, isLoading: weeklyLoading } = useQuery({
    queryKey: ['analytics', 'weekly-balance', startDate, endDate],
    queryFn: () => analyticsService.weeklyBalance(startDate, endDate, 12),
    enabled: !!startDate && !!endDate,
  })

  const { data: heatmapData, isLoading: heatmapLoading } = useQuery({
    queryKey: ['analytics', 'heatmap', startDate, endDate],
    queryFn: () => analyticsService.dailyHeatmap(startDate, endDate),
    enabled: !!startDate && !!endDate,
  })

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 28, color: '#0f172a' }}>Analytics</h1>
      <div style={{ marginBottom: 24 }}>
        <label style={{ marginRight: 8, color: '#334155' }}>Date range:</label>
        <RangePicker
          value={dateRange}
          onChange={(v) => v && setDateRange([v[0]!, v[1]!])}
          format="YYYY-MM-DD"
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <DomainTimePieChart data={timeDistribution || {}} loading={distLoading} />
        <WeeklyBalanceChart data={weeklyBalance || []} loading={weeklyLoading} />
        <MonthlyHeatmap data={heatmapData || []} loading={heatmapLoading} />
      </div>
    </div>
  )
}
