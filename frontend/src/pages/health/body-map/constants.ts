/**
 * Body map constants: view modes, health colors (premium anatomy palette).
 */

export type BodyViewMode = 'front' | 'back' | 'systems' | 'organ'

/** Soft, medically credible palette — no neon. */
export const HEALTH_COLORS = {
  healthy: '#4ade80',
  moderate: '#eab308',
  needsAttention: '#fb923c',
  stressed: '#f87171',
} as const

export function getHealthColor(score: number | undefined): string {
  if (score == null) return HEALTH_COLORS.healthy
  if (score >= 75) return HEALTH_COLORS.healthy
  if (score >= 50) return HEALTH_COLORS.moderate
  if (score >= 25) return HEALTH_COLORS.needsAttention
  return HEALTH_COLORS.stressed
}

export function getHealthLabel(score: number | undefined): string {
  if (score == null) return 'Healthy'
  if (score >= 75) return 'Healthy'
  if (score >= 50) return 'Moderate'
  if (score >= 25) return 'Needs attention'
  return 'Stressed'
}

export const BODY_VIEWBOX = { w: 400, h: 820 }
