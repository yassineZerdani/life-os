/**
 * AppLayout — Global layout matching UI Architecture.
 * Structure: Sidebar | TopBar + MainContent
 * Collapse trigger at top; sidebar and content scroll independently.
 */
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import { RocketOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { SidebarNav } from './layout/SidebarNav'
import { TopBar } from './layout/TopBar'
import { useTheme } from '../hooks/useTheme'

const { Sider, Content } = Layout

const SIDEBAR_WIDTH = 248
const SIDEBAR_COLLAPSED_WIDTH = 72

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const theme = useTheme()

  return (
    <Layout style={{ minHeight: '100vh', background: theme.contentBg }}>
      <Sider
        className="lifeos-app-sider"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
        trigger={null}
        style={{
          background: theme.sidebarBg,
          borderRight: `1px solid ${theme.sidebarBorder}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        {/* Top: logo + collapse trigger */}
        <div
          style={{
            flexShrink: 0,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? 0 : '0 12px 0 20px',
            borderBottom: `1px solid ${theme.sidebarBorder}`,
            gap: 8,
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minWidth: 0,
              ...(collapsed ? { justifyContent: 'center' } : {}),
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${theme.accent}, #8b5cf6)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 18,
                boxShadow: theme.shadow,
                flexShrink: 0,
              }}
            >
              <RocketOutlined />
            </div>
            {!collapsed && (
              <span style={{ color: theme.textPrimary, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
                Life OS
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed((c) => !c)}
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: theme.radius,
              background: 'transparent',
              color: theme.textMuted,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'color 0.2s, background 0.2s',
              ...(collapsed ? { position: 'absolute', right: 8, bottom: 8, zIndex: 1 } : {}),
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.accent
              e.currentTarget.style.background = theme.hoverBg
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.textMuted
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {collapsed ? <MenuUnfoldOutlined style={{ fontSize: 16 }} /> : <MenuFoldOutlined style={{ fontSize: 16 }} />}
          </button>
        </div>
        {/* Scrollable nav only — fixed height so it scrolls independently */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <SidebarNav collapsed={collapsed} />
        </div>
      </Sider>
      <Layout style={{ background: theme.contentBg, flex: 1, minHeight: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <Content
          style={{
            flex: 1,
            minHeight: 0,
            margin: 24,
            padding: 24,
            background: theme.contentCardBg,
            borderRadius: theme.radius,
            overflow: 'auto',
            boxShadow: theme.shadow,
            border: `1px solid ${theme.contentCardBorder}`,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
