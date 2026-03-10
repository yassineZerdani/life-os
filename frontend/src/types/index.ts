export interface Domain {
  id: number
  slug: string
  name: string
  layer: string
  description?: string
  icon?: string
  created_at?: string
  updated_at?: string
}

export interface Metric {
  id: string
  name: string
  domain: string
  unit: string
  weight?: number
  created_at?: string
  updated_at?: string
}

export interface MetricEntry {
  id: string
  metric_id: string
  value: number
  timestamp: string
  note?: string
  created_at?: string
}

export interface Goal {
  id: number
  title: string
  description?: string
  domain_id: number
  progress: number
  target_value?: number
  target_unit?: string
  deadline?: string
  status: string
  created_at?: string
  updated_at?: string
}

export interface Experience {
  id: number
  title: string
  description?: string
  date: string
  location?: string
  photos: string[]
  people_involved: string[]
  emotional_rating?: number
  created_at?: string
  updated_at?: string
}

export interface Relationship {
  id: number
  name: string
  relationship_type: string
  notes?: string
  last_contact_date?: string
  important_dates: Record<string, unknown>[]
  created_at?: string
  updated_at?: string
}

export interface Achievement {
  id: string
  title: string
  description?: string
  domain?: string
  date?: string
  xp_awarded?: number
  created_at?: string
  updated_at?: string
}

export interface Note {
  id: number
  title: string
  content: string
  domain_id: number
  created_at?: string
  updated_at?: string
}

export interface DomainScore {
  id?: string
  domain: string
  domain_name: string
  score: number
  level?: number
  xp?: number
  xp_required?: number
  xp_progress?: number
  updated_at?: string
}

export interface TimelineEvent {
  type: 'life_event' | 'experience' | 'achievement' | 'xp_event' | 'metric'
  id: string
  timestamp: string
  title: string
  description?: string
  domain?: string
  event_type?: string
  xp_awarded?: number
}

export interface XPEvent {
  id: string
  domain: string
  xp_amount: number
  reason: string
  source_type: string
  source_id?: string
  created_at?: string
}

export interface LifeEvent {
  id: string
  title: string
  description?: string
  domain: string
  event_type: string
  date?: string
  xp_awarded: number
  created_at?: string
}

export interface RecentActivity {
  type: 'metric' | 'experience' | 'achievement' | 'xp_event' | 'life_event'
  id: string
  timestamp: string
  title: string
  domain?: string
}

export interface MetricsTrend {
  name: string
  unit: string
  data: { timestamp: string; value: number }[]
}

export interface GoalProgress {
  id: number
  title: string
  progress: number
  target_value?: number
  target_unit?: string
  deadline?: string
  domain_id: number
}

export interface Insight {
  id: string
  type: 'trend' | 'warning' | 'imbalance' | 'achievement' | 'prediction'
  domain?: string
  message: string
  severity: 'low' | 'medium' | 'high'
  created_at?: string
  resolved: boolean
}
