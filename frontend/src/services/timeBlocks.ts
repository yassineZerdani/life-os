import { api } from './api'

export interface TimeBlock {
  id: string
  domain: string
  title: string
  start_time: string
  end_time: string
  duration_minutes: number
  notes?: string
  created_at?: string
}

export const timeBlocksService = {
  list: (params?: { start_date?: string; end_date?: string; domain?: string }) => {
    const search = new URLSearchParams()
    if (params?.start_date) search.set('start_date', params.start_date)
    if (params?.end_date) search.set('end_date', params.end_date)
    if (params?.domain) search.set('domain', params.domain)
    const q = search.toString()
    return api.get<TimeBlock[]>(`/time-blocks${q ? `?${q}` : ''}`)
  },
  create: (data: {
    domain: string
    title: string
    start_time: string
    end_time: string
    notes?: string
  }) => api.post<TimeBlock>('/time-blocks', data),
}
