import { Card, Typography } from 'antd'
import dayjs from 'dayjs'
import type { WealthVault } from '../../services/wealthVault'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

export function UnlockCountdownCard({ vault }: { vault: WealthVault }) {
  const theme = useTheme()
  const unlockDate = dayjs(vault.unlock_date)
  const now = dayjs()
  const daysRemaining = unlockDate.diff(now, 'day')
  const isPast = daysRemaining <= 0

  return (
    <Card size="small" style={{ borderLeft: `4px solid ${isPast ? '#22c55e' : theme.accent}` }}>
      <Text type="secondary" style={{ fontSize: 12 }}>Unlock</Text>
      <div style={{ marginTop: 8 }}>
        <Text strong style={{ fontSize: 16 }}>
          {isPast ? 'Eligible' : `${daysRemaining} days`}
        </Text>
        <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
          {unlockDate.format('MMM D, YYYY')}
        </Text>
      </div>
    </Card>
  )
}
