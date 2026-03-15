import { Card, Empty } from 'antd'
import { useTheme } from '../../hooks/useTheme'
import type { TriggerEntry, BehaviorLoop } from '../../services/mindEngine'

interface TriggerLoopMapProps {
  triggers: TriggerEntry[]
  loops: BehaviorLoop[]
  loading?: boolean
}

export function TriggerLoopMap({ triggers, loops, loading }: TriggerLoopMapProps) {
  const theme = useTheme()
  const borderColor = theme.contentCardBorder ?? '#e2e8f0'
  if (loading) return null
  const hasTriggers = triggers?.length > 0
  const hasLoops = loops?.length > 0
  if (!hasTriggers && !hasLoops) {
    return (
      <Card size="small" title="Trigger to loop map" style={{ borderRadius: 12, border: `1px solid ${borderColor}` }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Log triggers and map behavior loops" />
      </Card>
    )
  }
  return (
    <Card size="small" title="Trigger to loop map" style={{ borderRadius: 12, border: `1px solid ${borderColor}` }}>
      {hasLoops && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 8 }}>Mapped loops</div>
          {loops.map((loop) => (
            <div key={loop.id} style={{ padding: 12, borderRadius: 10, border: `1px solid ${borderColor}`, marginBottom: 8 }}>
              <strong style={{ fontSize: 13 }}>{loop.title}</strong>
              {loop.trigger_summary && <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 4 }}>Trigger: {loop.trigger_summary}</div>}
              {loop.emotional_sequence && <div style={{ fontSize: 12, color: theme.textSecondary }}>Emotion: {loop.emotional_sequence}</div>}
              {loop.behavioral_sequence && <div style={{ fontSize: 12, color: theme.textSecondary }}>Behavior: {loop.behavioral_sequence}</div>}
            </div>
          ))}
        </div>
      )}
      {hasTriggers && (
        <div>
          <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 6 }}>Recent triggers</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {triggers.slice(0, 12).map((t) => (
              <span key={t.id} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, border: `1px solid ${borderColor}`, color: theme.textSecondary }}>
                {t.trigger_type}{t.linked_emotion ? ' -> ' + t.linked_emotion : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
