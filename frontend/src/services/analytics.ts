import { api } from './api'

export const analyticsService = {
  timeDistribution: (startDate: string, endDate: string) =>
    api.get<Record<string, number>>(
      `/analytics/time-distribution?start_date=${startDate}&end_date=${endDate}`
    ),
  weeklyBalance: (startDate: string, endDate: string, weeks = 12) =>
    api.get<Array<Record<string, string | number>>>(
      `/analytics/weekly-balance?start_date=${startDate}&end_date=${endDate}&weeks=${weeks}`
    ),
  dailyHeatmap: (startDate: string, endDate: string) =>
    api.get<Array<{ date: string; total_minutes: number; domains: Record<string, number> }>>(
      `/analytics/daily-heatmap?start_date=${startDate}&end_date=${endDate}`
    ),
}
