import { api } from './api'

export interface BodySystem {
  id: string
  key?: string
  slug: string
  name: string
  description: string | null
  display_order: number
  default_support_profile_json?: Record<string, unknown> | null
  default_metrics_json?: string[] | null
  default_signal_profile_json?: Record<string, unknown> | null
}

export interface Organ {
  id: string
  system_id: string
  key?: string
  slug: string
  name: string
  description: string | null
  detail_level?: 'full' | 'medium' | 'basic' | null
  parent_organ_id?: string | null
  anatomical_region?: string | null
  organ_type?: string | null
  has_custom_support_data?: boolean
  has_custom_metric_data?: boolean
  has_custom_signal_data?: boolean
  functions: string[]
  nutrition_requirements: string[]
  movement_requirements: string[]
  sleep_requirements: string[]
  signals: string[]
  symptoms: string[]
  metric_keys: string[]
  display_order: number
  map_region_id: string | null
  system?: BodySystem
}

export interface OrganHealthScore {
  score: number
  factors: Record<string, unknown>
  computed_at: string | null
}

export interface OrganDashboard {
  organ: Organ
  health_score: OrganHealthScore | null
  tracked_metrics: Array<{ name: string; unit: string; latest_value: number | null; timestamp: string | null }>
  risk_signals: string[]
  ai_insights: string[] | null
}

export const bodyIntelligenceService = {
  listBodySystems: () => api.get<BodySystem[]>('/body-intelligence/body-systems'),
  listOrgansBySystem: (systemId: string) =>
    api.get<Organ[]>(`/body-intelligence/body-systems/${systemId}/organs`),
  listOrgansForMap: () => api.get<Organ[]>(`/body-intelligence/organs`),
  getOrganBySlug: (slug: string) => api.get<Organ>(`/body-intelligence/organs/by-slug/${slug}`),
  getOrganDashboardBySlug: (slug: string) =>
    api.get<OrganDashboard>(`/body-intelligence/organs/by-slug/${slug}/dashboard`),
}
