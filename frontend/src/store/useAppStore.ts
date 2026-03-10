import { create } from 'zustand'
import type { Domain } from '../types'
import type { ThemeMode } from '../styles/theme'

const THEME_KEY = 'lifeos-theme'

function getStoredTheme(): ThemeMode {
  try {
    const v = localStorage.getItem(THEME_KEY)
    if (v === 'dark' || v === 'light') return v
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
      const next = s.themeMode === 'light' ? 'dark' : 'light'
      try {
        localStorage.setItem(THEME_KEY, next)
      } catch {}
      return { themeMode: next }
    }),
}))
