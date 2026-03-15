import { api } from './api'

export interface JournalEntry {
  id: string
  user_id: number
  date: string
  title?: string
  raw_text?: string
  mood?: string
  energy?: string
  created_at?: string
  updated_at?: string
}

export interface JournalEntryListItem {
  id: string
  user_id: number
  date: string
  title?: string
  raw_text?: string
  mood?: string
  energy?: string
  created_at?: string
  updated_at?: string
}

export interface ExtractedSignal {
  id: string
  domain: string
  signal_type: string
  value_json?: Record<string, unknown>
  confidence?: number
  source_text?: string
}

export interface SuggestedDomainUpdate {
  id: string
  journal_entry_id: string
  domain: string
  update_type: string
  payload_json?: Record<string, unknown>
  confidence?: number
  status: string
}

export interface TodaySummary {
  entry: JournalEntry | null
  streak_days: number
  suggested_updates: SuggestedDomainUpdate[]
  extracted_signals: ExtractedSignal[]
}

export const journalService = {
  getToday: () => api.get<TodaySummary>('/journal/today'),
  listRecentEntries: (params?: { limit?: number; from_date?: string; to_date?: string }) => {
    const search = new URLSearchParams()
    search.set('limit', String(params?.limit ?? 20))
    if (params?.from_date) search.set('from_date', params.from_date)
    if (params?.to_date) search.set('to_date', params.to_date)
    return api.get<JournalEntryListItem[]>(`/journal/entries?${search.toString()}`)
  },
  updateToday: (data: { title?: string; raw_text?: string; mood?: string; energy?: string }) =>
    api.patch<JournalEntry>('/journal/today', data),
  analyzeToday: () =>
    api.post<{ suggested_count: number; entry_id: string }>('/journal/today/analyze'),
  getEntryByDate: (entryDate: string) =>
    api.get<JournalEntry>(`/journal/entries/${entryDate}`),
  listSuggestions: (entryId: string) =>
    api.get<SuggestedDomainUpdate[]>(`/journal/entries/${entryId}/suggestions`),
  confirmSuggestion: (suggestionId: string, status: 'confirmed' | 'rejected' | 'edited') =>
    api.patch<SuggestedDomainUpdate>(`/journal/suggestions/${suggestionId}`, { status }),
  editSuggestion: (suggestionId: string, payload_json?: Record<string, unknown>) =>
    api.patch<SuggestedDomainUpdate>(`/journal/suggestions/${suggestionId}/edit`, {
      status: 'edited',
      payload_json,
    }),
  getStreak: () => api.get<{ streak_days: number }>('/journal/streak'),
}
