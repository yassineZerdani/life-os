import { ReactNode, useState } from 'react'
import { Card, Collapse, Typography } from 'antd'
import { DownOutlined, RightOutlined } from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

export interface SettingsSectionCardProps {
  title: string
  description?: string
  children: ReactNode
  defaultExpanded?: boolean
}

export function SettingsSectionCard({
  title,
  description,
  children,
  defaultExpanded = true,
}: SettingsSectionCardProps) {
  const theme = useTheme()
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <Card
      size="small"
      style={{
        background: theme.contentCardBg ?? theme.cardBg,
        border: `1px solid ${theme.contentCardBorder ?? theme.border}`,
        borderRadius: theme.radius ?? 8,
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Collapse
        activeKey={expanded ? ['content'] : []}
        onChange={(keys) => setExpanded(keys.includes('content'))}
        ghost
        expandIcon={({ isActive }) =>
          isActive ? (
            <DownOutlined style={{ color: theme.textMuted, fontSize: 12 }} />
          ) : (
            <RightOutlined style={{ color: theme.textMuted, fontSize: 12 }} />
          )
        }
        items={[
          {
            key: 'content',
            label: (
              <div>
                <Text strong style={{ color: theme.textPrimary }}>
                  {title}
                </Text>
                {description && (
                  <Text
                    type="secondary"
                    style={{ display: 'block', fontSize: 12, marginTop: 2 }}
                  >
                    {description}
                  </Text>
                )}
              </div>
            ),
            children: <div style={{ padding: '0 16px 16px' }}>{children}</div>,
          },
        ]}
      />
    </Card>
  )
}
