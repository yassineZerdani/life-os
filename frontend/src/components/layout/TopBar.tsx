/**
 * TopBar — Global search, quick add, theme toggle, notifications, profile.
 * On mobile/tablet: hamburger menu (onMenuClick), compact search/add.
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
  BgColorsOutlined,
  MenuOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  LineChartOutlined,
  TeamOutlined,
  FlagOutlined,
  StarOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAppStore } from '../../store/useAppStore'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import type { ThemeMode } from '../../styles/theme'

export interface TopBarProps {
  /** When set (e.g. on mobile), show hamburger that calls this to open sidebar drawer. */
  onMenuClick?: () => void
}

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

const THEME_OPTIONS: { key: ThemeMode; label: string }[] = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'boys', label: 'Boys' },
  { key: 'girls', label: 'Girls' },
  { key: 'light-boys', label: 'Light Boys' },
  { key: 'light-girls', label: 'Light Girls' },
]

export function TopBar({ onMenuClick }: TopBarProps) {
  const [searchFocused, setSearchFocused] = useState(false)
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const theme = useTheme()
  const themeMode = useAppStore((s) => s.themeMode)
  const setThemeMode = useAppStore((s) => s.setThemeMode)
  const quickAddItems = useQuickAddItems(navigate)
  const quickAddMenu = { items: quickAddItems }
  const screens = useBreakpoint()
  const isSmall = !screens.md

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
        padding: isSmall ? '0 12px' : '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        background: theme.topBarBg,
        borderBottom: `1px solid ${theme.topBarBorder}`,
        boxShadow: theme.shadowSm,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: isSmall ? 8 : 16, flex: 1, minWidth: 0, maxWidth: isSmall ? 'none' : 480 }}>
        {onMenuClick && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={onMenuClick}
            aria-label="Open menu"
            style={{ color: theme.textSecondary, flexShrink: 0 }}
          />
        )}
        <Input
          placeholder={isSmall ? 'Search' : 'Search... (Ctrl+K)'}
          prefix={<SearchOutlined style={{ color: theme.textMuted }} />}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            width: isSmall ? 120 : 280,
            maxWidth: '100%',
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
            {!isSmall && 'Quick Add'}
          </Button>
        </Dropdown>
      </div>

      <Space size={isSmall ? 4 : 12}>
        <Dropdown
          menu={{
            items: THEME_OPTIONS.map((o) => ({
              key: o.key,
              label: o.label,
              onClick: () => setThemeMode(o.key),
            })),
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<BgColorsOutlined />}
            style={{ color: theme.textSecondary }}
            title="Theme"
          />
        </Dropdown>
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
            size={isSmall ? 32 : 36}
            icon={<UserOutlined />}
            style={{ background: theme.accent, cursor: 'pointer' }}
          />
        </Dropdown>
      </Space>
    </div>
  )
}
