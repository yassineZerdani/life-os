import { Card, Typography, Empty } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import type { PersonaNarrativeEntry } from '../../services/personaLab'

const { Text } = Typography

const TYPE_LABELS: Record<string, string> = {
  who_i_was: 'Who I was',
  who_i_am: 'Who I am',
  who_i_am_becoming: 'Who I am becoming',
  defining_moment: 'Defining moment',
  identity_shift: 'Identity shift',
}

interface NarrativeTimelineProps {
  entries: PersonaNarrativeEntry[]
  loading?: boolean
  onDelete?: (id: string) => void
}

export function NarrativeTimeline({ entries, loading, onDelete }: NarrativeTimelineProps) {
  const theme = useTheme()
  const accent = DOMAIN_COLORS.identity ?? '#64748b'
  if (loading) return null
  const sorted = [...entries].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0
    return tb - ta
  })
  if (sorted.length === 0) {
    return (
      <Card size="small" style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No narrative entries yet" />
      </Card>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {sorted.map((entry) => (
        <Card
          key={entry.id}
          size="small"
          style={{
            borderRadius: 12,
            border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
            borderLeftWidth: 4,
            borderLeftColor: accent,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <ClockCircleOutlined style={{ color: accent, marginTop: 2, fontSize: 14 }} />
            <div style={{ flex: 1 }}>
              <Text strong style={{ fontSize: 14 }}>{entry.title}</Text>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {TYPE_LABELS[entry.type] ?? entry.type}
                  {entry.time_period ? ` · ${entry.time_period}` : ''}
                </Text>
              </div>
              {entry.description && (
                <Text style={{ fontSize: 13, color: theme.textSecondary ?? '#475569', display: 'block', marginTop: 6, whiteSpace: 'pre-wrap' }}>
                  {entry.description}
                </Text>
              )}
            </div>
            {onDelete && (
              <Text type="secondary" style={{ cursor: 'pointer', fontSize: 12 }} onClick={() => onDelete(entry.id)}>Remove</Text>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
