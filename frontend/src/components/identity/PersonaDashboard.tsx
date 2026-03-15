import { Card, Typography, Skeleton } from 'antd'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import type { PersonaIdentityProfile, PersonaAspect } from '../../services/personaLab'

const { Text } = Typography

const ASPECT_LABELS: Record<string, string> = {
  current_self: 'Current self',
  ideal_self: 'Ideal self',
  public_self: 'Public self',
  private_self: 'Private self',
  disciplined_self: 'Disciplined self',
  wounded_self: 'Wounded self',
  aspirational: 'Aspirational',
}

interface PersonaDashboardProps {
  profile: PersonaIdentityProfile | null
  aspects: PersonaAspect[]
  loading?: boolean
}

export function PersonaDashboard({ profile, aspects, loading }: PersonaDashboardProps) {
  const theme = useTheme()
  const accent = DOMAIN_COLORS.identity ?? '#64748b'

  const summaries = [
    { key: 'current_self_summary', label: 'Current self', value: profile?.current_self_summary },
    { key: 'ideal_self_summary', label: 'Ideal self', value: profile?.ideal_self_summary },
    { key: 'public_self_summary', label: 'Public self', value: profile?.public_self_summary },
    { key: 'private_self_summary', label: 'Private self', value: profile?.private_self_summary },
  ]

  if (loading) {
    return (
      <Card size="small" style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {summaries.map(({ key, label, value }) => (
          <Card
            key={key}
            size="small"
            title={<span style={{ fontSize: 13, fontWeight: 600, color: accent }}>{label}</span>}
            style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}
          >
            {value ? (
              <Text style={{ fontSize: 13, color: theme.textSecondary ?? '#64748b', whiteSpace: 'pre-wrap' }}>{value}</Text>
            ) : (
              <Text type="secondary" style={{ fontSize: 13, fontStyle: 'italic' }}>Not yet defined</Text>
            )}
          </Card>
        ))}
      </div>
      {aspects.length > 0 && (
        <Card size="small" title={<span style={{ fontWeight: 600, fontSize: 14 }}>Self-aspects</span>} style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {aspects.map((a) => (
              <div key={a.id} style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
                <Text strong style={{ fontSize: 13 }}>{ASPECT_LABELS[a.name] ?? a.name}</Text>
                {a.description && <div><Text type="secondary" style={{ fontSize: 12 }}>{a.description}</Text></div>}
                {(a.strength_score != null || a.tension_score != null) && (
                  <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>
                    {a.strength_score != null && `Strength ${a.strength_score}`}
                    {a.strength_score != null && a.tension_score != null && ' · '}
                    {a.tension_score != null && `Tension ${a.tension_score}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
