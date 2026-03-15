/**
 * Balance Distribution — elegant stacked visualization of available, locked, pending.
 * Segmented financial balance card.
 */
import { Card, Typography } from 'antd'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

interface BalanceDistributionCardProps {
  available: number
  locked: number
  pending: number
  currency?: string
  compact?: boolean
}

const formatMoney = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

export function BalanceDistributionCard({ available, locked, pending, currency = 'USD', compact }: BalanceDistributionCardProps) {
  const theme = useTheme()
  const total = available + locked + pending
  const availablePct = total > 0 ? (available / total) * 100 : 0
  const lockedPct = total > 0 ? (locked / total) * 100 : 0
  const pendingPct = total > 0 ? (pending / total) * 100 : 0

  return (
    <Card
      size={compact ? 'small' : undefined}
      style={{
        borderRadius: 12,
        border: `1px solid ${theme.contentCardBorder}`,
        background: theme.contentCardBg ?? theme.cardBg,
      }}
    >
      <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Balance breakdown
      </Text>
      <div
        style={{
          display: 'flex',
          height: compact ? 8 : 12,
          borderRadius: 6,
          overflow: 'hidden',
          marginTop: 12,
          background: theme.hoverBg,
        }}
      >
        {available > 0 && (
          <div
            style={{
              width: `${availablePct}%`,
              background: '#22c55e',
              transition: 'width 0.4s ease',
            }}
            title={`Available: ${formatMoney(available, currency)}`}
          />
        )}
        {locked > 0 && (
          <div
            style={{
              width: `${lockedPct}%`,
              background: theme.accent,
              transition: 'width 0.4s ease',
            }}
            title={`Locked: ${formatMoney(locked, currency)}`}
          />
        )}
        {pending > 0 && (
          <div
            style={{
              width: `${pendingPct}%`,
              background: '#f59e0b',
              transition: 'width 0.4s ease',
            }}
            title={`Pending: ${formatMoney(pending, currency)}`}
          />
        )}
      </div>
      <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: '#22c55e' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>Available</Text>
          <Text strong style={{ fontSize: 13 }}>{formatMoney(available, currency)}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: theme.accent }} />
          <Text type="secondary" style={{ fontSize: 12 }}>Locked</Text>
          <Text strong style={{ fontSize: 13 }}>{formatMoney(locked, currency)}</Text>
        </div>
        {pending > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: '#f59e0b' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>Pending</Text>
            <Text strong style={{ fontSize: 13 }}>{formatMoney(pending, currency)}</Text>
          </div>
        )}
      </div>
    </Card>
  )
}
