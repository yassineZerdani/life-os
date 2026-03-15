/**
 * LifeMap — map points by location with filters. Renders a simple list when no map lib.
 */
import { Card, Typography, Select } from 'antd'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import type { MapPoint } from '../../services/lifeMemory'

const { Text } = Typography

export interface LifeMapProps {
  points: MapPoint[]
  emotionalTone?: string
  category?: string
  onFilterChange?: (filters: { emotional_tone?: string; category?: string }) => void
  loading?: boolean
}

export function LifeMap({ points, emotionalTone, category, onFilterChange, loading }: LifeMapProps) {
  const theme = useTheme()

  const tones = [...new Set(points.map((p) => p.emotional_tone).filter(Boolean))] as string[]
  const categories = [...new Set(points.map((p) => p.category))]

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: theme.textMuted }}>
        Loading map…
      </div>
    )
  }

  return (
    <div>
      {(onFilterChange && (tones.length > 0 || categories.length > 0)) && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <Select
            placeholder="Emotional tone"
            allowClear
            style={{ minWidth: 140 }}
            value={emotionalTone || undefined}
            onChange={(v) => onFilterChange({ emotional_tone: v ?? undefined, category })}
            options={tones.map((t) => ({ value: t, label: t }))}
          />
          <Select
            placeholder="Category"
            allowClear
            style={{ minWidth: 140 }}
            value={category || undefined}
            onChange={(v) => onFilterChange({ emotional_tone: emotionalTone, category: v ?? undefined })}
            options={categories.map((c) => ({ value: c, label: c }))}
          />
        </div>
      )}
      {points.length === 0 ? (
        <Card
          style={{
            borderRadius: 16,
            border: `1px dashed ${theme.border ?? '#cbd5e1'}`,
            background: 'transparent',
            textAlign: 'center',
            padding: 32,
          }}
        >
          <Text type="secondary">
            No locations yet. Add latitude and longitude to experiences to see them on the map.
          </Text>
        </Card>
      ) : (
        <Card
          style={{
            borderRadius: 16,
            border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
            background: theme.contentCardBg ?? undefined,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {points.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: theme.hoverBg ?? 'rgba(0,0,0,0.02)',
                  borderLeft: `3px solid ${DOMAIN_COLORS.experiences}`,
                }}
              >
                <Text strong>{p.title}</Text>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                  </Text>
                  {p.date && (
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                      {new Date(p.date).toLocaleDateString()}
                    </Text>
                  )}
                </div>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>{p.category}</Text>
                  {p.emotional_tone && (
                    <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>· {p.emotional_tone}</Text>
                  )}
                  {(p.aliveness_score != null || p.meaning_score != null) && (
                    <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                      Alive: {p.aliveness_score ?? '—'} · Meaning: {p.meaning_score ?? '—'}
                    </Text>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
