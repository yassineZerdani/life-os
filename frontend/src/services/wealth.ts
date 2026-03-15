import { api } from './api'

export interface BudgetCategory {
  id: string
  key: string
  label: string
  target_percentage: number
  display_order?: number
}

export interface BudgetAllocation {
  id: string
  finance_profile_id: string
  category_key: string
  target_percentage: number
}

export interface Expense {
  id: string
  finance_profile_id: string
  amount: number
  currency?: string
  category: string
  description?: string
  occurred_at: string
}

export interface IncomeEntry {
  id: string
  finance_profile_id: string
  amount: number
  currency?: string
  income_source_id?: string
  occurred_at: string
  automation_applied?: number
}

export interface MoneyVault {
  id: string
  finance_profile_id: string
  name: string
  description?: string
  target_amount: number
  current_amount: number
  currency?: string
  unlock_date: string
  allocation_key?: string
}

export interface InvestmentAllocationItem {
  allocation_key: string
  label?: string
  percentage: number
}

export interface InvestmentStrategy {
  id: string
  finance_profile_id: string
  name: string
  label?: string
  is_active?: number
  allocations: InvestmentAllocationItem[]
}

export interface InvestmentAccount {
  id: string
  finance_profile_id: string
  name: string
  account_type?: string
  allocation_key?: string
  balance: number
  currency?: string
}

export interface BudgetDistributionItem {
  category_key: string
  label: string
  target_percentage: number
  spent_amount: number
  spent_percentage: number
  is_over: boolean
}

export interface WealthDashboard {
  net_worth?: number
  total_income_this_month?: number
  budget_distribution: BudgetDistributionItem[]
  vaults: MoneyVault[]
  investment_accounts: InvestmentAccount[]
  active_strategy?: InvestmentStrategy | null
}

export const wealthService = {
  getDashboard: () => api.get<WealthDashboard>('/wealth/dashboard'),
  listBudgetCategories: () => api.get<BudgetCategory[]>('/wealth/budget-categories'),
  listBudgetAllocations: () => api.get<BudgetAllocation[]>('/wealth/budget-allocations'),
  upsertBudgetAllocation: (data: { category_key: string; target_percentage: number }) =>
    api.post<BudgetAllocation>('/wealth/budget-allocations', data),
  listExpenses: (params?: { category?: string; month?: string }) => {
    const q = new URLSearchParams()
    if (params?.category) q.set('category', params.category)
    if (params?.month) q.set('month', params.month)
    const query = q.toString()
    return api.get<Expense[]>(`/wealth/expenses${query ? `?${query}` : ''}`)
  },
  createExpense: (data: { amount: number; currency?: string; category: string; description?: string }) =>
    api.post<Expense>('/wealth/expenses', data),
  listIncomeEntries: () => api.get<IncomeEntry[]>('/wealth/income-entries'),
  createIncomeEntry: (data: { amount: number; currency?: string; income_source_id?: string; notes?: string }) =>
    api.post<IncomeEntry>('/wealth/income-entries', data),
  listIncomeSources: () => api.get<{ id: string; name: string; amount_monthly?: number; currency?: string }[]>('/wealth/income-sources'),
  listVaults: () => api.get<MoneyVault[]>('/wealth/savings-vaults'),
  createVault: (data: {
    name: string
    description?: string
    target_amount: number
    currency?: string
    unlock_date: string
    allocation_key?: string
  }) => api.post<MoneyVault>('/wealth/savings-vaults', data),
  addToVault: (vaultId: string, amount: number) =>
    api.post<MoneyVault>(`/wealth/savings-vaults/${vaultId}/add`, { amount }),
  updateVault: (vaultId: string, data: Partial<{ name: string; description: string; target_amount: number; unlock_date: string }>) =>
    api.patch<MoneyVault>(`/wealth/savings-vaults/${vaultId}`, data),
  listStrategies: () => api.get<InvestmentStrategy[]>('/wealth/strategies'),
  createStrategy: (data: {
    name: string
    label?: string
    allocations: { allocation_key: string; label?: string; percentage: number }[]
  }) => api.post<InvestmentStrategy>('/wealth/strategies', data),
  activateStrategy: (strategyId: string) =>
    api.post<InvestmentStrategy>(`/wealth/strategies/${strategyId}/activate`, {}),
  listInvestmentAccounts: () => api.get<InvestmentAccount[]>('/wealth/investment-accounts'),
  createInvestmentAccount: (data: { name: string; account_type?: string; allocation_key?: string; currency?: string }) =>
    api.post<InvestmentAccount>('/wealth/investment-accounts', data),
}
