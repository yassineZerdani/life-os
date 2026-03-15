/**
 * Reconnect suggestions — intentional reconnection actions: date, conversation, gesture.
 */
import { Card, Typography, Button, Checkbox } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import type { ReconnectAction } from '../../services/love'

const { Text } = Typography

const CATEGORY_LABELS: Record<string, string> = {
  date: 'Date',
  conversation: 'Conversation',
  gesture: 'Gesture',
  ritual: 'Ritual',
  surprise: 'Surprise',
  other: 'Other',
}

export interface ReconnectSuggestionsProps {
  actions: ReconnectAction[]
  onToggleComplete: (id: string, completed: boolean) => void
  onAdd?: () => void
  loading?: boolean
}

export function ReconnectSuggestions({
  actions,
  onToggleComplete,
  onAdd,
  loading,
}: ReconnectSuggestionsProps) {
  const theme = useTheme()
  const pending = actions.filter((a) => !a.completed)

  if (loading) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: theme.textMuted }}>
        Loading…
      </div>
    )
  }

  return (
    <Card
      size="small"
      style={{
        borderRadius: 16,
        border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
        background: theme.contentCardBg ?? undefined,
      }}
      title={
        <span style={{ fontSize: 14, fontWeight: 600 }}>Reconnection</span>
      }
      extra={
        onAdd && (
          <Button type="link" size="small" icon={<PlusOutlined />} onClick={onAdd}>
            Add
          </Button>
        )
      }
    >
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
        Intentional steps to restore or deepen connection.
      </Text>
      {pending.length === 0 ? (
        <Text type="secondary" style={{ fontSize: 13 }}>No pending reconnection actions.</Text>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pending.map((a) => (
            <div
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: 10,
                borderRadius: 10,
                background: theme.hoverBg ?? 'rgba(0,0,0,0.02)',
              }}
            >
              <Checkbox
                checked={a.completed}
                onChange={(e) => onToggleComplete(a.id, e.target.checked)}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text strong style={{ fontSize: 13 }}>{a.title}</Text>
                {a.description && (
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
                    {a.description}
                  </Text>
                )}
                <div style={{ marginTop: 4, display: 'flex', gap: 8 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {CATEGORY_LABELS[a.category] ?? a.category}
                  </Text>
                  {a.due_date && (
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {new Date(a.due_date).toLocaleDateString()}
                    </Text>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
