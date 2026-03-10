import { api } from './api'
import type { XPEvent } from '../types'

export const xpEventsService = {
  list: (domain?: string, limit = 50) => {
    const params = new URLSearchParams()
    if (domain) params.set('domain', domain)
    params.set('limit', String(limit))
    return api.get<XPEvent[]>(`/xp-events?${params}`)
  },
  create: (data: {
    domain: string
    xp_amount: number
    reason: string
    source_type: string
    source_id?: string
  }) => api.post<XPEvent>('/xp-events', data),
}
