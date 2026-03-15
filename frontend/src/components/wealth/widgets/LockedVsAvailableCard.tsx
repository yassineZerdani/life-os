import { Card, Typography } from 'antd'
import { useTheme } from '../../../hooks/useTheme'

const { Text } = Typography

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

export function LockedVsAvailableCard({ locked, available }: { locked: number; available: number }) {
  const theme = useTheme()

  return (
    <Card size="small" style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>Available</Text>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#22c55e' }}>{fmt(available)}</div>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>Locked</Text>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{fmt(locked)}</div>
        </div>
      </div>
    </Card>
  )
}
