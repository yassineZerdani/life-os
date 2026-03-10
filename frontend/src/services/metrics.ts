import { api } from './api'
import type { Metric, MetricEntry } from '../types'

export const metricsService = {
  list: (domain?: string) =>
    api.get<Metric[]>(domain ? `/metrics?domain=${encodeURIComponent(domain)}` : '/metrics'),
  getById: (id: string) => api.get<Metric>(`/metrics/${id}`),
  getEntries: (metricId: string, limit = 100) =>
    api.get<MetricEntry[]>(`/metrics/${metricId}/entries?limit=${limit}`),
  addEntry: (data: { metric_id: string; value: number; timestamp?: string; note?: string }) =>
    api.post<MetricEntry>('/metrics/entries', data),
}
