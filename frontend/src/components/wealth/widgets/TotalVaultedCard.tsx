import { Card, Typography } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useTheme } from '../../../hooks/useTheme'

const { Text } = Typography

export function TotalVaultedCard({ amount, currency = 'USD' }: { amount: number; currency?: string }) {
  const theme = useTheme()
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)

  return (
    <Card size="small" style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}>
      <Text type="secondary" style={{ fontSize: 11 }}>Total vaulted</Text>
      <div style={{ fontSize: 22, fontWeight: 700, color: theme.textPrimary, marginTop: 4 }}>
        {formatted}
      </div>
      <LockOutlined style={{ fontSize: 14, color: theme.accent, marginTop: 8 }} />
    </Card>
  )
}
