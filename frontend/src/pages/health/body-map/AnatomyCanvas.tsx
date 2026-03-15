/**
 * Premium anatomy canvas: subtle silhouette + organ-shaped overlays.
 * Large focal point, dark styling, Apple Health–inspired.
 */
import { useState, useCallback, useRef } from 'react'
import { useTheme } from '../../../hooks/useTheme'
import { FRONT_BODY_SILHOUETTE, BACK_BODY_SILHOUETTE } from './anatomyAssets'
import { BODY_VIEWBOX, type BodyViewMode } from './constants'
import { OrganOverlayLayer, type OrganWithScore } from './OrganOverlayLayer'
import { OrganTooltip } from './OrganTooltip'

interface AnatomyCanvasProps {
  viewMode: BodyViewMode
  organByRegionId: Record<string, OrganWithScore>
  selectedRegionId: string | null
  onSelectRegion: (regionId: string) => void
}

export function AnatomyCanvas({
  viewMode,
  organByRegionId,
  selectedRegionId,
  onSelectRegion,
}: AnatomyCanvasProps) {
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoverRegionId, setHoverRegionId] = useState<string | null>(null)
  const [hoverLabel, setHoverLabel] = useState<string>('')
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null)

  const isFront = viewMode === 'front' || viewMode === 'systems' || viewMode === 'organ'
  const silhouettePath = isFront ? FRONT_BODY_SILHOUETTE : BACK_BODY_SILHOUETTE

  const handleHoverRegion = useCallback(
    (regionId: string | null, label: string) => {
      setHoverRegionId(regionId)
      setHoverLabel(label)
      if (!regionId || !label) setTooltip(null)
    },
    []
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!hoverRegionId || !hoverLabel || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        label: hoverLabel,
      })
    },
    [hoverRegionId, hoverLabel]
  )

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
    setHoverRegionId(null)
    setHoverLabel('')
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 520,
        margin: '0 auto',
        padding: 24,
      }}
    >
      <svg
        viewBox={`0 0 ${BODY_VIEWBOX.w} ${BODY_VIEWBOX.h}`}
        width="100%"
        height="auto"
        style={{ display: 'block' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <filter id="anatomy-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Body silhouette — subtle, not dominant */}
        <path
          d={silhouettePath}
          fill="currentColor"
          fillOpacity={0.06}
          stroke="currentColor"
          strokeOpacity={0.14}
          strokeWidth={1.2}
        />

        {/* Organ overlays — organ-shaped, anatomically placed */}
        <OrganOverlayLayer
          viewMode={viewMode}
          organByRegionId={organByRegionId}
          selectedRegionId={selectedRegionId}
          hoverRegionId={hoverRegionId}
          onSelectRegion={onSelectRegion}
          onHoverRegion={handleHoverRegion}
        />
      </svg>

      {tooltip && (
        <OrganTooltip
          x={tooltip.x}
          y={tooltip.y}
          label={tooltip.label}
          visible
          theme={theme}
        />
      )}
    </div>
  )
}
