import { api } from './api'

export interface DomainProjection {
  domain: string
  current_score: number
  predicted_score: number
  score_change: number
  current_level: number
  predicted_level: number
  current_xp: number
  predicted_xp: number
  weekly_xp_rate: number
}

export interface GoalPrediction {
  goal_id: number
  title: string
  domain?: string
  progress: number
  target: number
  months_to_complete: number
  message: string
}

/** Scenario for the life simulation engine (replaces simple sliders). */
export interface SimulationScenarioInput {
  activate_strategy?: string[]
  increase_habit_frequency?: Record<string, number>
  reduce_behavior?: Record<string, number>
  change_time_allocation?: Record<string, number>
}

export interface SimulationResult {
  months_ahead: number
  scenario: SimulationScenarioInput
  domains: DomainProjection[]
  goal_predictions: GoalPrediction[]
  analysis_period_days: number
  baseline_rates?: Record<string, number>
  weekly_series?: Array<{
    week: number
    domain_scores: Record<string, number>
    domain_levels?: Record<string, number>
    domain_xp?: Record<string, number>
    goal_progress?: Record<number, number>
    metrics?: Record<string, number>
  }>
  health_trends?: Record<string, number[]>
  finance_trends?: Record<string, number[]>
  life_state_summary?: {
    domain_scores: Record<string, number>
    time_distribution: Record<string, number>
    habits_count: number
    active_strategies_count: number
    goals_count: number
  }
}

export interface SimulationRun {
  id: string
  months_ahead: number
  scenario_parameters: SimulationScenarioInput
  result: SimulationResult
  created_at?: string
}

export interface SimulationContext {
  life_state_summary: {
    domain_scores: Record<string, number>
    time_distribution: Record<string, number>
    habits_count: number
    active_strategies_count: number
    goals_count: number
  }
  baseline_rates: Record<string, number>
  available_protocols: Array<{
    id: string
    name: string
    domain_key: string
    cadence: string
  }>
  habits: Array<{
    action_template_id: string
    title: string
    domain: string
    completions_per_week: number
    xp_per_completion: number
  }>
  domains: string[]
}

export const simulationService = {
  run: (params: { months: number; scenario?: SimulationScenarioInput }) =>
    api.post<SimulationResult>('/simulation/run', params),

  history: (limit?: number) => {
    const qs = limit != null ? `?limit=${limit}` : ''
    return api.get<SimulationRun[]>(`/simulation/history${qs}`)
  },

  context: () => api.get<SimulationContext>('/simulation/context'),
}
