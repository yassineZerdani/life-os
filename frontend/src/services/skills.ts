import { api } from './api'

export interface SkillProgress {
  id: string
  skill_id: string
  level: number
  xp: number
  confidence_score?: number
  decay_risk?: number
  last_practiced_at?: string
}

export interface Skill {
  id: string
  user_id: number
  name: string
  category?: string
  description?: string
  parent_skill_id?: string
  active: string
  created_at?: string
  updated_at?: string
  progress?: SkillProgress
  subskills?: Skill[]
}

export interface PracticeSession {
  id: string
  skill_id: string
  date: string
  duration_minutes: number
  difficulty?: string
  focus_area?: string
  mistakes_notes?: string
  feedback_notes?: string
  energy_level?: string
  quality_score?: number
  created_at?: string
}

export interface Artifact {
  id: string
  skill_id: string
  type: string
  title: string
  description?: string
  file_url?: string
  link_url?: string
  created_at?: string
}

export interface Weakness {
  id: string
  skill_id: string
  weakness_name: string
  severity: string
  notes?: string
  created_at?: string
}

export interface SkillTreeNode {
  skill: Skill
  children: SkillTreeNode[]
  total_xp: number
  session_count: number
  days_since_practice?: number
  decay_risk?: number
}

export interface IntelligenceInsight {
  type: string
  skill_id: string
  skill_name: string
  message: string
  severity: string
  payload?: Record<string, unknown>
}

export interface RecommendedDrill {
  skill_id: string
  skill_name: string
  focus_area?: string
  reason: string
  priority: number
}

export interface SkillDashboard {
  root_skills: SkillTreeNode[]
  insights: IntelligenceInsight[]
  recommended_drills: RecommendedDrill[]
  decay_warnings: IntelligenceInsight[]
}

export const skillsService = {
  list: (activeOnly = true) =>
    api.get<Skill[]>(`/skills?active_only=${activeOnly}`),
  getDashboard: () => api.get<SkillDashboard>('/skills/dashboard'),
  getTree: () => api.get<SkillTreeNode[]>('/skills/tree'),
  getById: (id: string) => api.get<Skill>(`/skills/${id}`),
  create: (data: { name: string; category?: string; description?: string; parent_skill_id?: string; active?: string }) =>
    api.post<Skill>('/skills', data),
  update: (id: string, data: Partial<Pick<Skill, 'name' | 'category' | 'description' | 'parent_skill_id' | 'active'>>) =>
    api.patch<Skill>(`/skills/${id}`, data),
  delete: (id: string) => api.delete(`/skills/${id}`),

  listSessions: (skillId: string) =>
    api.get<PracticeSession[]>(`/skills/${skillId}/sessions`),
  createSession: (data: {
    skill_id: string
    date: string
    duration_minutes: number
    difficulty?: string
    focus_area?: string
    mistakes_notes?: string
    feedback_notes?: string
    energy_level?: string
    quality_score?: number
  }) => api.post<PracticeSession>('/skills/sessions', data),

  listArtifacts: (skillId: string) =>
    api.get<Artifact[]>(`/skills/${skillId}/artifacts`),
  listAllArtifacts: () => api.get<Artifact[]>('/skills/artifacts/vault'),
  createArtifact: (data: { skill_id: string; type: string; title: string; description?: string; file_url?: string; link_url?: string }) =>
    api.post<Artifact>('/skills/artifacts', data),
  deleteArtifact: (id: string) => api.delete(`/skills/artifacts/${id}`),

  listWeaknesses: (skillId: string) =>
    api.get<Weakness[]>(`/skills/${skillId}/weaknesses`),
  createWeakness: (data: { skill_id: string; weakness_name: string; severity?: string; notes?: string }) =>
    api.post<Weakness>('/skills/weaknesses', data),
  deleteWeakness: (id: string) => api.delete(`/skills/weaknesses/${id}`),
}
