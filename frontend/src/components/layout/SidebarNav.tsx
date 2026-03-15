/**
 * Sidebar Navigation — domain colors, collapsible sections, tooltips.
 */
import { useState } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { useNavigate, useLocation } from 'react-router-dom'
import { Tooltip } from 'antd'
import {
  RocketOutlined,
  HistoryOutlined,
  BarChartOutlined,
  HeartOutlined,
  HeartTwoTone,
  DollarOutlined,
  BookOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
  CompassOutlined,
  SmileOutlined,
  ExperimentOutlined,
  AimOutlined,
  FlagOutlined,
  CrownOutlined,
  ApartmentOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  BulbOutlined,
  DownOutlined,
  RightOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  HomeOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { DOMAIN_COLORS } from '../control-room/constants'

interface NavItem {
  key: string
  path: string
  icon: React.ReactNode
  label: string
  color?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const BASE = '/app'

const SIDEBAR_SECTIONS: NavSection[] = [
  {
    title: 'Primary',
    items: [
      { key: 'today', path: `${BASE}/today`, icon: <CalendarOutlined />, label: 'Today' },
      { key: 'control-room', path: `${BASE}/control-room`, icon: <RocketOutlined />, label: 'Control Room' },
      { key: 'timeline', path: `${BASE}/timeline`, icon: <HistoryOutlined />, label: 'Timeline' },
      { key: 'analytics', path: `${BASE}/analytics`, icon: <BarChartOutlined />, label: 'Analytics' },
    ],
  },
  {
    title: 'Life Domains',
    items: [
      { key: 'health', path: `${BASE}/health/body-map`, icon: <HeartOutlined />, label: 'Health', color: DOMAIN_COLORS.health },
      { key: 'wealth', path: `${BASE}/wealth`, icon: <DollarOutlined />, label: 'Wealth', color: DOMAIN_COLORS.wealth },
      { key: 'skills', path: `${BASE}/skills`, icon: <BookOutlined />, label: 'Skills', color: DOMAIN_COLORS.skills },
      { key: 'network', path: `${BASE}/network`, icon: <TeamOutlined />, label: 'Network', color: DOMAIN_COLORS.network },
      { key: 'career', path: `${BASE}/career`, icon: <TrophyOutlined />, label: 'Career', color: DOMAIN_COLORS.career },
      { key: 'relationships', path: `${BASE}/relationships`, icon: <HeartTwoTone twoToneColor="#be185d" />, label: 'Relationships', color: DOMAIN_COLORS.relationships },
      { key: 'experiences', path: `${BASE}/experiences`, icon: <CompassOutlined />, label: 'Experiences', color: DOMAIN_COLORS.experiences },
      { key: 'identity', path: `${BASE}/identity`, icon: <SmileOutlined />, label: 'Identity', color: DOMAIN_COLORS.identity },
    ],
  },
  {
    title: 'Strategy',
    items: [
      { key: 'strategies', path: `${BASE}/strategies`, icon: <BulbOutlined />, label: 'Strategy Library' },
      { key: 'protocols-active', path: `${BASE}/protocols/active`, icon: <CheckCircleOutlined />, label: 'Active Protocols' },
      { key: 'simulation', path: `${BASE}/simulation`, icon: <ExperimentOutlined />, label: 'Simulation' },
      { key: 'recommendations', path: `${BASE}/recommendations`, icon: <AimOutlined />, label: 'Recommendations' },
    ],
  },
  {
    title: 'Gamification',
    items: [
      { key: 'quests', path: `${BASE}/quests`, icon: <FlagOutlined />, label: 'Quests' },
      { key: 'achievements', path: `${BASE}/achievements`, icon: <CrownOutlined />, label: 'Achievements' },
    ],
  },
  {
    title: 'Knowledge',
    items: [
      { key: 'learn', path: `${BASE}/learn`, icon: <BookOutlined />, label: 'Learn' },
      { key: 'learn-psychology', path: `${BASE}/learn/category/psychology`, icon: <BulbOutlined />, label: 'Psychology' },
      { key: 'learn-health', path: `${BASE}/learn/category/health`, icon: <HeartOutlined />, label: 'Health' },
      { key: 'learn-finance', path: `${BASE}/learn/category/finance`, icon: <DollarOutlined />, label: 'Finance' },
      { key: 'learn-skills', path: `${BASE}/learn/category/skills-productivity`, icon: <BookOutlined />, label: 'Skills' },
      { key: 'learn-relationships', path: `${BASE}/learn/category/relationships`, icon: <TeamOutlined />, label: 'Relationships' },
      { key: 'learn-identity', path: `${BASE}/learn/category/identity-philosophy`, icon: <SmileOutlined />, label: 'Identity' },
      { key: 'life-graph', path: `${BASE}/life-graph`, icon: <ApartmentOutlined />, label: 'Life Graph' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { key: 'mind', path: `${BASE}/mind`, icon: <ThunderboltOutlined />, label: 'Mind Engine' },
      { key: 'time-tracking', path: `${BASE}/time-tracking`, icon: <ClockCircleOutlined />, label: 'Time Tracking' },
      { key: 'metrics', path: `${BASE}/metrics`, icon: <LineChartOutlined />, label: 'Metrics' },
      { key: 'goals', path: `${BASE}/goals`, icon: <FlagOutlined />, label: 'Goals' },
      { key: 'insights', path: `${BASE}/insights`, icon: <BulbOutlined />, label: 'Insights' },
    ],
  },
  {
    title: 'System',
    items: [
      { key: 'settings', path: `${BASE}/settings`, icon: <SettingOutlined />, label: 'Settings' },
    ],
  },
]

const ALL_ITEMS = SIDEBAR_SECTIONS.flatMap((s) => s.items)

export interface SidebarNavProps {
  collapsed?: boolean
  /** Callback after navigation (e.g. close mobile drawer). */
  onNavigate?: () => void
}

export function SidebarNav({ collapsed, onNavigate }: SidebarNavProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  const selectedKey =
    ALL_ITEMS.filter(
      (i) => location.pathname === i.path || location.pathname.startsWith(i.path + '/')
    )
      .sort((a, b) => b.path.length - a.path.length)[0]?.key || 'today'

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <nav
      className="lifeos-sidebar-nav"
      style={{
        paddingBottom: 16,
        /* no flex/overflow here — parent div in MainLayout handles scroll */
      }}
    >
      {SIDEBAR_SECTIONS.map((section) => {
        const sectionCollapsed = collapsedSections[section.title]
        const showItems = collapsed ? true : !sectionCollapsed

        return (
          <div
            key={section.title}
            style={{
              marginBottom: collapsed ? 8 : 4,
            }}
          >
            {!collapsed && (
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 20px 8px 24px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.textMuted,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.textSecondary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.textMuted
                }}
              >
                {section.title}
                <span style={{ opacity: 0.7 }}>
                  {sectionCollapsed ? <RightOutlined style={{ fontSize: 10 }} /> : <DownOutlined style={{ fontSize: 10 }} />}
                </span>
              </button>
            )}

            {showItems &&
              section.items.map((item) => {
                const isSelected = selectedKey === item.key
                const accentColor = item.color || '#6366f1'

                const content = (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      navigate(item.path)
                      onNavigate?.()
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: collapsed ? '10px 16px' : '10px 20px 10px 24px',
                      margin: '0 8px',
                      borderRadius: theme.radius,
                      cursor: 'pointer',
                      background: isSelected ? theme.selectedBg : 'transparent',
                      borderLeft: isSelected ? `3px solid ${accentColor}` : '3px solid transparent',
                      color: isSelected ? theme.textPrimary : theme.textSecondary,
                      fontSize: 14,
                      fontWeight: isSelected ? 600 : 500,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = theme.hoverBg
                        e.currentTarget.style.color = theme.textPrimary
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = theme.textSecondary
                      }
                    }}
                  >
                    <span
                      style={{
                        color: isSelected ? accentColor : item.color || theme.textMuted,
                        fontSize: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 20,
                      }}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                )

                return (
                  <div key={item.key} style={{ marginBottom: 2 }}>
                    {collapsed ? (
                      <Tooltip title={item.label} placement="right">
                        {content}
                      </Tooltip>
                    ) : (
                      content
                    )}
                  </div>
                )
              })}
          </div>
        )
      })}
    </nav>
  )
}
