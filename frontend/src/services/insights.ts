import { api } from './api'
import type { Insight } from '../types'

export const insightsService = {
  list: (params?: { limit?: number; resolved?: boolean; type?: string }) => {
    const search = new URLSearchParams()
    if (params?.limit != null) search.set('limit', String(params.limit))
    if (params?.resolved === true) search.set('resolved', 'true')
    if (params?.resolved === false) search.set('resolved', 'false')
    if (params?.type) search.set('type', params.type)
    const qs = search.toString()
    return api.get<Insight[]>(`/insights${qs ? `?${qs}` : ''}`)
  },
  run: () => api.post<Insight[]>('/insights/run', {}),
  resolve: (id: string) => api.patch<Insight>(`/insights/${id}/resolve`, {}),
}
