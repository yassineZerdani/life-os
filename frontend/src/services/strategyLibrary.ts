import { api } from './api'

export interface StrategyLibraryItem {
  id: string
  domain_key: string
  module_key?: string
  name: string
  category: string
  evidence_level: string
  impact_level: string
  difficulty_level: string
  description?: string
  when_to_use?: string
  contraindications?: string
  active: boolean
  created_at?: string
}

export interface ProtocolStep {
  id: string
  order_index: number
  title: string
  description?: string
  frequency?: string
  target_metric_key?: string
  xp_reward: number
}

export interface StrategyProtocol {
  id: string
  name: string
  cadence: string
  duration_days?: number
  instructions_json?: Record<string, unknown>
  created_at?: string
  steps: ProtocolStep[]
}

export interface StrategyWithProtocols extends StrategyLibraryItem {
  protocols: StrategyProtocol[]
}

export interface StrategyRecommendation {
  strategy_id: string
  strategy_name: string
  protocol_id: string
  protocol_name: string
  why_recommended: string
  evidence_level: string
  estimated_benefit: string
  estimated_effort: string
  domain_key: string
  module_source?: string
  category: string
}

export interface ActiveProtocol {
  id: string
  protocol_id: string
  strategy_id: string
  strategy_name: string
  protocol_name: string
  domain_key: string
  category: string
  evidence_level: string
  impact_level: string
  difficulty_level: string
  module_key?: string
  started_at?: string
  active: boolean
  adherence_score: number
  effectiveness_score?: number
  notes?: string
  steps: ProtocolStep[]
}

export const strategyLibraryService = {
  list: (params?: { domain_key?: string; category?: string }) => {
    const q = new URLSearchParams()
    if (params?.domain_key) q.set('domain_key', params.domain_key)
    if (params?.category) q.set('category', params.category)
    const query = q.toString()
    return api.get<StrategyLibraryItem[]>(`/strategy-library${query ? `?${query}` : ''}`)
  },

  listByDomain: (domainKey: string, category?: string) => {
    const q = category ? `?category=${encodeURIComponent(category)}` : ''
    return api.get<StrategyLibraryItem[]>(`/strategy-library/domains/${domainKey}${q}`)
  },

  getDetail: (strategyId: string) =>
    api.get<StrategyWithProtocols>(`/strategy-library/items/${strategyId}`),

  recommendations: (limit = 10, domainKey?: string) => {
    const params = new URLSearchParams({ limit: String(limit) })
    if (domainKey) params.set('domain_key', domainKey)
    return api.get<StrategyRecommendation[]>(`/strategy-library/recommendations?${params}`)
  },

  activeProtocols: () =>
    api.get<ActiveProtocol[]>(`/strategy-library/protocols/active`),

  activateProtocol: (protocolId: string) =>
    api.post<{ id: string; protocol_id: string; started_at?: string; active: boolean }>(
      '/strategy-library/protocols/activate',
      { protocol_id: protocolId }
    ),

  deactivateProtocol: (userActiveProtocolId: string) =>
    api.post<{ success: boolean }>(
      `/strategy-library/protocols/${userActiveProtocolId}/deactivate`,
      {}
    ),

  checkin: (
    userActiveProtocolId: string,
    body: { completed_steps_json?: unknown[]; adherence_value?: number; notes?: string }
  ) =>
    api.post<{ id: string; checked_at?: string; adherence_value?: number }>(
      `/strategy-library/protocols/${userActiveProtocolId}/checkin`,
      body
    ),

  updateAdherence: (userActiveProtocolId: string, score: number) =>
    api.patch<{ success: boolean }>(
      `/strategy-library/protocols/${userActiveProtocolId}/adherence`,
      { score }
    ),
}
