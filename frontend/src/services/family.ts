import { api } from './api'

export interface FamilyMember {
  id: string
  user_id: number
  name: string
  relationship_type: string
  birth_date?: string
  contact_info?: string
  notes?: string
  closeness_score?: number
  tension_score?: number
  support_level?: string
  parent_id?: string
  created_at?: string
  updated_at?: string
}

export interface FamilyInteraction {
  id: string
  family_member_id: string
  user_id: number
  interaction_type: string
  date: string
  emotional_tone?: string
  notes?: string
  created_at?: string
}

export interface FamilyResponsibility {
  id: string
  user_id: number
  family_member_id?: string
  title: string
  description?: string
  due_date?: string
  status: string
  category: string
  created_at?: string
  updated_at?: string
}

export interface FamilyMemory {
  id: string
  user_id: number
  family_member_id?: string
  title: string
  description?: string
  date?: string
  media_url?: string
  tags?: string[]
  created_at?: string
}

export interface FamilyDynamicNote {
  id: string
  user_id: number
  family_member_id?: string
  pattern_type: string
  trigger_notes?: string
  safe_topics?: string
  difficult_topics?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface FamilyDashboard {
  members: FamilyMember[]
  responsibilities_pending: number
  recent_interactions_count: number
  memories_count: number
  high_support_members: FamilyMember[]
}

export const familyService = {
  getDashboard: () => api.get<FamilyDashboard>('/family/dashboard'),
  listMembers: (relationship_type?: string) =>
    api.get<FamilyMember[]>(`/family/members${relationship_type ? `?relationship_type=${relationship_type}` : ''}`),
  getMember: (id: string) => api.get<FamilyMember>(`/family/members/${id}`),
  createMember: (data: Partial<FamilyMember> & { name: string; relationship_type: string }) =>
    api.post<FamilyMember>('/family/members', data),
  updateMember: (id: string, data: Partial<FamilyMember>) =>
    api.patch<FamilyMember>(`/family/members/${id}`, data),
  deleteMember: (id: string) => api.delete(`/family/members/${id}`),

  listInteractions: (memberId: string) =>
    api.get<FamilyInteraction[]>(`/family/members/${memberId}/interactions`),
  createInteraction: (data: { family_member_id: string; interaction_type: string; date: string; emotional_tone?: string; notes?: string }) =>
    api.post<FamilyInteraction>('/family/interactions', data),

  listResponsibilities: (status?: string, family_member_id?: string) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (family_member_id) params.set('family_member_id', family_member_id)
    return api.get<FamilyResponsibility[]>(`/family/responsibilities${params.toString() ? `?${params.toString()}` : ''}`)
  },
  createResponsibility: (data: Partial<FamilyResponsibility> & { title: string; category: string }) =>
    api.post<FamilyResponsibility>('/family/responsibilities', data),
  updateResponsibility: (id: string, data: Partial<FamilyResponsibility>) =>
    api.patch<FamilyResponsibility>(`/family/responsibilities/${id}`, data),
  deleteResponsibility: (id: string) => api.delete(`/family/responsibilities/${id}`),

  listMemories: (family_member_id?: string, limit?: number) => {
    const params = new URLSearchParams()
    if (family_member_id) params.set('family_member_id', family_member_id)
    if (limit != null) params.set('limit', String(limit))
    return api.get<FamilyMemory[]>(`/family/memories${params.toString() ? `?${params.toString()}` : ''}`)
  },
  createMemory: (data: Partial<FamilyMemory> & { title: string }) =>
    api.post<FamilyMemory>('/family/memories', data),
  deleteMemory: (id: string) => api.delete(`/family/memories/${id}`),

  listDynamicNotes: (family_member_id?: string) =>
    api.get<FamilyDynamicNote[]>(`/family/dynamic-notes${family_member_id ? `?family_member_id=${family_member_id}` : ''}`),
  createDynamicNote: (data: Partial<FamilyDynamicNote> & { pattern_type: string }) =>
    api.post<FamilyDynamicNote>('/family/dynamic-notes', data),
  deleteDynamicNote: (id: string) => api.delete(`/family/dynamic-notes/${id}`),
}
