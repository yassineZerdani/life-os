/** Control Room Dashboard types */

export interface DomainCard {
  domain: string
  domain_name: string
  score: number
  level: number
  xp: number
  xp_required: number
  xp_progress: number
  trend: number
  last_activity: string | null
  risk: 'strong' | 'stable' | 'neglected' | 'declining'
}

export interface ControlRoomSummary {
  life_score: number
  total_level: number
  total_xp: number
  score_trend_week: number
  score_trend_month: number
  status: 'thriving' | 'stable' | 'unbalanced' | 'declining'
  summary: string
  domains: DomainCard[]
}

export interface Alert {
  id: string
  message: string
  severity: 'low' | 'medium' | 'high'
  domain: string | null
}

export interface Recommendation {
  action_template_id: string
  action: string
  domain: string
  impact: number
  estimated_score_gain: number
  xp_reward: number
  time_cost_minutes: number
  reason: string
}

export interface ForecastDomain {
  domain: string
  current_score: number
  predicted_score: number
  score_change: number
}

export interface Forecast {
  months_ahead: number
  domains: ForecastDomain[]
  summary: string
}

export interface InsightCard {
  id: string
  type: string
  severity: string
  domain: string | null
  message: string
}

export interface TimelineEvent {
  type: string
  id: string
  timestamp: string | null
  title: string
  description: string | null
  domain: string | null
  event_type: string | null
  xp_awarded: number | null
}

export interface QuestCard {
  id: string
  title: string
  progress: number
  target_value: number
  xp_reward: number
}

export interface AchievementCard {
  id: string
  title: string
  description?: string
  domain?: string
  xp_reward?: number
  unlocked_at?: string
}

export interface GraphNodePreview {
  id: string
  type: string
  name: string
  metadata: Record<string, unknown>
  created_at?: string
}

export interface GraphEdgePreview {
  id: string
  source_id: string
  target_id: string
  relation_type: string
  metadata: Record<string, unknown>
  created_at?: string
}

export interface GraphPreview {
  nodes: GraphNodePreview[]
  edges: GraphEdgePreview[]
}

export interface ActiveStrategyCard {
  id: string
  strategy_id: string
  domain: string
  name: string
  description?: string
  started_at?: string
  adherence_score: number
  steps: Array<{ id: string; title: string; frequency?: string; xp_reward: number }>
}

export interface ActiveProtocolCard {
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
  steps: Array<{ id: string; order_index: number; title: string; description?: string; frequency?: string; xp_reward: number }>
}

export interface StrategyRecommendationCard {
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

export interface ControlRoomFull {
  summary: ControlRoomSummary
  alerts: Alert[]
  recommendations: Recommendation[]
  forecast: Forecast
  weekly_time: Record<string, number>
  weekly_balance: Array<Record<string, string | number>>
  balance_score: number
  insights: InsightCard[]
  timeline: TimelineEvent[]
  quests: QuestCard[]
  achievements: AchievementCard[]
  active_strategies: ActiveStrategyCard[]
  active_protocols?: ActiveProtocolCard[]
  strategy_recommendations?: StrategyRecommendationCard[]
  graph_preview: GraphPreview
  recommended_article?: {
    id: string
    slug: string
    title: string
    summary: string | null
    reading_time_minutes: number | null
    category_name: string
  } | null
}
