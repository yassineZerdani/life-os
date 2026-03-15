/**
 * ExperienceTimeline — chronological life experiences with tone, intensity, lesson.
 */
import { Card, Typography, Tag, Progress } from 'antd'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import type { ExperienceWithRelations } from '../../services/lifeMemory'

const { Text } = Typography

export interface ExperienceTimelineProps {
  items: ExperienceWithRelations[]
  onSelect?: (id: string) => void
  loading?: boolean
}

export function ExperienceTimeline({ items, onSelect, loading }: ExperienceTimelineProps) {
  const theme = useTheme()

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: theme.textMuted }}>
        Loading timeline…
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card
        style={{
          borderRadius: 16,
          border: `1px dashed ${theme.border ?? '#cbd5e1'}`,
          background: 'transparent',
          textAlign: 'center',
          padding: 32,
        }}
      >
        <Text type="secondary">No experiences yet. Log moments that felt vivid, meaningful, or transformative.</Text>
      </Card>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {items.map(({ experience, people, tags }) => {
        const dateStr = experience.date
          ? new Date(experience.date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : ''
        return (
          <Card
            key={experience.id}
            size="small"
            style={{
              borderRadius: 14,
              borderLeft: `4px solid ${DOMAIN_COLORS.experiences}`,
              border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
              background: theme.contentCardBg ?? undefined,
              cursor: onSelect ? 'pointer' : undefined,
            }}
            onClick={() => onSelect?.(experience.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text strong style={{ fontSize: 15 }}>{experience.title}</Text>
                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <Tag color={DOMAIN_COLORS.experiences}>{experience.category}</Tag>
                  {experience.emotional_tone && (
                    <Tag>{experience.emotional_tone}</Tag>
                  )}
                  {tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
                {experience.description && (
                  <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 8 }}>
                    {experience.description}
                  </Text>
                )}
                {people.length > 0 && (
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 6 }}>
                    With: {people.map((p) => p.person_name).join(', ')}
                  </Text>
                )}
                {experience.lesson_note && (
                  <div style={{ marginTop: 8, padding: 8, background: theme.hoverBg ?? 'rgba(0,0,0,0.03)', borderRadius: 8 }}>
                    <Text style={{ fontSize: 12, fontStyle: 'italic' }}>Lesson: {experience.lesson_note}</Text>
                  </div>
                )}
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>{dateStr}</Text>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {experience.aliveness_score != null && (
                  <div style={{ width: 56 }}>
                    <Text type="secondary" style={{ fontSize: 10 }}>Alive</Text>
                    <Progress
                      percent={Math.round(experience.aliveness_score * 10)}
                      size="small"
                      showInfo={false}
                      strokeColor={DOMAIN_COLORS.experiences}
                    />
                  </div>
                )}
                {experience.meaning_score != null && (
                  <div style={{ width: 56 }}>
                    <Text type="secondary" style={{ fontSize: 10 }}>Meaning</Text>
                    <Progress
                      percent={Math.round(experience.meaning_score * 10)}
                      size="small"
                      showInfo={false}
                      strokeColor="#22c55e"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
