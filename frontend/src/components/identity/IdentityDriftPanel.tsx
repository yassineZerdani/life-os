import { Card, Typography, Empty } from 'antd'
import { WarningOutlined } from '@ant-design/icons'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import type { IdentityDriftSignal } from '../../services/personaLab'

const { Text } = Typography

const SEVERITY_COLOR: Record<string, string> = {
  low: '#94a3b8',
  medium: '#f59e0b',
  high: '#ef4444',
}

interface IdentityDriftPanelProps {
  signals: IdentityDriftSignal[]
  loading?: boolean
  onDismiss?: (id: string) => void
}

export function IdentityDriftPanel({ signals, loading, onDismiss }: IdentityDriftPanelProps) {
  const theme = useTheme()
  const accent = DOMAIN_COLORS.identity ?? '#64748b'
  if (loading) return null
  if (!signals?.length) {
    return (
      <Card
        size="small"
        title={<span style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}><WarningOutlined style={{ color: accent }} /> Identity drift</span>}
        style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}
      >
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No drift signals" />
      </Card>
    )
  }
  return (
    <Card
      size="small"
      title={<span style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}><WarningOutlined style={{ color: accent }} /> Identity drift</span>}
      style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {signals.map((s) => (
          <div key={s.id} style={{ padding: 10, borderRadius: 8, borderLeft: `3px solid ${SEVERITY_COLOR[s.severity] ?? accent}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {s.source}{s.detected_at && ` · ${new Date(s.detected_at).toLocaleDateString()}`}
              </Text>
              {onDismiss && <Text type="secondary" style={{ cursor: 'pointer', fontSize: 11 }} onClick={() => onDismiss(s.id)}>Dismiss</Text>}
            </div>
            <Text style={{ fontSize: 13, display: 'block', marginTop: 4 }}>{s.description}</Text>
          </div>
        ))}
      </div>
    </Card>
  )
}
