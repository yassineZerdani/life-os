import { ReactNode } from 'react'
import { useTheme } from '../../hooks/useTheme'

export interface SettingsPageLayoutProps {
  header: ReactNode
  children: ReactNode
}

export function SettingsPageLayout({ header, children }: SettingsPageLayoutProps) {
  const theme = useTheme()
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        minHeight: 0,
      }}
    >
      <header
        style={{
          flexShrink: 0,
          paddingBottom: 8,
          borderBottom: `1px solid ${theme.contentCardBorder ?? theme.border}`,
        }}
      >
        {header}
      </header>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  )
}
