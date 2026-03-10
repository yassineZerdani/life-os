import { api } from './api'
import type { TimelineEvent } from '../types'

export const timelineService = {
  get: (limit = 50) =>
    api.get<TimelineEvent[]>(`/timeline?limit=${limit}`),
}
