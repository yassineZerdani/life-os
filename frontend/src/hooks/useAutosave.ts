/**
 * Debounced autosave for diary/editor. Calls onSave after delay when value changes.
 */
import { useEffect, useRef, useCallback } from 'react'

interface UseAutosaveOptions {
  value: string
  onSave: (value: string) => void
  delayMs?: number
  enabled?: boolean
}

export function useAutosave({ value, onSave, delayMs = 2000, enabled = true }: UseAutosaveOptions) {
  const lastSaved = useRef(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (enabled && value !== lastSaved.current) {
      lastSaved.current = value
      onSave(value)
    }
  }, [value, onSave, enabled])

  useEffect(() => {
    if (!enabled) return
    if (value === lastSaved.current) return
    timeoutRef.current = setTimeout(flush, delayMs)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [value, delayMs, enabled, flush])

  return { flush }
}
