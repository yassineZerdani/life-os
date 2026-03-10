import { api } from './api'
import type { LifeEvent } from '../types'

export const lifeEventsService = {
  list: (domainId?: number, limit = 50) => {
    const params = new URLSearchParams()
    if (domainId) params.set('domain_id', String(domainId))
    params.set('limit', String(limit))
    return api.get<LifeEvent[]>(`/life-events?${params}`)
  },
  create: (data: Partial<LifeEvent>) => api.post<LifeEvent>('/life-events', data),
}
