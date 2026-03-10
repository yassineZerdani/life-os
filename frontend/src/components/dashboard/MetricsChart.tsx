import { Card } from 'antd'
import type { MetricsTrend } from '../../types'
import dayjs from 'dayjs'

interface MetricsChartProps {
  trends: MetricsTrend[]
  loading?: boolean
}

export function MetricsChart({ trends, loading }: MetricsChartProps) {
  if (trends.length === 0) {
    return (
      <Card title="Metrics Trends" loading={loading}>
        <div style={{ color: '#64748b', textAlign: 'center', padding: 24 }}>
          No metric data yet. Add metric entries to see trends.
        </div>
      </Card>
    )
  }

  return (
    <Card title="Metrics Trends" loading={loading}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {trends.slice(0, 3).map((t, i) => (
          <div key={i}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>{t.name} ({t.unit})</div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 4,
                height: 60,
              }}
            >
              {t.data.slice(-14).map((d, j) => {
                const max = Math.max(...t.data.map((x) => x.value), 1)
                const pct = (d.value / max) * 100
                return (
                  <div
                    key={j}
                    title={`${dayjs(d.timestamp).format('MMM D')}: ${d.value}`}
                    style={{
                      flex: 1,
                      minWidth: 4,
                      height: `${Math.max(pct, 10)}%`,
                      background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                      borderRadius: 4,
                      opacity: 0.8,
                    }}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
