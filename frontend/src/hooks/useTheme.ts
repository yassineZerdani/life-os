import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { getTheme } from '../styles/theme'

/** Returns the current theme object for the active theme mode. */
export function useTheme() {
  const themeMode = useAppStore((s) => s.themeMode)
  return useMemo(() => getTheme(themeMode), [themeMode])
}
