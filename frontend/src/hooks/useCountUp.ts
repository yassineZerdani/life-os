import { useState, useEffect, useRef } from 'react'

/** Animates a number from 0 to target over duration (ms). */
export function useCountUp(
  target: number,
  duration = 800,
  enabled = true,
  decimals = 0
): number {
  const [value, setValue] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled || target === 0) {
      setValue(target)
      return
    }
    startRef.current = null
    const step = (timestamp: number) => {
      if (startRef.current == null) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - (1 - progress) ** 2
      const next = target * eased
      setValue(decimals > 0 ? Number(next.toFixed(decimals)) : Math.round(next))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration, enabled, decimals])

  return value
}
