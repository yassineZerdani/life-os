import { api } from './api'

export interface Quest {
  id: string
  title: string
  description?: string
  domain?: string
  xp_reward: number
  target_value: number
  progress: number
  deadline?: string
  completed: boolean
}

export const questsService = {
  list: () => api.get<Quest[]>('/quests'),

  generate: () => api.post<{ created: number }>('/quests/generate', {}),

  complete: (questId: string) =>
    api.post<{ xp_awarded: number; title: string }>(`/quests/${questId}/complete`, {}),
}
