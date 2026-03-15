/**
 * PeakExperiencePanel — most alive and most meaningful experiences.
 */
import { Card, Typography, Progress } from 'antd'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import type { LifeExperience } from '../../services/lifeMemory'

const { Text } = Typography

export interface PeakExperiencePanelProps {
  peakAliveness: LifeExperience[]
  peakMeaning: LifeExperience[]
  loading?: boolean
}

export function PeakExperiencePanel({
  peakAliveness,
  peakMeaning,
  loading,
}: PeakExperiencePanelProps) {
  const theme = useTheme()

  if (loading) {
    return (
      <Card size="small" style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
        <Text type="secondary">Loading…</Text>
      </Card>
    )
  }

  const renderList = (items: LifeExperience[], label: string, color: string) => (
    <div style={{ marginBottom: 16 }}>
      <Text strong style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.textMuted }}>
        {label}
      </Text>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.slice(0, 5).map((e) => (
          <div
            key={e.id}
            style={{
              padding: 8,
              borderRadius: 8,
              background: theme.hoverBg ?? 'rgba(0,0,0,0.02)',
              borderLeft: `3px solid ${color}`,
            }}
          >
            <Text style={{ fontSize: 13 }}>{e.title}</Text>
            <div style={{ marginTop: 4 }}>
              {e.date && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {new Date(e.date).toLocaleDateString()}
                </Text>
              )}
              {(e.aliveness_score != null || e.meaning_score != null) && (
                <Progress
                  percent={
                    e.aliveness_score != null
                      ? Math.round(e.aliveness_score * 10)
                      : e.meaning_score != null
                        ? Math.round(e.meaning_score * 10)
                        : 0
                  }
                  size="small"
                  showInfo={false}
                  strokeColor={color}
                  style={{ marginTop: 4, maxWidth: 120 }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Card
      size="small"
      title={<span style={{ fontWeight: 600, fontSize: 14 }}>Peak experiences</span>}
      style={{
        borderRadius: 16,
        border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
        background: theme.contentCardBg ?? undefined,
      }}
    >
      {peakAliveness.length === 0 && peakMeaning.length === 0 ? (
        <Text type="secondary" style={{ fontSize: 13 }}>
          Rate experiences with aliveness and meaning to see your peaks here.
        </Text>
      ) : (
        <>
          {renderList(peakAliveness, 'Most alive', DOMAIN_COLORS.experiences)}
          {renderList(peakMeaning, 'Most meaningful', '#22c55e')}
        </>
      )}
    </Card>
  )
}
