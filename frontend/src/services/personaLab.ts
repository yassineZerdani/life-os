import { api } from './api'

const PREFIX = '/persona-lab'

// ----- Profile -----
export interface PersonaIdentityProfile {
  id: string
  user_id: number
  current_self_summary: string | null
  ideal_self_summary: string | null
  public_self_summary: string | null
  private_self_summary: string | null
  values_summary: string | null
  updated_at: string | null
}

// ----- Value -----
export interface PersonaValue {
  id: string
  user_id: number
  name: string
  description: string | null
  priority_score: number | null
  created_at: string | null
  updated_at: string | null
}

// ----- Principle -----
export interface PersonaPrinciple {
  id: string
  user_id: number
  title: string
  description: string | null
  active: boolean
  created_at: string | null
  updated_at: string | null
}

// ----- Narrative -----
export type NarrativeType =
  | 'who_i_was'
  | 'who_i_am'
  | 'who_i_am_becoming'
  | 'defining_moment'
  | 'identity_shift'

export interface PersonaNarrativeEntry {
  id: string
  user_id: number
  title: string
  description: string | null
  time_period: string | null
  type: NarrativeType
  created_at: string | null
}

// ----- Aspect -----
export interface PersonaAspect {
  id: string
  user_id: number
  name: string
  description: string | null
  strength_score: number | null
  tension_score: number | null
  active: boolean
  created_at: string | null
  updated_at: string | null
}

// ----- Drift -----
export interface IdentityDriftSignal {
  id: string
  user_id: number
  source: string
  description: string
  severity: string
  detected_at: string | null
}

// ----- Dashboard -----
export interface PersonaDashboardResponse {
  profile: PersonaIdentityProfile | null
  values_count: number
  principles_count: number
  narrative_count: number
  aspects_count: number
  drift_signals_count: number
  alignment_insights: string[]
  drift_signals: IdentityDriftSignal[]
}

export const personaLabService = {
  getDashboard: () =>
    api.get<PersonaDashboardResponse>(`${PREFIX}/dashboard`),

  getProfile: () =>
    api.get<PersonaIdentityProfile>(`${PREFIX}/profile`),
  updateProfile: (body: Partial<PersonaIdentityProfile>) =>
    api.patch<PersonaIdentityProfile>(`${PREFIX}/profile`, body),

  listValues: () =>
    api.get<PersonaValue[]>(`${PREFIX}/values`),
  createValue: (body: { name: string; description?: string; priority_score?: number }) =>
    api.post<PersonaValue>(`${PREFIX}/values`, body),
  updateValue: (id: string, body: Partial<PersonaValue>) =>
    api.patch<PersonaValue>(`${PREFIX}/values/${id}`, body),
  deleteValue: (id: string) =>
    api.delete<unknown>(`${PREFIX}/values/${id}`),

  listPrinciples: (activeOnly?: boolean) => {
    const q = activeOnly ? '?active_only=true' : ''
    return api.get<PersonaPrinciple[]>(`${PREFIX}/principles${q}`)
  },
  createPrinciple: (body: { title: string; description?: string; active?: boolean }) =>
    api.post<PersonaPrinciple>(`${PREFIX}/principles`, body),
  updatePrinciple: (id: string, body: Partial<PersonaPrinciple>) =>
    api.patch<PersonaPrinciple>(`${PREFIX}/principles/${id}`, body),
  deletePrinciple: (id: string) =>
    api.delete<unknown>(`${PREFIX}/principles/${id}`),

  listNarrative: (params?: { type?: string; limit?: number }) => {
    const search = new URLSearchParams()
    if (params?.type) search.set('type', params.type)
    if (params?.limit != null) search.set('limit', String(params.limit))
    const q = search.toString() ? `?${search}` : ''
    return api.get<PersonaNarrativeEntry[]>(`${PREFIX}/narrative${q}`)
  },
  createNarrative: (body: {
    title: string
    description?: string
    time_period?: string
    type: string
  }) =>
    api.post<PersonaNarrativeEntry>(`${PREFIX}/narrative`, body),
  deleteNarrative: (id: string) =>
    api.delete<unknown>(`${PREFIX}/narrative/${id}`),

  listAspects: (activeOnly?: boolean) => {
    const q = activeOnly ? '?active_only=true' : ''
    return api.get<PersonaAspect[]>(`${PREFIX}/aspects${q}`)
  },
  createAspect: (body: {
    name: string
    description?: string
    strength_score?: number
    tension_score?: number
    active?: boolean
  }) =>
    api.post<PersonaAspect>(`${PREFIX}/aspects`, body),
  updateAspect: (id: string, body: Partial<PersonaAspect>) =>
    api.patch<PersonaAspect>(`${PREFIX}/aspects/${id}`, body),
  deleteAspect: (id: string) =>
    api.delete<unknown>(`${PREFIX}/aspects/${id}`),

  listDriftSignals: (limit?: number) => {
    const q = limit != null ? `?limit=${limit}` : ''
    return api.get<IdentityDriftSignal[]>(`${PREFIX}/drift${q}`)
  },
  createDriftSignal: (body: { source: string; description: string; severity?: string }) =>
    api.post<IdentityDriftSignal>(`${PREFIX}/drift`, body),
  deleteDriftSignal: (id: string) =>
    api.delete<unknown>(`${PREFIX}/drift/${id}`),
}
