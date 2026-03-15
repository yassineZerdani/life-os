/**
 * SeasonOfLifeCard — a life chapter with start/end and summary.
 */
import { Card, Typography } from 'antd'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import type { SeasonOfLife } from '../../services/lifeMemory'

const { Text } = Typography

export interface SeasonOfLifeCardProps {
  season: SeasonOfLife
  onClick?: () => void
}

export function SeasonOfLifeCard({ season, onClick }: SeasonOfLifeCardProps) {
  const theme = useTheme()
  const startStr = season.start_date ? new Date(season.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : ''
  const endStr = season.end_date ? new Date(season.end_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present'

  return (
    <Card
      size="small"
      style={{
        borderRadius: 14,
        borderLeft: `4px solid ${DOMAIN_COLORS.experiences}`,
        border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
        background: theme.contentCardBg ?? undefined,
        cursor: onClick ? 'pointer' : undefined,
      }}
      onClick={onClick}
    >
      <Text strong style={{ fontSize: 15 }}>{season.title}</Text>
      <div style={{ marginTop: 6 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {startStr} — {endStr}
        </Text>
      </div>
      {season.summary && (
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 8 }}>
          {season.summary}
        </Text>
      )}
    </Card>
  )
}
