import { Card, Typography, Progress } from 'antd'
import { useTheme } from '../../../hooks/useTheme'

const { Text } = Typography

export function EmergencyFundProgressCard({ progress }: { progress: number }) {
  const theme = useTheme()

  return (
    <Card size="small" style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}>
      <Text type="secondary" style={{ fontSize: 11 }}>Emergency fund</Text>
      <Progress percent={Math.round(progress)} strokeColor="#22c55e" style={{ marginTop: 8 }} />
    </Card>
  )
}
