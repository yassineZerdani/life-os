/**
 * Money Vault design tokens — premium fintech aesthetic.
 * Category icons, status colors, trust messaging.
 */

export const VAULT_CATEGORIES: Record<string, { icon: string; label: string; color: string }> = {
  emergency: { icon: '🛡️', label: 'Emergency Fund', color: '#22c55e' },
  vacation: { icon: '✈️', label: 'Vacation', color: '#0ea5e9' },
  tax: { icon: '📋', label: 'Tax Reserve', color: '#f59e0b' },
  business: { icon: '💼', label: 'Business Buffer', color: '#6366f1' },
  wedding: { icon: '💒', label: 'Marriage Fund', color: '#ec4899' },
  education: { icon: '🎓', label: 'Education', color: '#8b5cf6' },
  car: { icon: '🚗', label: 'Car Fund', color: '#14b8a6' },
  default: { icon: '🔒', label: 'Savings', color: '#64748b' },
}

export function getVaultCategory(name: string, description?: string): { icon: string; label: string; color: string } {
  const text = `${(name || '').toLowerCase()} ${(description || '').toLowerCase()}`
  for (const [key, cat] of Object.entries(VAULT_CATEGORIES)) {
    if (key !== 'default' && text.includes(key)) return cat
  }
  return VAULT_CATEGORIES.default
}

export const LOCK_STATUS_CONFIG: Record<string, { label: string; color: string; tone: 'success' | 'warning' | 'error' | 'info' | 'neutral' }> = {
  draft: { label: 'Draft', color: '#64748b', tone: 'neutral' },
  active: { label: 'Active', color: '#0ea5e9', tone: 'info' },
  locked: { label: 'Locked', color: '#6366f1', tone: 'info' },
  unlockable: { label: 'Ready to unlock', color: '#22c55e', tone: 'success' },
  unlocked: { label: 'Unlocked', color: '#22c55e', tone: 'success' },
  withdrawn: { label: 'Withdrawn', color: '#64748b', tone: 'neutral' },
  broken: { label: 'Broken early', color: '#f59e0b', tone: 'warning' },
}

export const TRANSACTION_TYPE_CONFIG: Record<string, { label: string; color: string; direction: 'in' | 'out' | 'neutral' }> = {
  fund: { label: 'Funding', color: '#22c55e', direction: 'in' },
  add_funds: { label: 'Add funds', color: '#22c55e', direction: 'in' },
  lock: { label: 'Locked', color: '#6366f1', direction: 'neutral' },
  unlock: { label: 'Unlocked', color: '#22c55e', direction: 'out' },
  payout: { label: 'Payout', color: '#0ea5e9', direction: 'out' },
  break_early: { label: 'Break early', color: '#f59e0b', direction: 'out' },
  fee: { label: 'Fee', color: '#ef4444', direction: 'out' },
  reverse: { label: 'Reversed', color: '#64748b', direction: 'neutral' },
}
