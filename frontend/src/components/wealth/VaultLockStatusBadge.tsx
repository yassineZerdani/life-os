import { Tag } from 'antd'
import type { WealthVault } from '../../services/wealthVault'

const STATUS_COLORS: Record<string, string> = {
  draft: 'default',
  active: 'processing',
  locked: 'blue',
  unlockable: 'green',
  unlocked: 'success',
  withdrawn: 'cyan',
  broken: 'orange',
}

export function VaultLockStatusBadge({ vault }: { vault: WealthVault }) {
  const color = STATUS_COLORS[vault.lock_status] || 'default'
  const label = vault.lock_status.charAt(0).toUpperCase() + vault.lock_status.slice(1)
  return <Tag color={color}>{label}</Tag>
}
