import { api } from './api'
import type {
  DomainScore,
  RecentActivity,
  MetricsTrend,
  GoalProgress,
} from '../types'

export const dashboardService = {
  getScores: () => api.get<DomainScore[]>('/dashboard/scores'),
  getXPGrowth: (domain: string, days = 30) =>
    api.get<{ timestamp: string; xp: number; cumulative: number }[]>(
      `/dashboard/xp-growth?domain=${encodeURIComponent(domain)}&days=${days}`
    ),
  getRecentActivities: (limit = 10) =>
    api.get<RecentActivity[]>(`/dashboard/recent-activities?limit=${limit}`),
  getMetricsTrends: (days = 30) =>
    api.get<MetricsTrend[]>(`/dashboard/metrics-trends?days=${days}`),
  getGoalsProgress: () => api.get<GoalProgress[]>('/dashboard/goals-progress'),
}
