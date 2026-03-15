import { create } from 'zustand'
import type { Domain } from '../types'
import type { ThemeMode } from '../styles/theme'

const THEME_KEY = 'lifeos-theme'

const VALID_THEMES: ThemeMode[] = ['light', 'dark', 'boys', 'girls', 'light-boys', 'light-girls']

function getStoredTheme(): ThemeMode {
  try {
    const v = localStorage.getItem(THEME_KEY)
    if (v && VALID_THEMES.includes(v as ThemeMode)) return v as ThemeMode
  } catch {}
  return 'light'
}

interface AppState {
  domains: Domain[]
  setDomains: (domains: Domain[]) => void
  selectedDomainSlug: string | null
  setSelectedDomainSlug: (slug: string | null) => void
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

export const useAppStore = create<AppState>((set) => ({
  domains: [],
  setDomains: (domains) => set({ domains }),
  selectedDomainSlug: null,
  setSelectedDomainSlug: (slug) => set({ selectedDomainSlug: slug }),
  themeMode: getStoredTheme(),
  setThemeMode: (mode) => {
    try {
      localStorage.setItem(THEME_KEY, mode)
    } catch {}
    set({ themeMode: mode })
  },
  toggleTheme: () =>
    set((s) => {
      const cycle: ThemeMode[] = ['light', 'dark', 'boys', 'girls', 'light-boys', 'light-girls']
      const i = cycle.indexOf(s.themeMode)
      const next = cycle[(i + 1) % cycle.length]
      try {
        localStorage.setItem(THEME_KEY, next)
      } catch {}
      return { themeMode: next }
    }),
}))
