/**
 * Control Room CTA — kept subtle so writing stays primary.
 */
import { Button } from 'antd'
import { RocketOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'

export function OpenDashboardButton() {
  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <Button
      type="default"
      icon={<RocketOutlined />}
      onClick={() => navigate('/app/control-room')}
      size="large"
      style={{
        background: 'transparent',
        border: `1px solid ${theme.contentCardBorder}`,
        borderRadius: 12,
        fontWeight: 600,
        paddingLeft: 20,
        paddingRight: 20,
        height: 44,
        color: theme.textSecondary,
        boxShadow: 'none',
      }}
    >
      Open Control Room
    </Button>
  )
}
