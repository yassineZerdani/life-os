import { WarningOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import type { Alert } from '../../types/controlRoom'
import { useTheme } from '../../hooks/useTheme'
import { ControlRoomCard } from './ControlRoomCard'

interface CriticalSignalsCardProps {
  alerts: Alert[]
  loading?: boolean
}

const SEVERITY_CONFIG = {
  high: { color: '#ef4444', icon: <WarningOutlined /> },
  medium: { color: '#f59e0b', icon: <ExclamationCircleOutlined /> },
  low: { color: '#3b82f6', icon: <InfoCircleOutlined /> },
} as const

export function CriticalSignalsCard({ alerts, loading }: CriticalSignalsCardProps) {
  const theme = useTheme()

  return (
    <ControlRoomCard>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: theme.textPrimary,
          margin: 0,
          marginBottom: 16,
        }}
      >
        Critical Signals
      </h3>
      {loading ? (
        <div style={{ color: theme.textMuted, fontSize: 15 }}>Loading…</div>
      ) : alerts.length === 0 ? (
        <div style={{ color: theme.textSecondary, fontSize: 15 }}>
          No critical signals. You're in the green.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {alerts.map((a) => {
            const config = SEVERITY_CONFIG[a.severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.medium
            return (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: 12,
                  background: theme.hoverBg,
                  borderRadius: theme.radius,
                  borderLeft: `4px solid ${config.color}`,
                }}
              >
                <span style={{ color: config.color, marginTop: 2 }}>{config.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: theme.textPrimary, fontSize: 14 }}>{a.message}</div>
                  {a.domain && (
                    <div
                      style={{
                        fontSize: 11,
                        color: theme.textMuted,
                        textTransform: 'capitalize',
                        marginTop: 4,
                      }}
                    >
                      {a.domain}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    background: config.color,
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  {a.severity}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </ControlRoomCard>
  )
}
