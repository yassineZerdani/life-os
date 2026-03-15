import { Card, Typography } from 'antd'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import type { PersonaAspect } from '../../services/personaLab'

const { Text } = Typography

interface SelfAspectMapProps {
  aspects: PersonaAspect[]
  loading?: boolean
  onEdit?: (aspect: PersonaAspect) => void
}

export function SelfAspectMap({ aspects, loading, onEdit }: SelfAspectMapProps) {
  const theme = useTheme()
  const accent = DOMAIN_COLORS.identity ?? '#64748b'
  if (loading) return null
  const active = aspects.filter((a) => a.active)
  if (active.length === 0) {
    return (
      <Card size="small" title={<span style={{ fontWeight: 600, fontSize: 14 }}>Self-aspect map</span>} style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Add aspects such as current self, ideal self, public self, private self, disciplined self, wounded self, aspirational.
        </Text>
      </Card>
    )
  }
  return (
    <Card size="small" title={<span style={{ fontWeight: 600, fontSize: 14 }}>Self-aspect map</span>} style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {active.map((a) => (
          <div
            key={a.id}
            role={onEdit ? 'button' : undefined}
            onClick={onEdit ? () => onEdit(a) : undefined}
            style={{ padding: 14, borderRadius: 10, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`, cursor: onEdit ? 'pointer' : undefined }}
          >
            <Text strong style={{ fontSize: 14, color: accent }}>{a.name.replace(/_/g, ' ')}</Text>
            {a.description && <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>{a.description}</Text>}
            {(a.strength_score != null || a.tension_score != null) && (
              <div style={{ marginTop: 8, fontSize: 11, color: theme.textMuted }}>
                {a.strength_score != null && <span>Strength {a.strength_score}</span>}
                {a.strength_score != null && a.tension_score != null && ' · '}
                {a.tension_score != null && <span>Tension {a.tension_score}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
