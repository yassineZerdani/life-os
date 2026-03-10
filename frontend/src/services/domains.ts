import { api } from './api'
import type { Domain, DomainScore } from '../types'

export const domainsService = {
  list: () => api.get<Domain[]>('/domains'),
  getById: (id: number) => api.get<Domain>(`/domains/${id}`),
  getBySlug: (slug: string) => api.get<Domain>(`/domains/slug/${slug}`),
  getScores: () => api.get<DomainScore[]>('/domains/scores'),
  recalculateScores: () => api.post('/domains/scores/recalculate', {}),
}

export const lifeScoreService = {
  get: () => api.get<{ life_score: number }>('/life-score'),
}
