import { api } from './api'

export interface Milestone {
  id: string
  mission_id: string
  title: string
  description?: string
  status: string
  completed_at?: string
  order_index: number
}

export interface Mission {
  id: string
  user_id: number
  title: string
  description?: string
  status: string
  phase?: string
  priority?: number
  target_date?: string
  created_at?: string
  updated_at?: string
  milestones: Milestone[]
}

export interface LifeWorkAchievement {
  id: string
  user_id: number
  title: string
  description?: string
  category: string
  impact_level?: string
  date: string
  proof_url?: string
  created_at?: string
}

export interface Opportunity {
  id: string
  user_id: number
  title: string
  type: string
  source?: string
  status: string
  value_estimate?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface CareerLeverage {
  id: string
  user_id: number
  area: string
  score: number
  notes?: string
  updated_at?: string
}

export interface EnergyPattern {
  id: string
  user_id: number
  work_type: string
  energy_effect: string
  focus_quality?: string
  notes?: string
  recorded_at?: string
}

export interface CareerDashboard {
  missions: Mission[]
  achievements_recent: LifeWorkAchievement[]
  opportunities_by_status: Record<string, number>
  leverage: CareerLeverage[]
  weakest_leverage_area?: string
  recommended_leverage_action?: string
  energy_insights: string[]
}

export const careerService = {
  getDashboard: () => api.get<CareerDashboard>('/career/dashboard'),
  listMissions: (status?: string) =>
    api.get<Mission[]>(`/career/missions${status ? `?status=${status}` : ''}`),
  getMission: (id: string) => api.get<Mission>(`/career/missions/${id}`),
  createMission: (data: { title: string; description?: string; status?: string; phase?: string; priority?: number; target_date?: string }) =>
    api.post<Mission>('/career/missions', data),
  updateMission: (id: string, data: Partial<Pick<Mission, 'title' | 'description' | 'status' | 'phase' | 'priority' | 'target_date'>>) =>
    api.patch<Mission>(`/career/missions/${id}`, data),
  deleteMission: (id: string) => api.delete(`/career/missions/${id}`),

  createMilestone: (data: { mission_id: string; title: string; description?: string; status?: string; order_index?: number }) =>
    api.post<Milestone>('/career/milestones', data),
  updateMilestone: (id: string, data: Partial<Pick<Milestone, 'title' | 'description' | 'status' | 'completed_at' | 'order_index'>>) =>
    api.patch<Milestone>(`/career/milestones/${id}`, data),
  deleteMilestone: (id: string) => api.delete(`/career/milestones/${id}`),

  listAchievements: (category?: string, limit?: number) => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (limit != null) params.set('limit', String(limit))
    return api.get<LifeWorkAchievement[]>(`/career/achievements${params.toString() ? `?${params.toString()}` : ''}`)
  },
  createAchievement: (data: { title: string; description?: string; category: string; impact_level?: string; date: string; proof_url?: string }) =>
    api.post<LifeWorkAchievement>('/career/achievements', data),
  deleteAchievement: (id: string) => api.delete(`/career/achievements/${id}`),

  listOpportunities: (status?: string, type?: string) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (type) params.set('type_', type)
    return api.get<Opportunity[]>(`/career/opportunities${params.toString() ? `?${params.toString()}` : ''}`)
  },
  createOpportunity: (data: { title: string; type: string; source?: string; status?: string; value_estimate?: string; notes?: string }) =>
    api.post<Opportunity>('/career/opportunities', data),
  updateOpportunity: (id: string, data: Partial<Pick<Opportunity, 'title' | 'type' | 'source' | 'status' | 'value_estimate' | 'notes'>>) =>
    api.patch<Opportunity>(`/career/opportunities/${id}`, data),
  deleteOpportunity: (id: string) => api.delete(`/career/opportunities/${id}`),

  listLeverage: () => api.get<CareerLeverage[]>('/career/leverage'),
  updateLeverage: (area: string, data: { score?: number; notes?: string }) =>
    api.patch<CareerLeverage>(`/career/leverage/${area}`, data),

  listEnergyPatterns: () => api.get<EnergyPattern[]>('/career/energy-patterns'),
  createEnergyPattern: (data: { work_type: string; energy_effect: string; focus_quality?: string; notes?: string }) =>
    api.post<EnergyPattern>('/career/energy-patterns', data),
}
