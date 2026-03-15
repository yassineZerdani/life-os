import { Card, Typography, Empty, Progress } from 'antd'
import { useTheme } from '../../hooks/useTheme'
import type { ThoughtPattern } from '../../services/mindEngine'

const { Text } = Typography

interface ThoughtPatternPanelProps {
  patterns: ThoughtPattern[]
  loading?: boolean
  onDelete?: (id: string) => void
}

export function ThoughtPatternPanel({ patterns, loading, onDelete }: ThoughtPatternPanelProps) {
  const theme = useTheme()
  if (loading) return null
  if (!patterns?.length) {
    return (
      <Card size="small" title={<span style={{ fontWeight: 600, fontSize: 14 }}>Recurring thought patterns</span>} style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Add thought patterns you notice recurring" />
      </Card>
    )
  }
  return (
    <Card size="small" title={<span style={{ fontWeight: 600, fontSize: 14 }}>Recurring thought patterns</span>} style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {patterns.map((p) => (
          <div key={p.id} style={{ padding: 12, borderRadius: 10, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text strong style={{ fontSize: 13 }}>{p.title}</Text>
              {onDelete && <Text type="secondary" style={{ cursor: 'pointer', fontSize: 11 }} onClick={() => onDelete(p.id)}>Remove</Text>}
            </div>
            {p.description && <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>{p.description}</Text>}
            {(p.frequency_score != null || p.severity_score != null) && (
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                {p.frequency_score != null && (
                  <div style={{ flex: 1 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Frequency</Text>
                    <Progress percent={Math.round((p.frequency_score / 10) * 100)} size="small" showInfo={false} strokeColor="#94a3b8" />
                  </div>
                )}
                {p.severity_score != null && (
                  <div style={{ flex: 1 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Severity</Text>
                    <Progress percent={Math.round((p.severity_score / 10) * 100)} size="small" showInfo={false} strokeColor="#94a3b8" />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
