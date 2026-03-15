import { api } from './api'

const PREFIX = '/mind-engine'

export interface EmotionalStateEntry {
  id: string
  user_id: number
  date: string
  primary_emotion: string
  intensity: number | null
  notes: string | null
  created_at: string | null
}

export interface TriggerEntry {
  id: string
  user_id: number
  trigger_type: string
  description: string | null
  date: string
  linked_emotion: string | null
  linked_behavior: string | null
  created_at: string | null
}

export interface ThoughtPattern {
  id: string
  user_id: number
  title: string
  description: string | null
  category: string | null
  frequency_score: number | null
  severity_score: number | null
  created_at: string | null
  updated_at: string | null
}

export interface BehaviorLoop {
  id: string
  user_id: number
  title: string
  trigger_summary: string | null
  emotional_sequence: string | null
  behavioral_sequence: string | null
  aftermath: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

export interface RegulationToolUse {
  id: string
  user_id: number
  tool_name: string
  date: string
  effectiveness_score: number | null
  notes: string | null
  created_at: string | null
}

export interface MindEngineDashboardResponse {
  emotions_count: number
  triggers_count: number
  thought_patterns_count: number
  loops_count: number
  regulation_uses_count: number
  emotional_weather: { date: string; primary_emotion: string; avg_intensity: number | null; count: number }[]
  trend_insights: string[]
  recent_emotions: EmotionalStateEntry[]
  recent_triggers: TriggerEntry[]
  top_tools: { tool_name: string; count: number; avg_effectiveness: number | null }[]
}

export const mindEngineService = {
  getDashboard: (params?: { weather_days?: number }) => {
    const q = params?.weather_days != null ? `?weather_days=${params.weather_days}` : ''
    return api.get<MindEngineDashboardResponse>(`${PREFIX}/dashboard${q}`)
  },

  listEmotions: (params?: { days?: number; limit?: number }) => {
    const search = new URLSearchParams()
    if (params?.days != null) search.set('days', String(params.days))
    if (params?.limit != null) search.set('limit', String(params.limit))
    const q = search.toString() ? `?${search}` : ''
    return api.get<EmotionalStateEntry[]>(`${PREFIX}/emotions${q}`)
  },
  createEmotion: (body: { date: string; primary_emotion: string; intensity?: number; notes?: string }) =>
    api.post<EmotionalStateEntry>(`${PREFIX}/emotions`, body),
  updateEmotion: (id: string, body: Partial<EmotionalStateEntry>) =>
    api.patch<EmotionalStateEntry>(`${PREFIX}/emotions/${id}`, body),
  deleteEmotion: (id: string) => api.delete<unknown>(`${PREFIX}/emotions/${id}`),

  listTriggers: (params?: { days?: number; limit?: number }) => {
    const search = new URLSearchParams()
    if (params?.days != null) search.set('days', String(params.days))
    if (params?.limit != null) search.set('limit', String(params.limit))
    const q = search.toString() ? `?${search}` : ''
    return api.get<TriggerEntry[]>(`${PREFIX}/triggers${q}`)
  },
  createTrigger: (body: {
    trigger_type: string
    description?: string
    date: string
    linked_emotion?: string
    linked_behavior?: string
  }) => api.post<TriggerEntry>(`${PREFIX}/triggers`, body),
  deleteTrigger: (id: string) => api.delete<unknown>(`${PREFIX}/triggers/${id}`),

  listThoughtPatterns: () => api.get<ThoughtPattern[]>(`${PREFIX}/thought-patterns`),
  createThoughtPattern: (body: {
    title: string
    description?: string
    category?: string
    frequency_score?: number
    severity_score?: number
  }) => api.post<ThoughtPattern>(`${PREFIX}/thought-patterns`, body),
  updateThoughtPattern: (id: string, body: Partial<ThoughtPattern>) =>
    api.patch<ThoughtPattern>(`${PREFIX}/thought-patterns/${id}`, body),
  deleteThoughtPattern: (id: string) => api.delete<unknown>(`${PREFIX}/thought-patterns/${id}`),

  listLoops: () => api.get<BehaviorLoop[]>(`${PREFIX}/loops`),
  createLoop: (body: {
    title: string
    trigger_summary?: string
    emotional_sequence?: string
    behavioral_sequence?: string
    aftermath?: string
    notes?: string
  }) => api.post<BehaviorLoop>(`${PREFIX}/loops`, body),
  updateLoop: (id: string, body: Partial<BehaviorLoop>) =>
    api.patch<BehaviorLoop>(`${PREFIX}/loops/${id}`, body),
  deleteLoop: (id: string) => api.delete<unknown>(`${PREFIX}/loops/${id}`),

  listRegulationUses: (params?: { days?: number; limit?: number }) => {
    const search = new URLSearchParams()
    if (params?.days != null) search.set('days', String(params.days))
    if (params?.limit != null) search.set('limit', String(params.limit))
    const q = search.toString() ? `?${search}` : ''
    return api.get<RegulationToolUse[]>(`${PREFIX}/regulation${q}`)
  },
  createRegulationUse: (body: {
    tool_name: string
    date: string
    effectiveness_score?: number
    notes?: string
  }) => api.post<RegulationToolUse>(`${PREFIX}/regulation`, body),
  deleteRegulationUse: (id: string) => api.delete<unknown>(`${PREFIX}/regulation/${id}`),
}
