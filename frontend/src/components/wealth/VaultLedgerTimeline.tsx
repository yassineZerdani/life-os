/**
 * Vault Ledger Timeline — clear transaction history with grouped types.
 * Easy to audit and understand.
 */
import { Typography } from 'antd'
import dayjs from 'dayjs'
import type { VaultTransaction } from '../../services/wealthVault'
import { useTheme } from '../../hooks/useTheme'
import { TRANSACTION_TYPE_CONFIG } from './vaultDesign'

const { Text } = Typography

const formatMoney = (n: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n)

export function VaultLedgerTimeline({ transactions }: { transactions: VaultTransaction[] }) {
  const theme = useTheme()

  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 32 }}>
        <Text type="secondary">No transactions yet. Fund or lock the vault to see activity.</Text>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {transactions.map((tx, i) => {
        const config = TRANSACTION_TYPE_CONFIG[tx.transaction_type] ?? {
          label: tx.transaction_type,
          color: theme.textSecondary,
          direction: 'neutral' as const,
        }
        const isIn = config.direction === 'in'
        const isOut = config.direction === 'out'
        const sign = isIn ? '+' : isOut ? '−' : ''

        return (
          <div
            key={tx.id}
            style={{
              display: 'flex',
              gap: 16,
              padding: '16px 0',
              borderBottom: i < transactions.length - 1 ? `1px solid ${theme.contentCardBorder}` : 'none',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${config.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 16, color: config.color }}>
                {sign || '•'}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
                <Text strong style={{ fontSize: 14 }}>{config.label}</Text>
                <Text
                  strong
                  style={{
                    fontSize: 15,
                    color: isIn ? '#22c55e' : isOut ? theme.textPrimary : theme.textSecondary,
                  }}
                >
                  {sign}{formatMoney(tx.amount, tx.currency)}
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(tx.created_at).format('MMM D, YYYY · HH:mm')}
              </Text>
              {tx.notes && (
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>{tx.notes}</Text>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: theme.hoverBg,
                    color: theme.textSecondary,
                  }}
                >
                  {tx.status}
                </span>
                {tx.source_type && (
                  <span style={{ fontSize: 11, color: theme.textMuted }}>{tx.source_type}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
