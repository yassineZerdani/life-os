/**
 * TopBar — Global search, quick add, theme toggle, notifications, profile.
 */
import { useState } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Input, Button, Dropdown, Badge, Avatar, Space } from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  BellOutlined,
  UserOutlined,
  MoonOutlined,
  SunOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  LineChartOutlined,
  TeamOutlined,
  FlagOutlined,
  StarOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAppStore } from '../../store/useAppStore'

function useQuickAddItems(navigate: (path: string) => void): MenuProps['items'] {
  return [
    { key: 'time-block', icon: <ClockCircleOutlined />, label: 'Time Block', onClick: () => navigate('/app/time-tracking') },
    { key: 'experience', icon: <CalendarOutlined />, label: 'Experience', onClick: () => navigate('/app/experiences') },
    { key: 'metric', icon: <LineChartOutlined />, label: 'Metric', onClick: () => navigate('/app/metrics') },
    { key: 'relationship', icon: <TeamOutlined />, label: 'Relationship', onClick: () => navigate('/app/relationships') },
    { key: 'goal', icon: <FlagOutlined />, label: 'Goal', onClick: () => navigate('/app/goals') },
    { key: 'life-event', icon: <StarOutlined />, label: 'Life Event', onClick: () => navigate('/app/timeline') },
  ]
}

export function TopBar() {
  const [searchFocused, setSearchFocused] = useState(false)
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const theme = useTheme()
  const themeMode = useAppStore((s) => s.themeMode)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const quickAddItems = useQuickAddItems(navigate)
  const quickAddMenu = { items: quickAddItems }

  const profileMenu: MenuProps['items'] = [
    { key: 'profile', label: user?.name || user?.email || 'Profile', onClick: () => {} },
    { key: 'settings', label: 'Settings', onClick: () => navigate('/app/settings') },
    { type: 'divider' },
    { key: 'signout', label: 'Sign out', onClick: () => { signOut(); navigate('/') } },
  ]

  return (
    <div
      style={{
        height: 60,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: theme.topBarBg,
        borderBottom: `1px solid ${theme.topBarBorder}`,
        boxShadow: theme.shadowSm,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, maxWidth: 480 }}>
        <Input
          placeholder="Search... (Ctrl+K)"
          prefix={<SearchOutlined style={{ color: theme.textMuted }} />}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            width: 280,
            background: searchFocused ? theme.contentBg : theme.contentBg,
            border: `1px solid ${searchFocused ? theme.accent : theme.border}`,
            borderRadius: theme.radius,
          }}
          styles={{
            input: { background: 'transparent', color: theme.textPrimary },
          }}
        />
        <Dropdown menu={quickAddMenu} trigger={['click']} placement="bottomLeft">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              background: `linear-gradient(135deg, ${theme.accent}, #8b5cf6)`,
              border: 'none',
              borderRadius: theme.radius,
              boxShadow: theme.shadowSm,
            }}
          >
            Quick Add
          </Button>
        </Dropdown>
      </div>

      <Space size={12}>
        <Button
          type="text"
          icon={themeMode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
          style={{ color: theme.textSecondary }}
          title={themeMode === 'dark' ? 'Light mode' : 'Dark mode'}
        />
        <Badge count={0} size="small">
          <Button
            type="text"
            icon={<BellOutlined />}
            style={{ color: theme.textSecondary }}
            onClick={() => {}}
          />
        </Badge>
        <Dropdown menu={{ items: profileMenu }} trigger={['click']} placement="bottomRight">
          <Avatar
            size={36}
            icon={<UserOutlined />}
            style={{ background: theme.accent, cursor: 'pointer' }}
          />
        </Dropdown>
      </Space>
    </div>
  )
}
