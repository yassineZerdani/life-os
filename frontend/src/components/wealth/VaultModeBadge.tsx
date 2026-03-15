/**
 * Vault Mode Badge — soft vs real, trust messaging.
 */
import { LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import type { WealthVault } from '../../services/wealthVault'
import { useTheme } from '../../hooks/useTheme'

export function VaultModeBadge({ vault }: { vault: WealthVault }) {
  const theme = useTheme()
  const isReal = vault.vault_type === 'real'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        background: isReal ? 'rgba(245, 158, 11, 0.15)' : theme.hoverBg,
        color: isReal ? '#f59e0b' : theme.textSecondary,
        border: `1px solid ${isReal ? 'rgba(245, 158, 11, 0.3)' : theme.contentCardBorder}`,
      }}
    >
      {isReal ? <SafetyCertificateOutlined /> : <LockOutlined />}
      {isReal ? 'Partner-backed' : 'In-app lock'}
    </span>
  )
}
