import { Typography } from 'antd'
import { useTheme } from '../../hooks/useTheme'

const { Title, Text } = Typography

export interface SettingsHeaderProps {
  title: string
  description?: string
}

export function SettingsHeader({ title, description }: SettingsHeaderProps) {
  const theme = useTheme()
  return (
    <div>
      <Title level={3} style={{ margin: 0, marginBottom: description ? 8 : 0, color: theme.textPrimary }}>
        {title}
      </Title>
      {description && (
        <Text style={{ color: theme.textSecondary, display: 'block', fontSize: 14 }}>
          {description}
        </Text>
      )}
    </div>
  )
}
