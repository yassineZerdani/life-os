import { api } from './api'

export interface WealthAccount {
  id: string
  user_id: number
  account_type: string
  provider: string
  provider_account_id?: string
  currency: string
  available_balance: number
  locked_balance: number
  pending_balance: number
  status: string
  created_at: string
  updated_at?: string
}

export interface FundingSource {
  id: string
  user_id: number
  source_type: string
  provider: string
  provider_source_id?: string
  label: string
  last4?: string
  brand?: string
  active: number
  created_at: string
}

export interface WealthVault {
  id: string
  user_id: number
  wealth_account_id: string
  name: string
  description?: string
  vault_type: 'soft' | 'real'
  target_amount?: number
  current_amount: number
  unlock_date: string
  lock_status: 'draft' | 'active' | 'locked' | 'unlockable' | 'unlocked' | 'withdrawn' | 'broken'
  break_early_allowed: number
  break_early_penalty_type?: string
  break_early_penalty_value?: number
  auto_unlock: number
  payout_destination_type?: string
  currency: string
  created_at: string
  updated_at?: string
}

export interface VaultTransaction {
  id: string
  vault_id: string
  transaction_type: string
  amount: number
  currency: string
  status: string
  source_type?: string
  source_id?: string
  notes?: string
  provider_reference?: string
  created_at: string
}

export interface LedgerEntry {
  id: string
  user_id: number
  wealth_account_id: string
  vault_id?: string
  entry_type: string
  amount: number
  balance_bucket: string
  direction: string
  reference_type: string
  reference_id: string
  created_at: string
}

export const wealthVaultService = {
  // Accounts
  listAccounts: () => api.get<WealthAccount[]>('/wealth/accounts'),
  createAccount: () => api.post<WealthAccount>('/wealth/accounts', {}),
  addFunds: (data: { amount: number; funding_source_id?: string; currency?: string }) =>
    api.post<WealthAccount>('/wealth/accounts/add-funds', data),

  // Funding sources
  listFundingSources: () => api.get<FundingSource[]>('/wealth/funding-sources'),
  createFundingSource: (data: { source_type: string; label: string; last4?: string; brand?: string }) =>
    api.post<FundingSource>('/wealth/funding-sources', data),

  // Vaults
  listVaults: () => api.get<WealthVault[]>('/wealth/vaults'),
  createVault: (data: {
    name: string
    description?: string
    target_amount?: number
    unlock_date: string
    vault_type?: string
    break_early_allowed?: boolean
    break_early_penalty_type?: string
    break_early_penalty_value?: number
    auto_unlock?: boolean
    currency?: string
  }) => api.post<WealthVault>('/wealth/vaults', data),
  getVault: (id: string) => api.get<WealthVault>(`/wealth/vaults/${id}`),
  fundVault: (id: string, data: { amount: number; funding_source_id?: string }) =>
    api.post<WealthVault>(`/wealth/vaults/${id}/fund`, data),
  lockVault: (id: string) => api.post<WealthVault>(`/wealth/vaults/${id}/lock`, {}),
  unlockVault: (id: string) => api.post<WealthVault>(`/wealth/vaults/${id}/unlock`, {}),
  breakVault: (id: string) => api.post<WealthVault>(`/wealth/vaults/${id}/break`, {}),
  listVaultTransactions: (id: string) => api.get<VaultTransaction[]>(`/wealth/vaults/${id}/transactions`),

  // Ledger
  getLedger: (params?: { vault_id?: string; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.vault_id) q.set('vault_id', params.vault_id)
    if (params?.limit) q.set('limit', String(params.limit))
    const query = q.toString()
    return api.get<LedgerEntry[]>(`/wealth/ledger${query ? `?${query}` : ''}`)
  },

  // Compliance
  getComplianceProfile: () => api.get<{ id: string; kyc_status: string; risk_level?: string } | null>('/wealth/compliance/profile'),
  createComplianceProfile: (data: { kyc_status?: string; risk_level?: string }) =>
    api.post('/wealth/compliance/profile', data),

  // Widgets (Control Room)
  getWidgets: () =>
    api.get<{
      total_vaulted: number
      locked_balance: number
      available_balance: number
      next_unlock: { vault_id: string; vault_name: string; date: string; amount: number } | null
      emergency_fund_progress: number
      vault_discipline_score: number
      vault_count: number
    }>('/wealth/widgets'),
}
