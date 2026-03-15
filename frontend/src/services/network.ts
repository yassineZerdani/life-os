import { api } from './api'

export interface Contact {
  id: string
  user_id: number
  name: string
  category: string
  company?: string | null
  role?: string | null
  notes?: string | null
  trust_score?: number | null
  warmth_score?: number | null
  opportunity_score?: number | null
  last_contact_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface ContactInteraction {
  id: string
  contact_id: string
  user_id: number
  interaction_type: string
  date: string
  tone?: string | null
  notes?: string | null
  created_at?: string
}

export interface ConnectionOpportunity {
  id: string
  contact_id: string
  user_id: number
  opportunity_type: string
  title: string
  description?: string | null
  status: string
  potential_value?: number | null
  created_at?: string
  updated_at?: string
}

export interface ReciprocityEntry {
  id: string
  contact_id: string
  user_id: number
  support_given?: string | null
  support_received?: string | null
  notes?: string | null
  date: string
  created_at?: string
}

export interface Community {
  id: string
  user_id: number
  name: string
  type: string
  description?: string | null
  relevance_score?: number | null
  created_at?: string
  updated_at?: string
}

export interface DormantTieInfo {
  contact: Contact
  days_since_contact?: number | null
  reason: string
}

export interface NetworkDashboard {
  contacts_count: number
  dormant_count: number
  open_opportunities_count: number
  social_capital_score?: number | null
  insights: string[]
  dormant_ties: DormantTieInfo[]
}

export interface GraphNode {
  id: string
  label: string
  category: string
  trust_score?: number | null
  warmth_score?: number | null
  opportunity_score?: number | null
  is_dormant: boolean
}

export interface GraphEdge {
  source: string
  target: string
  label?: string | null
}

export interface NetworkGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export const networkService = {
  getDashboard: () => api.get<NetworkDashboard>('/network/dashboard'),
  getGraph: () => api.get<NetworkGraph>('/network/graph'),

  listContacts: (category?: string) => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    return api.get<Contact[]>(`/network/contacts?${params.toString()}`)
  },
  getContact: (id: string) => api.get<Contact>(`/network/contacts/${id}`),
  createContact: (data: {
    name: string
    category: string
    company?: string
    role?: string
    notes?: string
    trust_score?: number
    warmth_score?: number
    opportunity_score?: number
  }) => api.post<Contact>('/network/contacts', data),
  updateContact: (id: string, data: Partial<Contact>) =>
    api.patch<Contact>(`/network/contacts/${id}`, data),
  deleteContact: (id: string) => api.delete(`/network/contacts/${id}`),

  listInteractions: (contactId: string, limit = 50) =>
    api.get<ContactInteraction[]>(
      `/network/contacts/${contactId}/interactions?limit=${limit}`
    ),
  createInteraction: (data: {
    contact_id: string
    interaction_type: string
    date: string
    tone?: string
    notes?: string
  }) => api.post<ContactInteraction>('/network/interactions', data),

  listOpportunities: (status?: string, contactId?: string) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (contactId) params.set('contact_id', contactId)
    return api.get<ConnectionOpportunity[]>(
      `/network/opportunities?${params.toString()}`
    )
  },
  createOpportunity: (data: {
    contact_id: string
    opportunity_type: string
    title: string
    description?: string
    status?: string
    potential_value?: number
  }) => api.post<ConnectionOpportunity>('/network/opportunities', data),
  updateOpportunity: (id: string, data: Partial<ConnectionOpportunity>) =>
    api.patch<ConnectionOpportunity>(`/network/opportunities/${id}`, data),
  deleteOpportunity: (id: string) => api.delete(`/network/opportunities/${id}`),

  listReciprocity: (contactId: string, limit = 50) =>
    api.get<ReciprocityEntry[]>(
      `/network/contacts/${contactId}/reciprocity?limit=${limit}`
    ),
  createReciprocity: (data: {
    contact_id: string
    support_given?: string
    support_received?: string
    notes?: string
    date: string
  }) => api.post<ReciprocityEntry>('/network/reciprocity', data),

  listCommunities: (type?: string) => {
    const params = new URLSearchParams()
    if (type) params.set('type_', type)
    return api.get<Community[]>(`/network/communities?${params.toString()}`)
  },
  createCommunity: (data: {
    name: string
    type: string
    description?: string
    relevance_score?: number
  }) => api.post<Community>('/network/communities', data),
  updateCommunity: (id: string, data: Partial<Community>) =>
    api.patch<Community>(`/network/communities/${id}`, data),
  deleteCommunity: (id: string) => api.delete(`/network/communities/${id}`),
}
