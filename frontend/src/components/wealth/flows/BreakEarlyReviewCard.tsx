/**
 * BreakEarlyReviewCard — Result screen after breaking vault early.
 */
import { Card, Typography, Button } from 'antd'
import { WarningOutlined } from '@ant-design/icons'
import { useTheme } from '../../../hooks/useTheme'

const { Text } = Typography

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

interface BreakEarlyReviewCardProps {
  vaultName: string
  penaltyAmount: number
  netAmount: number
  onViewVault?: () => void
  onViewTransactions?: () => void
}

export function BreakEarlyReviewCard({
  vaultName,
  penaltyAmount,
  netAmount,
  onViewVault,
  onViewTransactions,
}: BreakEarlyReviewCardProps) {
  const theme = useTheme()

  return (
    <Card
      style={{
        borderRadius: 16,
        border: `1px solid ${theme.contentCardBorder}`,
        textAlign: 'center',
        padding: 32,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'rgba(245, 158, 11, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <WarningOutlined style={{ fontSize: 32, color: '#f59e0b' }} />
      </div>
      <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 8 }}>
        Vault broken early
      </Text>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>{vaultName}</Text>
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Amount returned</Text>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>{formatMoney(netAmount)}</div>
      </div>
      {penaltyAmount > 0 && (
        <div style={{ padding: 12, background: theme.hoverBg, borderRadius: 8, marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Penalty applied</Text>
          <div style={{ fontSize: 16, color: '#f59e0b' }}>−{formatMoney(penaltyAmount)}</div>
        </div>
      )}
      <Text type="secondary" style={{ fontSize: 13 }}>
        Funds have been moved to your available balance.
      </Text>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
        {onViewVault && <Button onClick={onViewVault}>View vault</Button>}
        {onViewTransactions && <Button ghost onClick={onViewTransactions}>View transactions</Button>}
      </div>
    </Card>
  )
}
