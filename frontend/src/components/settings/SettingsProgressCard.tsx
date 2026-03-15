import { Card, Progress, Typography } from 'antd'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

export interface SettingsProgressCardProps {
  percent: number
  label?: string
}

export function SettingsProgressCard({ percent, label }: SettingsProgressCardProps) {
  const theme = useTheme()
  const pct = Math.round(Math.min(100, Math.max(0, percent)))
  return (
    <Card
      size="small"
      style={{
        background: theme.contentCardBg ?? theme.cardBg,
        border: `1px solid ${theme.contentCardBorder ?? theme.border}`,
        borderRadius: theme.radius ?? 8,
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Progress
          type="circle"
          percent={pct}
          size={56}
          strokeColor={theme.accent}
          trailColor={theme.borderLight ?? theme.border}
          format={() => (
            <span style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary }}>{pct}%</span>
          )}
        />
        <div style={{ flex: 1 }}>
          <Text strong style={{ color: theme.textPrimary, display: 'block' }}>
            {label ?? 'Completion'}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {pct >= 100 ? 'All sections complete' : `${100 - pct}% remaining`}
          </Text>
        </div>
      </div>
    </Card>
  )
}
