/**
 * Love Timeline — milestones, moments, repairs, plans. Chronological, calm.
 */
import { Card, Typography, Button, Tag } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import type { LoveMemory } from '../../services/love'

const { Text } = Typography

const CATEGORY_LABELS: Record<string, string> = {
  milestone: 'Milestone',
  moment: 'Moment',
  trip: 'Trip',
  plan: 'Plan',
  promise: 'Promise',
  repair: 'Repair',
  other: 'Other',
}

const CATEGORY_COLORS: Record<string, string> = {
  milestone: DOMAIN_COLORS.love,
  moment: '#06b6d4',
  trip: '#8b5cf6',
  plan: '#eab308',
  promise: '#22c55e',
  repair: '#f59e0b',
  other: '#64748b',
}

export interface LoveTimelineProps {
  memories: LoveMemory[]
  onAdd?: () => void
  onEdit?: (m: LoveMemory) => void
  onDelete?: (id: string) => void
  loading?: boolean
}

export function LoveTimeline({ memories, onAdd, onEdit, loading }: LoveTimelineProps) {
  const theme = useTheme()

  const sorted = [...memories].sort((a, b) => {
    const dA = a.date ? new Date(a.date).getTime() : 0
    const dB = b.date ? new Date(b.date).getTime() : 0
    return dB - dA
  })

  return (
    <div>
      {onAdd && (
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} style={{ borderRadius: 10 }}>
            Add moment
          </Button>
        </div>
      )}
      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: theme.textMuted }}>Loading timeline…</div>
      ) : sorted.length === 0 ? (
        <Card
          style={{
            borderRadius: 16,
            border: `1px dashed ${theme.border ?? '#cbd5e1'}`,
            background: 'transparent',
            textAlign: 'center',
            padding: 32,
          }}
        >
          <Text type="secondary">No moments yet. Add milestones, trips, or everyday moments you want to remember.</Text>
          {onAdd && (
            <div style={{ marginTop: 12 }}>
              <Button type="primary" ghost icon={<PlusOutlined />} onClick={onAdd}>
                Add first moment
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map((m) => {
            const dateStr = m.date
              ? new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : 'No date'
            const color = CATEGORY_COLORS[m.category] ?? CATEGORY_COLORS.other
            return (
              <Card
                key={m.id}
                size="small"
                style={{
                  borderRadius: 12,
                  borderLeft: `4px solid ${color}`,
                  border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
                  background: theme.contentCardBg ?? undefined,
                }}
                actions={
                  onEdit
                    ? [
                        <Button
                          key="edit"
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => onEdit(m)}
                        >
                          Edit
                        </Button>,
                      ]
                    : undefined
                }
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Text strong style={{ fontSize: 15 }}>{m.title}</Text>
                      <Tag style={{ margin: 0 }} color={color}>
                        {CATEGORY_LABELS[m.category] ?? m.category}
                      </Tag>
                    </div>
                    {m.description && (
                      <Text type="secondary" style={{ fontSize: 13 }}>{m.description}</Text>
                    )}
                    <div style={{ marginTop: 6 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>{dateStr}</Text>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
