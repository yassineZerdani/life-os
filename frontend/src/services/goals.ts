import { api } from './api'
import type { Goal } from '../types'

export const goalsService = {
  list: (domainId?: number, status?: string) => {
    const params = new URLSearchParams()
    if (domainId) params.set('domain_id', String(domainId))
    if (status) params.set('status', status)
    const q = params.toString()
    return api.get<Goal[]>(`/goals${q ? `?${q}` : ''}`)
  },
  getById: (id: number) => api.get<Goal>(`/goals/${id}`),
  create: (data: Partial<Goal>) => api.post<Goal>('/goals', data),
  update: (id: number, data: Partial<Goal>) => api.patch<Goal>(`/goals/${id}`, data),
  delete: (id: number) => api.delete(`/goals/${id}`),
}
