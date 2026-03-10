import { Card, Empty } from 'antd'
import { WarningOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import type { Alert } from '../../types/controlRoom'

interface UrgentAlertsPanelProps {
  alerts: Alert[]
  loading?: boolean
}

const SEVERITY_CONFIG = {
  high: { color: '#ef4444', icon: <WarningOutlined /> },
  medium: { color: '#f59e0b', icon: <ExclamationCircleOutlined /> },
  low: { color: '#3b82f6', icon: <InfoCircleOutlined /> },
} as const

export function UrgentAlertsPanel({ alerts, loading }: UrgentAlertsPanelProps) {
  return (
    <Card
      title="Urgent Alerts"
      loading={loading}
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {alerts.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No urgent alerts"
          style={{ color: '#64748b' }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {alerts.map((a) => {
            const config = SEVERITY_CONFIG[a.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.medium
            return (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: 12,
                  background: '#f8fafc',
                  borderRadius: 8,
                  borderLeft: `4px solid ${config.color}`,
                }}
              >
                <span style={{ color: config.color, marginTop: 2 }}>{config.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#0f172a', fontSize: 14 }}>{a.message}</div>
                  {a.domain && (
                    <div
                      style={{
                        fontSize: 11,
                        color: '#64748b',
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
    </Card>
  )
}
