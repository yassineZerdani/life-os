/**
 * Shared vision board — life, travel, home, family, career, values. Clean cards.
 */
import { Card, Typography, Button, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import type { SharedVisionItem } from '../../services/love'

const { Text } = Typography

const CATEGORY_LABELS: Record<string, string> = {
  life: 'Life',
  travel: 'Travel',
  home: 'Home',
  family: 'Family',
  career: 'Career',
  values: 'Values',
  other: 'Other',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  achieved: 'Achieved',
  paused: 'Paused',
  dropped: 'Dropped',
}

export interface SharedVisionBoardProps {
  items: SharedVisionItem[]
  onAdd?: () => void
  onEdit?: (item: SharedVisionItem) => void
  onStatusChange?: (id: string, status: string) => void
  loading?: boolean
}

export function SharedVisionBoard({
  items,
  onAdd,
  onEdit,
  onStatusChange,
  loading,
}: SharedVisionBoardProps) {
  const theme = useTheme()

  const byCategory = items.reduce((acc, i) => {
    const c = i.category || 'other'
    if (!acc[c]) acc[c] = []
    acc[c].push(i)
    return acc
  }, {} as Record<string, SharedVisionItem[]>)

  const categoryOrder = ['life', 'values', 'home', 'family', 'career', 'travel', 'other']

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: theme.textMuted }}>
        Loading shared vision…
      </div>
    )
  }

  return (
    <div>
      {onAdd && (
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} style={{ borderRadius: 10 }}>
            Add vision item
          </Button>
        </div>
      )}
      {items.length === 0 ? (
        <Card
          style={{
            borderRadius: 16,
            border: `1px dashed ${theme.border ?? '#cbd5e1'}`,
            background: 'transparent',
            textAlign: 'center',
            padding: 32,
          }}
        >
          <Text type="secondary">
            Align on the future. Add shared goals, dreams, and plans you want to work toward together.
          </Text>
          {onAdd && (
            <div style={{ marginTop: 12 }}>
              <Button type="primary" ghost icon={<PlusOutlined />} onClick={onAdd}>
                Add first item
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {categoryOrder.filter((c) => (byCategory[c]?.length ?? 0) > 0).map((cat) => (
            <div key={cat}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: theme.textMuted,
                  display: 'block',
                  marginBottom: 12,
                }}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {byCategory[cat].map((item) => (
                  <Card
                    key={item.id}
                    size="small"
                    style={{
                      width: 280,
                      borderRadius: 12,
                      border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
                      background: theme.contentCardBg ?? undefined,
                    }}
                    onClick={() => onEdit?.(item)}
                    role={onEdit ? 'button' : undefined}
                  >
                    <div style={{ marginBottom: 6 }}>
                      <Text strong style={{ fontSize: 14 }}>{item.title}</Text>
                    </div>
                    {item.description && (
                      <Text type="secondary" style={{ fontSize: 12 }} ellipsis={{ rows: 2 }}>
                        {item.description}
                      </Text>
                    )}
                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {item.target_date && (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {new Date(item.target_date).toLocaleDateString(undefined, {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      )}
                      <Tag
                        color={item.status === 'achieved' ? 'green' : item.status === 'paused' ? 'default' : 'blue'}
                        style={{ margin: 0 }}
                      >
                        {STATUS_LABELS[item.status] ?? item.status}
                      </Tag>
                    </div>
                    {onStatusChange && item.status === 'active' && (
                      <div style={{ marginTop: 8 }}>
                        <Button
                          size="small"
                          type="link"
                          onClick={(e) => {
                            e.stopPropagation()
                            onStatusChange(item.id, 'achieved')
                          }}
                        >
                          Mark achieved
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
