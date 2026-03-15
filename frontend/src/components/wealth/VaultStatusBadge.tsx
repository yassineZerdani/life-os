/**
 * Vault Status Badge — lock status with premium styling.
 */
import { LOCK_STATUS_CONFIG } from './vaultDesign'
import type { WealthVault } from '../../services/wealthVault'

export function VaultStatusBadge({ vault }: { vault: WealthVault }) {
  const config = LOCK_STATUS_CONFIG[vault.lock_status] ?? LOCK_STATUS_CONFIG.draft

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        background: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}40`,
      }}
    >
      {config.label}
    </span>
  )
}
