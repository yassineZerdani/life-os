import { api } from './api'

export interface LoveProfile {
  id: string
  user_id: number
  partner_name?: string | null
  relationship_status: string
  anniversary_date?: string | null
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export interface LovePulseEntry {
  id: string
  user_id: number
  date: string
  closeness_score?: number | null
  communication_score?: number | null
  trust_score?: number | null
  tension_score?: number | null
  support_score?: number | null
  future_alignment_score?: number | null
  notes?: string | null
  created_at?: string
}

export interface LoveMemory {
  id: string
  user_id: number
  title: string
  description?: string | null
  date?: string | null
  category: string
  media_url?: string | null
  created_at?: string
}

export interface ConflictEntry {
  id: string
  user_id: number
  date: string
  trigger?: string | null
  what_i_felt?: string | null
  what_they_may_have_felt?: string | null
  what_happened?: string | null
  repair_needed?: string | null
  status: string
  created_at?: string
  updated_at?: string
}

export interface SharedVisionItem {
  id: string
  user_id: number
  category: string
  title: string
  description?: string | null
  target_date?: string | null
  status: string
  created_at?: string
  updated_at?: string
}

export interface ReconnectAction {
  id: string
  user_id: number
  title: string
  description?: string | null
  category: string
  due_date?: string | null
  completed: boolean
  created_at?: string
  updated_at?: string
}

export interface LoveDashboard {
  profile: LoveProfile
  latest_pulse: LovePulseEntry | null
  conflicts_pending_repair: number
  reconnect_pending: number
  insights: string[]
}

export const loveService = {
  getDashboard: () => api.get<LoveDashboard>('/love/dashboard'),

  getProfile: () => api.get<LoveProfile>('/love/profile'),
  updateProfile: (data: Partial<LoveProfile>) => api.patch<LoveProfile>('/love/profile', data),

  listPulseEntries: (limit = 30) =>
    api.get<LovePulseEntry[]>(`/love/pulse?limit=${limit}`),
  createPulseEntry: (data: {
    date: string
    closeness_score?: number
    communication_score?: number
    trust_score?: number
    tension_score?: number
    support_score?: number
    future_alignment_score?: number
    notes?: string
  }) => api.post<LovePulseEntry>('/love/pulse', data),

  listMemories: (category?: string, limit = 100) => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    params.set('limit', String(limit))
    return api.get<LoveMemory[]>(`/love/memories?${params.toString()}`)
  },
  createMemory: (data: {
    title: string
    description?: string
    date?: string
    category: string
    media_url?: string
  }) => api.post<LoveMemory>('/love/memories', data),
  deleteMemory: (id: string) => api.delete(`/love/memories/${id}`),

  listConflicts: (status?: string, limit = 50) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    params.set('limit', String(limit))
    return api.get<ConflictEntry[]>(`/love/conflicts?${params.toString()}`)
  },
  createConflict: (data: {
    date: string
    trigger?: string
    what_i_felt?: string
    what_they_may_have_felt?: string
    what_happened?: string
    repair_needed?: string
    status?: string
  }) => api.post<ConflictEntry>('/love/conflicts', data),
  updateConflict: (id: string, data: Partial<ConflictEntry>) =>
    api.patch<ConflictEntry>(`/love/conflicts/${id}`, data),
  deleteConflict: (id: string) => api.delete(`/love/conflicts/${id}`),

  listSharedVision: (status?: string, category?: string) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (category) params.set('category', category)
    return api.get<SharedVisionItem[]>(`/love/shared-vision?${params.toString()}`)
  },
  createSharedVision: (data: {
    category: string
    title: string
    description?: string
    target_date?: string
    status?: string
  }) => api.post<SharedVisionItem>('/love/shared-vision', data),
  updateSharedVision: (id: string, data: Partial<SharedVisionItem>) =>
    api.patch<SharedVisionItem>(`/love/shared-vision/${id}`, data),
  deleteSharedVision: (id: string) => api.delete(`/love/shared-vision/${id}`),

  listReconnect: (completed?: boolean) => {
    const params = new URLSearchParams()
    if (completed !== undefined) params.set('completed', String(completed))
    return api.get<ReconnectAction[]>(`/love/reconnect?${params.toString()}`)
  },
  createReconnect: (data: {
    title: string
    description?: string
    category: string
    due_date?: string
  }) => api.post<ReconnectAction>('/love/reconnect', data),
  updateReconnect: (id: string, data: Partial<ReconnectAction>) =>
    api.patch<ReconnectAction>(`/love/reconnect/${id}`, data),
  deleteReconnect: (id: string) => api.delete(`/love/reconnect/${id}`),
}
