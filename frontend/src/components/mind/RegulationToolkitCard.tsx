import { Card, Typography, Empty } from 'antd'
import { useTheme } from '../../hooks/useTheme'
import type { RegulationToolUse } from '../../services/mindEngine'

const { Text } = Typography

interface RegulationToolkitCardProps {
  uses: RegulationToolUse[]
  topTools: { tool_name: string; count: number; avg_effectiveness: number | null }[]
  loading?: boolean
  onDeleteUse?: (id: string) => void
}

export function RegulationToolkitCard({
  uses,
  topTools,
  loading,
  onDeleteUse,
}: RegulationToolkitCardProps) {
  const theme = useTheme()

  if (loading) return null

  const hasUses = uses?.length > 0
  const hasTop = topTools?.length > 0

  if (!hasUses && !hasTop) {
    return (
      <Card
        size="small"
        title={<span style={{ fontWeight: 600, fontSize: 14 }}>Regulation toolkit</span>}
        style={{
          borderRadius: 12,
          border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Log when you use coping tools and how they help"
        />
      </Card>
    )
  }

  return (
    <Card
      size="small"
      title={<span style={{ fontWeight: 600, fontSize: 14 }}>Regulation toolkit</span>}
      style={{
        borderRadius: 12,
        border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
      }}
    >
      {hasTop && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Tools that help most</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
            {topTools.map((t) => (
              <div
                key={t.tool_name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  borderRadius: 8,
                  background: theme.contentCardBg ?? undefined,
                }}
              >
                <Text style={{ fontSize: 13 }}>{t.tool_name}</Text>
                <span style={{ fontSize: 12, color: theme.textMuted }}>
                  {t.count} uses
                  {t.avg_effectiveness != null ? ` · ${t.avg_effectiveness}/10` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {hasUses && (
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>Recent uses</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
            {uses.slice(0, 5).map((u) => (
              <div
                key={u.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 12,
                }}
              >
                <span>{u.tool_name} · {u.date}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {u.effectiveness_score != null && (
                    <Text type="secondary">{u.effectiveness_score}/10</Text>
                  )}
                  {onDeleteUse && (
                    <Text type="secondary" style={{ cursor: 'pointer' }} onClick={() => onDeleteUse(u.id)}>Remove</Text>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
