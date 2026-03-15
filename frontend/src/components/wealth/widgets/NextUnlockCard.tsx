import { Card, Typography } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useTheme } from '../../../hooks/useTheme'

const { Text } = Typography

interface NextUnlockCardProps {
  vaultName: string
  date: string
  amount: number
}

export function NextUnlockCard({ vaultName, date, amount }: NextUnlockCardProps) {
  const theme = useTheme()
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount)

  return (
    <Card size="small" style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}>
      <Text type="secondary" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
        <CalendarOutlined /> Next unlock
      </Text>
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{vaultName}</div>
      <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(date).format('MMM D, YYYY')} · {formatted}</Text>
    </Card>
  )
}
