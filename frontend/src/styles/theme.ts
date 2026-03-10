/**
 * Life OS Design Tokens — coherent light & dark themes.
 * Accent: indigo/violet. Surfaces and text scale per mode.
 */
export type ThemeMode = 'light' | 'dark'

export interface Theme {
  // Surfaces
  sidebarBg: string
  sidebarBorder: string
  topBarBg: string
  topBarBorder: string
  contentBg: string
  contentCardBg: string
  contentCardBorder: string

  // Text
  textPrimary: string
  textSecondary: string
  textMuted: string

  // Interactive
  accent: string
  accentHover: string
  accentLight: string
  selectedBg: string
  hoverBg: string

  // Borders
  borderLight: string
  border: string
  /** @deprecated use contentCardBg */
  cardBg?: string
  /** @deprecated use border */
  borderColor?: string

  // Shadows
  shadowSm: string
  shadow: string
  shadowMd: string

  // Radius
  radiusSm: number
  radius: number
  radiusLg: number

  // Control Room (premium dashboard)
  crPagePadding: number
  crCardPadding: number
  crGap: number
  crRadius: number
  crShadow: string
  crShadowHover: string
  crCardBg: string
}

const lightTheme: Theme = {
  sidebarBg: '#fafbff',
  sidebarBorder: '#e2e8f0',
  topBarBg: '#ffffff',
  topBarBorder: '#e2e8f0',
  contentBg: '#f1f5f9',
  contentCardBg: '#ffffff',
  contentCardBorder: '#e2e8f0',

  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',

  accent: '#6366f1',
  accentHover: '#4f46e5',
  accentLight: 'rgba(99, 102, 241, 0.12)',
  selectedBg: 'rgba(99, 102, 241, 0.1)',
  hoverBg: '#f1f5f9',

  borderLight: '#f1f5f9',
  border: '#e2e8f0',
  cardBg: '#ffffff',
  borderColor: '#e2e8f0',

  shadowSm: '0 1px 2px rgba(15, 23, 42, 0.04)',
  shadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
  shadowMd: '0 4px 12px rgba(15, 23, 42, 0.08)',

  radiusSm: 6,
  radius: 8,
  radiusLg: 12,

  crPagePadding: 32,
  crCardPadding: 24,
  crGap: 24,
  crRadius: 16,
  crShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
  crShadowHover: '0 12px 40px rgba(15, 23, 42, 0.12)',
  crCardBg: '#ffffff',
}

const darkTheme: Theme = {
  sidebarBg: '#0f172a',
  sidebarBorder: '#1e293b',
  topBarBg: '#0f172a',
  topBarBorder: '#1e293b',
  contentBg: '#020617',
  contentCardBg: '#0f172a',
  contentCardBorder: '#1e293b',

  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',

  accent: '#818cf8',
  accentHover: '#a5b4fc',
  accentLight: 'rgba(129, 140, 248, 0.15)',
  selectedBg: 'rgba(129, 140, 248, 0.12)',
  hoverBg: '#1e293b',

  borderLight: '#1e293b',
  border: '#334155',
  cardBg: '#0f172a',
  borderColor: '#334155',

  shadowSm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  shadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
  shadowMd: '0 4px 16px rgba(0, 0, 0, 0.5)',

  radiusSm: 6,
  radius: 8,
  radiusLg: 12,

  crPagePadding: 32,
  crCardPadding: 24,
  crGap: 24,
  crRadius: 16,
  crShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
  crShadowHover: '0 12px 40px rgba(0, 0, 0, 0.35)',
  crCardBg: '#0f172a',
}

export const themes: Record<ThemeMode, Theme> = {
  light: lightTheme,
  dark: darkTheme,
}

/** Default export for components that don't have theme context yet (e.g. before provider). */
export const theme = lightTheme

export function getTheme(mode: ThemeMode): Theme {
  return themes[mode]
}
