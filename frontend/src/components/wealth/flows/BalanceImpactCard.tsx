/**
 * BalanceImpactCard — shows current vs resulting balances.
 */
import { Card, Typography } from 'antd'
import { useTheme } from '../../../hooks/useTheme'

const { Text } = Typography

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

interface BalanceImpactCardProps {
  label: string
  currentAmount: number
  changeAmount: number
  resultingAmount: number
  changeLabel?: string
}

export function BalanceImpactCard({
  label,
  currentAmount,
  changeAmount,
  resultingAmount,
  changeLabel = 'Change',
}: BalanceImpactCardProps) {
  const theme = useTheme()

  return (
    <Card size="small" style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}>
      <Text type="secondary" style={{ fontSize: 11 }}>{label}</Text>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>Current</Text>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{formatMoney(currentAmount)}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>{changeLabel}</Text>
          <div style={{ fontSize: 16, fontWeight: 600, color: changeAmount >= 0 ? '#22c55e' : theme.textPrimary }}>
            {changeAmount >= 0 ? '+' : ''}{formatMoney(changeAmount)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Resulting</Text>
          <div style={{ fontSize: 18, fontWeight: 700, color: theme.accent }}>{formatMoney(resultingAmount)}</div>
        </div>
      </div>
    </Card>
  )
}
