import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Menu, Card, Typography } from 'antd'
import { SettingOutlined, UserOutlined, AppstoreOutlined, HeartOutlined, BulbOutlined, DollarOutlined, SolutionOutlined, TeamOutlined, HomeOutlined, IdcardOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'

export function SettingsLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const base = '/app/settings'
  const current = location.pathname.replace(`${base}/`, '').split('/')[0] || 'profile'

  const menuItems = [
    { key: 'hub', label: 'Profile Hub', path: `${base}/profile`, icon: <SettingOutlined /> },
    { key: 'app', label: 'App Settings', path: `${base}/app`, icon: <AppstoreOutlined /> },
    { key: 'person', label: 'Personal Profile', path: `${base}/person`, icon: <UserOutlined /> },
    { key: 'health', label: 'Health', path: `${base}/health`, icon: <HeartOutlined /> },
    { key: 'psychology', label: 'Psychology', path: `${base}/psychology`, icon: <BulbOutlined /> },
    { key: 'finance', label: 'Finance', path: `${base}/finance`, icon: <DollarOutlined /> },
    { key: 'career', label: 'Career & Skills', path: `${base}/career`, icon: <SolutionOutlined /> },
    { key: 'relationships', label: 'Relationships', path: `${base}/relationships`, icon: <TeamOutlined /> },
    { key: 'lifestyle', label: 'Lifestyle', path: `${base}/lifestyle`, icon: <HomeOutlined /> },
    { key: 'identity', label: 'Identity & Values', path: `${base}/identity`, icon: <IdcardOutlined /> },
    { key: 'strategies', label: 'Strategy Preferences', path: `${base}/strategies`, icon: <ThunderboltOutlined /> },
  ]

  const selectedKey = menuItems.find((m) => location.pathname === m.path || location.pathname.startsWith(m.path + '/'))?.key ?? 'hub'

  return (
    <div style={{ display: 'flex', gap: 24, minHeight: '100%' }}>
      <Card
        style={{
          width: 260,
          flexShrink: 0,
          background: theme.cardBg ?? '#fff',
          border: `1px solid ${theme.borderColor ?? '#e2e8f0'}`,
        }}
        bodyStyle={{ padding: 8 }}
      >
        <Typography.Title level={5} style={{ margin: '0 12px 12px', color: theme.textPrimary }}>
          Life Configuration
        </Typography.Title>
        <Menu
          selectedKeys={[selectedKey]}
          mode="inline"
          style={{ border: 'none' }}
          items={menuItems.map((m) => ({
            key: m.key,
            icon: m.icon,
            label: m.label,
            onClick: () => navigate(m.path),
          }))}
        />
      </Card>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  )
}
