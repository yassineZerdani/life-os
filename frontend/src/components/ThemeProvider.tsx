import { useEffect } from 'react'
import { ConfigProvider, theme as antdTheme } from 'antd'
import { useAppStore } from '../store/useAppStore'
import { getTheme } from '../styles/theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useAppStore((s) => s.themeMode)
  const t = getTheme(themeMode)
  const isDark = themeMode === 'dark'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode)
    document.documentElement.classList.toggle('dark', isDark)
  }, [themeMode, isDark])

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: t.accent,
          colorPrimaryHover: t.accentHover,
          borderRadius: t.radius,
          colorBgContainer: t.contentCardBg,
          colorBgLayout: t.contentBg,
          colorText: t.textPrimary,
          colorTextSecondary: t.textSecondary,
          colorBorder: t.border,
          colorBorderSecondary: t.borderLight,
        },
        components: {
          Card: {
            colorBgContainer: t.contentCardBg,
            colorBorderSecondary: t.border,
          },
          Layout: {
            bodyBg: t.contentBg,
            headerBg: t.topBarBg,
            siderBg: t.sidebarBg,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}
