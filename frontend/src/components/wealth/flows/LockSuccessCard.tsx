/**
 * LockSuccessCard — Success state after locking funds.
 */
import { Card, Typography, Button } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { WealthVault } from '../../../services/wealthVault'
import { useTheme } from '../../../hooks/useTheme'

const { Text } = Typography

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

interface LockSuccessCardProps {
  vault: WealthVault
  onViewVault?: () => void
}

export function LockSuccessCard({ vault, onViewVault }: LockSuccessCardProps) {
  const theme = useTheme()
  const daysRemaining = dayjs(vault.unlock_date).diff(dayjs(), 'day')

  return (
    <Card
      style={{
        borderRadius: 16,
        border: `1px solid ${theme.contentCardBorder}`,
        background: theme.contentCardBg ?? theme.cardBg,
        textAlign: 'center',
        padding: 32,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'rgba(34, 197, 94, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <CheckCircleOutlined style={{ fontSize: 32, color: '#22c55e' }} />
      </div>
      <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 8 }}>
        Your money is now locked
      </Text>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        until {dayjs(vault.unlock_date).format('MMMM D, YYYY')}
      </Text>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{formatMoney(vault.current_amount)}</div>
      <Text type="secondary" style={{ fontSize: 13 }}>{vault.name}</Text>
      <div style={{ marginTop: 16, padding: 12, background: theme.hoverBg, borderRadius: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Days remaining</Text>
        <div style={{ fontSize: 18, fontWeight: 600 }}>{daysRemaining} days</div>
      </div>
      {onViewVault && (
        <Button type="primary" style={{ marginTop: 24 }} onClick={onViewVault}>
          Continue
        </Button>
      )}
    </Card>
  )
}
