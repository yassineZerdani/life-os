import { api } from './api'

export interface UnlockedAchievement {
  id: string
  title: string
  description?: string
  domain?: string
  xp_reward: number
  unlocked_at?: string
}

export const lifeAchievementsService = {
  getUnlocked: (limit?: number) => {
    const qs = limit != null ? `?limit=${limit}` : ''
    return api.get<UnlockedAchievement[]>(`/life-achievements/unlocked${qs}`)
  },

  evaluate: () =>
    api.post<{ newly_unlocked: Array<{ title: string; xp_reward: number; message: string }> }>(
      '/life-achievements/evaluate',
      {}
    ),
}
