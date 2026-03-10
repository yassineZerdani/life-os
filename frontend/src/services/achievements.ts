import { api } from './api'
import type { Achievement } from '../types'

export const achievementsService = {
  list: (domain?: string, limit = 50) => {
    const params = new URLSearchParams()
    if (domain) params.set('domain', domain)
    params.set('limit', String(limit))
    return api.get<Achievement[]>(`/achievements?${params}`)
  },
  getById: (id: string) => api.get<Achievement>(`/achievements/${id}`),
  create: (data: Partial<Achievement>) => api.post<Achievement>('/achievements', data),
  update: (id: string, data: Partial<Achievement>) =>
    api.patch<Achievement>(`/achievements/${id}`, data),
  delete: (id: string) => api.delete(`/achievements/${id}`),
}
