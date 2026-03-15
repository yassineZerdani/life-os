import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Menu, Card, Typography, Select } from 'antd'
import {
  SettingOutlined,
  UserOutlined,
  AppstoreOutlined,
  HeartOutlined,
  BulbOutlined,
  DollarOutlined,
  SolutionOutlined,
  TeamOutlined,
  HomeOutlined,
  IdcardOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'
import { useBreakpoint } from '../../hooks/useBreakpoint'

export function SettingsLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const screens = useBreakpoint()
  const isMobileOrTablet = !screens.md
  const base = '/app/settings'
  const current = location.pathname.replace(`${base}/`, '').split('/')[0] || 'profile'

  const menuItems = [
    { key: 'hub', label: 'Profile Hub', path: `${base}/profile`, icon: <SettingOutlined /> },
    { key: 'app', label: 'App Settings', path: `${base}/app`, icon: <AppstoreOutlined /> },
    { key: 'person', label: 'Personal Profile', path: `${base}/person`, icon: <UserOutlined /> },
    { key: 'health', label: 'Health', path: `${base}/health`, icon: <HeartOutlined /> },
    { key: 'psychology', label: 'Psychology', path: `${base}/psychology`, icon: <BulbOutlined /> },
    { key: 'finance', label: 'Finance', path: `${base}/finance`, icon: <DollarOutlined /> },
    { key: 'wealth', label: 'Wealth & Stripe', path: `${base}/wealth`, icon: <SafetyOutlined /> },
    { key: 'career', label: 'Career & Skills', path: `${base}/career`, icon: <SolutionOutlined /> },
    { key: 'relationships', label: 'Relationships', path: `${base}/relationships`, icon: <TeamOutlined /> },
    { key: 'lifestyle', label: 'Lifestyle', path: `${base}/lifestyle`, icon: <HomeOutlined /> },
    { key: 'identity', label: 'Identity & Values', path: `${base}/identity`, icon: <IdcardOutlined /> },
    { key: 'strategies', label: 'Strategy Preferences', path: `${base}/strategies`, icon: <ThunderboltOutlined /> },
  ]

  const selectedKey =
    menuItems.find((m) => location.pathname === m.path || location.pathname.startsWith(m.path + '/'))?.key ?? 'hub'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobileOrTablet ? 'column' : 'row',
        gap: isMobileOrTablet ? 16 : 24,
        minHeight: '100%',
      }}
    >
      {/* Desktop: sidebar card */}
      {!isMobileOrTablet && (
        <Card
          style={{
            width: 260,
            flexShrink: 0,
            background: theme.cardBg ?? theme.contentCardBg,
            border: `1px solid ${theme.contentCardBorder ?? theme.border}`,
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
      )}

      {/* Mobile/tablet: dropdown or horizontal scroll */}
      {isMobileOrTablet && (
        <div style={{ flexShrink: 0 }}>
          <Typography.Text strong style={{ fontSize: 12, color: theme.textMuted, marginBottom: 8, display: 'block' }}>
            Section
          </Typography.Text>
          <Select
            value={selectedKey}
            onChange={(key) => {
              const item = menuItems.find((m) => m.key === key)
              if (item) navigate(item.path)
            }}
            options={menuItems.map((m) => ({ label: m.label, value: m.key }))}
            style={{ width: '100%' }}
            size="large"
          />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  )
}
