import { Card, Empty } from 'antd'
import { BulbOutlined, WarningOutlined, RiseOutlined } from '@ant-design/icons'
import type { InsightCard } from '../../types/controlRoom'

interface LifeInsightsPanelProps {
  insights: InsightCard[]
  loading?: boolean
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  trend: <RiseOutlined />,
  warning: <WarningOutlined />,
  imbalance: <WarningOutlined />,
  achievement: <RiseOutlined />,
  prediction: <BulbOutlined />,
}

export function LifeInsightsPanel({ insights, loading }: LifeInsightsPanelProps) {
  return (
    <Card
      title="Life Insights"
      loading={loading}
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {insights.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No insights yet"
          style={{ color: '#64748b' }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {insights.map((i) => {
            const color =
              i.severity === 'high'
                ? '#ef4444'
                : i.severity === 'medium'
                  ? '#f59e0b'
                  : '#3b82f6'
            const icon = TYPE_ICONS[i.type] || <BulbOutlined />
            return (
              <div
                key={i.id}
                style={{
                  padding: 12,
                  background: '#f8fafc',
                  borderRadius: 8,
                  borderLeft: `4px solid ${color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color, marginTop: 2 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#0f172a', fontSize: 14 }}>{i.message}</div>
                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        marginTop: 6,
                        fontSize: 11,
                        color: '#64748b',
                      }}
                    >
                      {i.domain && (
                        <span style={{ textTransform: 'capitalize' }}>{i.domain}</span>
                      )}
                      <span>{i.type}</span>
                      <span
                        style={{
                          background: color,
                          color: '#fff',
                          padding: '1px 6px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                        }}
                      >
                        {i.severity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
