import { Card, Typography, Progress } from 'antd'
import { useTheme } from '../../../hooks/useTheme'

const { Text } = Typography

export function VaultDisciplineScoreCard({ score }: { score: number }) {
  const theme = useTheme()
  const color = score >= 70 ? '#22c55e' : score >= 40 ? theme.accent : '#f59e0b'

  return (
    <Card size="small" style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}>
      <Text type="secondary" style={{ fontSize: 11 }}>Vault discipline</Text>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <Progress type="circle" percent={score} size={48} strokeColor={color} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{score}/100</div>
          <Text type="secondary" style={{ fontSize: 11 }}>Stay committed</Text>
        </div>
      </div>
    </Card>
  )
}
