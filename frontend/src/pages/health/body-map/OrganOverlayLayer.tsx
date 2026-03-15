/**
 * Organ overlay layer: organ-shaped paths, clickable, with subtle health-based fill and glow.
 */
import { useCallback } from 'react'
import type { Organ } from '../../../services/bodyIntelligence'
import { getHealthColor } from './constants'
import { FRONT_ORGAN_SHAPES, BACK_ORGAN_SHAPES, type OrganShapeDef } from './anatomyAssets'

export interface OrganWithScore extends Organ {
  health_score?: number
}

interface OrganOverlayLayerProps {
  viewMode: 'front' | 'back' | 'systems' | 'organ'
  organByRegionId: Record<string, OrganWithScore>
  selectedRegionId: string | null
  hoverRegionId: string | null
  onSelectRegion: (regionId: string) => void
  onHoverRegion: (regionId: string | null, label: string) => void
}

export function OrganOverlayLayer({
  viewMode,
  organByRegionId,
  selectedRegionId,
  hoverRegionId,
  onSelectRegion,
  onHoverRegion,
}: OrganOverlayLayerProps) {
  const isFront = viewMode === 'front' || viewMode === 'systems' || viewMode === 'organ'
  const shapes: OrganShapeDef[] = isFront ? FRONT_ORGAN_SHAPES : BACK_ORGAN_SHAPES

  const handlePointerEnter = useCallback(
    (reg: OrganShapeDef) => {
      onHoverRegion(reg.id, reg.label)
    },
    [onHoverRegion]
  )
  const handlePointerLeave = useCallback(() => {
    onHoverRegion(null, '')
  }, [onHoverRegion])

  return (
    <g aria-label="Organ overlays">
      {shapes.map((reg) => {
        const organ = organByRegionId[reg.id]
        const score = organ?.health_score
        const color = getHealthColor(score)
        const isSelected = selectedRegionId === reg.id
        const isHovered = hoverRegionId === reg.id
        const active = isSelected || isHovered

        return (
          <g
            key={reg.id}
            style={{ cursor: 'pointer' }}
            onPointerEnter={() => handlePointerEnter(reg)}
            onPointerLeave={handlePointerLeave}
            onClick={() => onSelectRegion(reg.id)}
          >
            <path
              d={reg.path}
              fill={color}
              fillOpacity={organ ? 0.22 : 0.08}
              stroke={color}
              strokeOpacity={active ? 0.9 : 0.4}
              strokeWidth={active ? 2.5 : 1.2}
              style={{
                filter: active ? `drop-shadow(0 0 10px ${color}66)` : undefined,
                transition: 'fill-opacity 0.2s, stroke-opacity 0.2s, stroke-width 0.2s, filter 0.2s',
              }}
            />
          </g>
        )
      })}
    </g>
  )
}
