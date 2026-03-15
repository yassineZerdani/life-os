import { api } from './api'

export interface LifeExperience {
  id: string
  user_id: number
  title: string
  description?: string | null
  date: string
  location_name?: string | null
  latitude?: number | null
  longitude?: number | null
  category: string
  emotional_tone?: string | null
  intensity_score?: number | null
  meaning_score?: number | null
  aliveness_score?: number | null
  lesson_note?: string | null
  created_at?: string
  updated_at?: string
}

export interface LifeExperiencePerson {
  id: string
  experience_id: string
  person_name: string
  relationship_type?: string | null
}

export interface LifeExperienceMedia {
  id: string
  experience_id: string
  media_type: string
  media_url: string
}

export interface SeasonOfLife {
  id: string
  user_id: number
  title: string
  start_date: string
  end_date?: string | null
  summary?: string | null
  created_at?: string
  updated_at?: string
}

export interface ExperienceWithRelations {
  experience: LifeExperience
  people: LifeExperiencePerson[]
  media: LifeExperienceMedia[]
  tags: string[]
}

export interface MapPoint {
  id: string
  title: string
  latitude: number
  longitude: number
  date?: string | null
  category: string
  emotional_tone?: string | null
  aliveness_score?: number | null
  meaning_score?: number | null
}

export interface LifeMemoryDashboard {
  experiences_count: number
  peak_aliveness_count: number
  peak_meaning_count: number
  insights: string[]
  future_suggestions: string[]
}

const PREFIX = '/life-memory'

export const lifeMemoryService = {
  getDashboard: () => api.get<LifeMemoryDashboard>(`${PREFIX}/dashboard`),

  getTimeline: (params?: { limit?: number; category?: string; emotional_tone?: string }) => {
    const search = new URLSearchParams()
    if (params?.limit != null) search.set('limit', String(params.limit))
    if (params?.category) search.set('category', params.category)
    if (params?.emotional_tone) search.set('emotional_tone', params.emotional_tone)
    return api.get<ExperienceWithRelations[]>(`${PREFIX}/experiences/timeline?${search.toString()}`)
  },

  getMap: (params?: { emotional_tone?: string; category?: string; start_date?: string; end_date?: string }) => {
    const search = new URLSearchParams()
    if (params?.emotional_tone) search.set('emotional_tone', params.emotional_tone)
    if (params?.category) search.set('category', params.category)
    if (params?.start_date) search.set('start_date', params.start_date)
    if (params?.end_date) search.set('end_date', params.end_date)
    return api.get<MapPoint[]>(`${PREFIX}/experiences/map?${search.toString()}`)
  },

  listExperiences: (params?: { category?: string; emotional_tone?: string; limit?: number }) => {
    const search = new URLSearchParams()
    if (params?.category) search.set('category', params.category)
    if (params?.emotional_tone) search.set('emotional_tone', params.emotional_tone)
    if (params?.limit != null) search.set('limit', String(params.limit))
    return api.get<LifeExperience[]>(`${PREFIX}/experiences?${search.toString()}`)
  },

  getExperience: (id: string) => api.get<ExperienceWithRelations>(`${PREFIX}/experiences/${id}`),

  createExperience: (data: {
    title: string
    description?: string
    date: string
    location_name?: string
    latitude?: number
    longitude?: number
    category: string
    emotional_tone?: string
    intensity_score?: number
    meaning_score?: number
    aliveness_score?: number
    lesson_note?: string
  }) => api.post<LifeExperience>(`${PREFIX}/experiences`, data),

  updateExperience: (id: string, data: Partial<LifeExperience>) =>
    api.patch<LifeExperience>(`${PREFIX}/experiences/${id}`, data),

  deleteExperience: (id: string) => api.delete(`${PREFIX}/experiences/${id}`),

  addPerson: (data: { experience_id: string; person_name: string; relationship_type?: string }) =>
    api.post<LifeExperiencePerson>(`${PREFIX}/experiences/people`, data),

  addMedia: (data: { experience_id: string; media_type: string; media_url: string }) =>
    api.post<LifeExperienceMedia>(`${PREFIX}/experiences/media`, data),

  addTag: (data: { experience_id: string; tag: string }) =>
    api.post<{ id: string; experience_id: string; tag: string }>(`${PREFIX}/experiences/tags`, data),

  listPeakAliveness: (limit = 10) =>
    api.get<LifeExperience[]>(`${PREFIX}/experiences/peak/aliveness?limit=${limit}`),

  listPeakMeaning: (limit = 10) =>
    api.get<LifeExperience[]>(`${PREFIX}/experiences/peak/meaning?limit=${limit}`),

  listSeasons: () => api.get<SeasonOfLife[]>(`${PREFIX}/seasons`),

  createSeason: (data: { title: string; start_date: string; end_date?: string; summary?: string }) =>
    api.post<SeasonOfLife>(`${PREFIX}/seasons`, data),

  updateSeason: (id: string, data: Partial<SeasonOfLife>) =>
    api.patch<SeasonOfLife>(`${PREFIX}/seasons/${id}`, data),

  deleteSeason: (id: string) => api.delete(`${PREFIX}/seasons/${id}`),
}
