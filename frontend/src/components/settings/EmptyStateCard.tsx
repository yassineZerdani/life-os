import { Card, Button, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

export interface EmptyStateCardProps {
  title: string
  description?: string
  onAdd?: () => void
  addLabel?: string
}

export function EmptyStateCard({
  title,
  description,
  onAdd,
  addLabel = 'Add',
}: EmptyStateCardProps) {
  const theme = useTheme()
  return (
    <Card
      style={{
        background: theme.contentCardBg ?? theme.cardBg,
        border: `1px dashed ${theme.contentCardBorder ?? theme.border}`,
        borderRadius: theme.radius ?? 8,
      }}
      bodyStyle={{
        padding: 32,
        textAlign: 'center',
      }}
    >
      <Text strong style={{ color: theme.textPrimary, display: 'block', marginBottom: 8 }}>
        {title}
      </Text>
      {description && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          {description}
        </Text>
      )}
      {onAdd && (
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          {addLabel}
        </Button>
      )}
    </Card>
  )
}
