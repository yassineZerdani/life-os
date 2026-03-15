import { Card, Progress, Typography } from 'antd'
import type { WealthVault } from '../../services/wealthVault'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

export function VaultProgressCard({ vault }: { vault: WealthVault }) {
  const theme = useTheme()
  const target = vault.target_amount ?? 0
  const pct = target > 0 ? Math.min(100, (vault.current_amount / target) * 100) : 0

  return (
    <Card size="small" style={{ borderLeft: `4px solid ${theme.accent}` }}>
      <Text type="secondary" style={{ fontSize: 12 }}>Progress</Text>
      <Progress
        percent={Math.round(pct)}
        strokeColor={theme.accent}
        style={{ marginTop: 8 }}
      />
      <Text style={{ fontSize: 14, marginTop: 4, display: 'block' }}>
        ${vault.current_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} / $
        {target > 0 ? target.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
      </Text>
    </Card>
  )
}
