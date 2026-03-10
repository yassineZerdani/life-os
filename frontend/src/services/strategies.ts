import { api } from './api'
import type { Strategy, ActiveStrategy } from '../types/strategy'

export const strategiesService = {
  list: () => api.get<Strategy[]>('/strategies'),
  recommended: (limit = 10) =>
    api.get<Strategy[]>(`/strategies/recommended?limit=${limit}`),
  active: () => api.get<ActiveStrategy[]>('/strategies/active'),
  activate: (strategyId: string) =>
    api.post<{ id: string; strategy_id: string; started_at: string; active: boolean }>(
      '/strategies/activate',
      { strategy_id: strategyId }
    ),
}
