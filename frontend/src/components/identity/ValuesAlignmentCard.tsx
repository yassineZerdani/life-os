import { Card, Typography } from 'antd'
import { BulbOutlined } from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'

const { Text } = Typography

interface ValuesAlignmentCardProps {
  insights: string[]
  loading?: boolean
}

export function ValuesAlignmentCard({ insights, loading }: ValuesAlignmentCardProps) {
  const theme = useTheme()
  const accent = DOMAIN_COLORS.identity ?? '#64748b'
  if (loading || !insights?.length) return null
  return (
    <Card
      size="small"
      title={
        <span style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BulbOutlined style={{ color: accent }} />
          Values alignment
        </span>
      }
      style={{
        borderRadius: 12,
        border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
        borderLeftWidth: 4,
        borderLeftColor: accent,
      }}
    >
      <ul style={{ margin: 0, paddingLeft: 20, color: theme.textSecondary ?? '#475569', fontSize: 13, lineHeight: 1.6 }}>
        {insights.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </Card>
  )
}
