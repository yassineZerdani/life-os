export interface StrategyStep {
  id: string
  title: string
  description?: string
  frequency?: string
  xp_reward: number
}

export interface Strategy {
  id: string
  domain: string
  name: string
  description?: string
  difficulty: string
  estimated_impact: number
  steps: StrategyStep[]
}

export interface ActiveStrategy {
  id: string
  strategy_id: string
  domain: string
  name: string
  description?: string
  started_at?: string
  adherence_score: number
  steps: Array<{ id: string; title: string; frequency?: string; xp_reward: number }>
}
