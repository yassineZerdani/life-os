/**
 * AppLayout — Global layout: Sidebar | TopBar + MainContent.
 * Desktop: collapsible sidebar. Tablet/phone: sidebar in drawer, hamburger in TopBar.
 */
import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { Layout, Drawer } from 'antd'
import { RocketOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { SidebarNav } from './layout/SidebarNav'
import { TopBar } from './layout/TopBar'
import { useTheme } from '../hooks/useTheme'
import { useBreakpoint } from '../hooks/useBreakpoint'

const { Sider, Content } = Layout

const SIDEBAR_WIDTH = 248
const SIDEBAR_COLLAPSED_WIDTH = 72

function SidebarContent({
  collapsed,
  onCollapse,
  theme,
  onNavigate,
}: {
  collapsed: boolean
  onCollapse: (v: boolean) => void
  theme: ReturnType<typeof useTheme>
  onNavigate?: () => void
}) {
  return (
    <>
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
          onClick={() => onCollapse(!collapsed)}
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
        >
          {collapsed ? <MenuUnfoldOutlined style={{ fontSize: 16 }} /> : <MenuFoldOutlined style={{ fontSize: 16 }} />}
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        <SidebarNav collapsed={collapsed} onNavigate={onNavigate} />
      </div>
    </>
  )
}

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const theme = useTheme()
  const screens = useBreakpoint()
  const isMobileOrTablet = !screens.md

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <Layout style={{ minHeight: '100vh', background: theme.contentBg }}>
      {/* Desktop: persistent sidebar */}
      {!isMobileOrTablet && (
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
          <SidebarContent collapsed={collapsed} onCollapse={setCollapsed} theme={theme} />
        </Sider>
      )}

      {/* Mobile/tablet: drawer overlay */}
      {isMobileOrTablet && (
        <Drawer
          title={null}
          placement="left"
          open={drawerOpen}
          onClose={closeDrawer}
          width={SIDEBAR_WIDTH}
          bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%', background: theme.sidebarBg }}
          styles={{ body: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' } }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <SidebarContent collapsed={false} onCollapse={() => {}} theme={theme} onNavigate={closeDrawer} />
          </div>
        </Drawer>
      )}

      <Layout
        style={{
          background: theme.contentBg,
          flex: 1,
          minHeight: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TopBar onMenuClick={isMobileOrTablet ? () => setDrawerOpen(true) : undefined} />
        <Content
          className="app-content-area"
          style={{
            flex: 1,
            minHeight: 0,
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
