/**
 * Couple Pulse — single entry view: closeness, communication, trust, tension, support, future alignment.
 * Elegant, calm, premium.
 */
import { Card, Typography, Progress } from 'antd'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import type { LovePulseEntry } from '../../services/love'

const { Text } = Typography

const PULSE_LABELS: Record<string, string> = {
  closeness_score: 'Closeness',
  communication_score: 'Communication',
  trust_score: 'Trust',
  tension_score: 'Tension',
  support_score: 'Support',
  future_alignment_score: 'Future alignment',
}

function scoreColor(score: number | null | undefined, key: string): string {
  if (score == null) return '#94a3b8'
  if (key === 'tension_score') return score >= 6 ? '#dc2626' : score >= 4 ? '#f59e0b' : '#22c55e'
  return score >= 7 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#94a3b8'
}

export interface CouplePulseCardProps {
  entry: LovePulseEntry
  accentColor?: string
  compact?: boolean
}

export function CouplePulseCard({ entry, accentColor = DOMAIN_COLORS.love, compact }: CouplePulseCardProps) {
  const theme = useTheme()
  const dateLabel = new Date(entry.date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const scores = [
    { key: 'closeness_score', value: entry.closeness_score },
    { key: 'communication_score', value: entry.communication_score },
    { key: 'trust_score', value: entry.trust_score },
    { key: 'tension_score', value: entry.tension_score },
    { key: 'support_score', value: entry.support_score },
    { key: 'future_alignment_score', value: entry.future_alignment_score },
  ]

  return (
    <Card
      size={compact ? 'small' : undefined}
      style={{
        borderRadius: 16,
        border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
        background: theme.contentCardBg ?? undefined,
      }}
    >
      <div style={{ marginBottom: compact ? 8 : 12 }}>
        <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>
          {dateLabel}
        </Text>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? '1fr 1fr' : 'repeat(3, 1fr)',
          gap: compact ? 8 : 16,
        }}
      >
        {scores.map(({ key, value }) => (
          <div key={key}>
            <Text
              style={{
                fontSize: 11,
                color: theme.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'block',
                marginBottom: 4,
              }}
            >
              {PULSE_LABELS[key] ?? key}
            </Text>
            <Progress
              percent={value != null ? Math.round(value * 10) : 0}
              showInfo={!compact}
              strokeColor={scoreColor(value, key)}
              trailColor={theme.border ?? '#f1f5f9'}
              size={compact ? 'small' : 'default'}
            />
          </div>
        ))}
      </div>
      {!compact && entry.notes && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${theme.border ?? '#e2e8f0'}` }}>
          <Text type="secondary" style={{ fontSize: 13 }}>{entry.notes}</Text>
        </div>
      )}
    </Card>
  )
}
