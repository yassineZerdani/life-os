/**
 * Interactive body canvas: silhouette path + organ overlays (legacy).
 * Prefer AnatomyCanvas for the premium anatomy explorer.
 */
import { useState, useCallback, useRef } from 'react'
import { useTheme } from '../../../hooks/useTheme'
import type { Organ } from '../../../services/bodyIntelligence'
import { FRONT_BODY_SILHOUETTE, BACK_BODY_SILHOUETTE, FRONT_ORGAN_SHAPES, BACK_ORGAN_SHAPES } from './anatomyAssets'
import { BODY_VIEWBOX, getHealthColor, type BodyViewMode } from './constants'

interface OrganWithScore extends Organ {
  health_score?: number
}

interface InteractiveBodyCanvasProps {
  viewMode: BodyViewMode
  organByRegionId: Record<string, OrganWithScore>
  selectedRegionId: string | null
  onSelectRegion: (regionId: string) => void
}

export function InteractiveBodyCanvas({
  viewMode,
  organByRegionId,
  selectedRegionId,
  onSelectRegion,
}: InteractiveBodyCanvasProps) {
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoverRegionId, setHoverRegionId] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null)

  const isFront = viewMode === 'front' || viewMode === 'systems' || viewMode === 'organ'
  const silhouettePath = isFront ? FRONT_BODY_SILHOUETTE : BACK_BODY_SILHOUETTE
  const regions = isFront ? FRONT_ORGAN_SHAPES : BACK_ORGAN_SHAPES

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGGElement>, regionId: string, label: string) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, label })
      setHoverRegionId(regionId)
    },
    []
  )

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
    setHoverRegionId(null)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 420,
        margin: '0 auto',
        padding: 24,
      }}
    >
      <style>{`
        .body-map-organ-overlay {
          transition: filter 0.2s ease, opacity 0.2s ease;
          cursor: pointer;
        }
        .body-map-organ-overlay:hover {
          filter: drop-shadow(0 0 12px currentColor);
          opacity: 1;
        }
        .body-map-organ-overlay.selected {
          filter: drop-shadow(0 0 16px currentColor);
          animation: organ-pulse 2s ease-in-out infinite;
        }
        @keyframes organ-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.92; }
        }
      `}</style>

      <svg
        viewBox={`0 0 ${BODY_VIEWBOX.w} ${BODY_VIEWBOX.h}`}
        width="100%"
        height="auto"
        style={{ display: 'block' }}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="body-map-organ-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#22c55e" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.85" />
          </linearGradient>
          <filter id="body-map-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Silhouette as path — premium anatomical outline */}
        <path
          d={silhouettePath}
          fill="currentColor"
          fillOpacity={0.12}
          stroke="currentColor"
          strokeOpacity={0.35}
          strokeWidth={1.5}
          style={{ opacity: 0.9 }}
        />

        {/* Organ overlays — path-based anatomical shapes */}
        {regions.map((reg) => {
          const organ = organByRegionId[reg.id]
          const score = organ?.health_score
          const color = getHealthColor(score)
          const isSelected = selectedRegionId === reg.id
          const isHovered = hoverRegionId === reg.id
          return (
            <g
              key={reg.id}
              className="body-map-organ-overlay"
              style={{ opacity: organ ? 0.9 : 0.5 }}
              onMouseMove={(e) => handleMouseMove(e, reg.id, organ?.name ?? reg.label)}
              onMouseLeave={handleMouseLeave}
              onClick={() => onSelectRegion(reg.id)}
            >
              <path
                d={reg.path}
                fill="url(#body-map-organ-fill)"
                stroke={color}
                strokeWidth={isSelected || isHovered ? 3 : 2}
                style={{
                  filter: isSelected || isHovered ? 'url(#body-map-glow)' : undefined,
                }}
                className={isSelected ? 'selected' : ''}
              />
            </g>
          )
        })}
      </svg>

      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x + 12,
            top: tooltip.y + 8,
            padding: '6px 10px',
            borderRadius: 8,
            background: theme.contentCardBg,
            border: `1px solid ${theme.contentCardBorder}`,
            boxShadow: theme.shadowMd,
            pointerEvents: 'none',
            fontSize: 13,
            fontWeight: 500,
            color: theme.textPrimary,
            zIndex: 10,
          }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  )
}
