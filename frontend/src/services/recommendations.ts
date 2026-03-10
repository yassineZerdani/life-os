import { api } from './api'

export interface Recommendation {
  action_template_id: string
  action: string
  domain: string
  impact: number
  estimated_score_gain: number
  xp_reward: number
  time_cost_minutes: number
  reason: string
}

export interface RecommendationsResponse {
  recommendations: Recommendation[]
}

export const recommendationsService = {
  list: (limit?: number) => {
    const qs = limit != null ? `?limit=${limit}` : ''
    return api.get<RecommendationsResponse>(`/recommendations${qs}`)
  },

  complete: (actionTemplateId: string) =>
    api.post<{ status: string; xp_awarded: number }>(
      `/recommendations/${actionTemplateId}/complete`,
      {}
    ),
}
