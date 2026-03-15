import { ReactNode } from 'react'
import { Card, Button, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

export interface SettingsRepeaterCardProps<T> {
  items: T[]
  onAdd: () => void
  onRemove: (index: number) => void
  renderItem: (item: T, index: number) => ReactNode
  emptyMessage?: string
  addLabel?: string
}

export function SettingsRepeaterCard<T extends Record<string, unknown>>({
  items,
  onAdd,
  onRemove,
  renderItem,
  emptyMessage = 'No items yet',
  addLabel = 'Add',
}: SettingsRepeaterCardProps<T>) {
  const theme = useTheme()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.length === 0 ? (
        <div
          style={{
            padding: 24,
            textAlign: 'center',
            background: theme.hoverBg ?? '#f8fafc',
            borderRadius: theme.radius ?? 8,
            border: `1px dashed ${theme.contentCardBorder ?? theme.border}`,
          }}
        >
          <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
            {emptyMessage}
          </Text>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            {addLabel}
          </Button>
        </div>
      ) : (
        items.map((item, index) => (
          <Card
            key={index}
            size="small"
            style={{
              background: theme.contentCardBg ?? theme.cardBg,
              border: `1px solid ${theme.contentCardBorder ?? theme.border}`,
              borderRadius: theme.radius ?? 8,
            }}
            bodyStyle={{ padding: 16 }}
            extra={
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onRemove(index)}
                aria-label="Remove"
              />
            }
          >
            {renderItem(item, index)}
          </Card>
        ))
      )}
      {items.length > 0 && (
        <Button type="dashed" icon={<PlusOutlined />} onClick={onAdd} block>
          {addLabel}
        </Button>
      )}
    </div>
  )
}
