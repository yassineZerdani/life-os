import { api } from './api'

export interface ProfileHubSection {
  key: string
  name: string
  completion_pct: number
  last_updated: string | null
  summary: string | null
}

export interface ProfileHub {
  sections: ProfileHubSection[]
}

export interface PersonProfile {
  id: number
  user_id: number
  full_name?: string
  preferred_name?: string
  birth_year?: number
  location?: string
  timezone?: string
  languages?: string[]
  occupation?: string
  relationship_status?: string
  living_situation?: string
  created_at?: string
  updated_at?: string
}

export interface AppPreferences {
  id: number
  user_id: number
  theme?: string
  dark_mode?: boolean
  notifications_enabled?: boolean
  timezone?: string
  language?: string
  privacy_controls?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export const profileService = {
  getHub: () => api.get<ProfileHub>('/profile/hub'),
  getPerson: () => api.get<PersonProfile>('/profile/person'),
  updatePerson: (data: Partial<PersonProfile>) => api.patch<PersonProfile>('/profile/person', data),
  getApp: () => api.get<AppPreferences>('/profile/app'),
  updateApp: (data: Partial<AppPreferences>) => api.patch<AppPreferences>('/profile/app', data),
  getHealth: () => api.get<Record<string, unknown>>('/profile/health'),
  updateHealth: (data: Record<string, unknown>) => api.patch<Record<string, unknown>>('/profile/health', data),
  getPsychology: () => api.get<Record<string, unknown>>('/profile/psychology'),
  updatePsychology: (data: Record<string, unknown>) => api.patch<Record<string, unknown>>('/profile/psychology', data),
  getFinance: () => api.get<Record<string, unknown>>('/profile/finance'),
  updateFinance: (data: Record<string, unknown>) => api.patch<Record<string, unknown>>('/profile/finance', data),
  getCareer: () => api.get<Record<string, unknown>>('/profile/career'),
  updateCareer: (data: Record<string, unknown>) => api.patch<Record<string, unknown>>('/profile/career', data),
  getRelationships: () => api.get<Record<string, unknown>>('/profile/relationships'),
  updateRelationships: (data: Record<string, unknown>) => api.patch<Record<string, unknown>>('/profile/relationships', data),
  getLifestyle: () => api.get<Record<string, unknown>>('/profile/lifestyle'),
  updateLifestyle: (data: Record<string, unknown>) => api.patch<Record<string, unknown>>('/profile/lifestyle', data),
  getIdentity: () => api.get<Record<string, unknown>>('/profile/identity'),
  updateIdentity: (data: Record<string, unknown>) => api.patch<Record<string, unknown>>('/profile/identity', data),
  getStrategies: () => api.get<Record<string, unknown>>('/profile/strategies'),
  updateStrategies: (data: Record<string, unknown>) => api.patch<Record<string, unknown>>('/profile/strategies', data),
}

export const SETTINGS_ROUTES = [
  { path: 'app', label: 'App Settings', key: 'app' },
  { path: 'person', label: 'Personal Profile', key: 'profile' },
  { path: 'health', label: 'Health', key: 'health' },
  { path: 'psychology', label: 'Psychology', key: 'psychology' },
  { path: 'finance', label: 'Finance', key: 'finance' },
  { path: 'career', label: 'Career & Skills', key: 'career' },
  { path: 'relationships', label: 'Relationships', key: 'relationships' },
  { path: 'lifestyle', label: 'Lifestyle', key: 'lifestyle' },
  { path: 'identity', label: 'Identity & Values', key: 'identity' },
  { path: 'strategies', label: 'Strategy Preferences', key: 'strategies' },
] as const
