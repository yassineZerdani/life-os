import { Card } from 'antd'

const DOMAIN_COLORS: Record<string, string> = {
  health: '#22c55e',
  wealth: '#eab308',
  skills: '#6366f1',
  network: '#8b5cf6',
  career: '#f97316',
  relationships: '#ec4899',
  experiences: '#06b6d4',
  identity: '#64748b',
}

interface DomainTimePieChartProps {
  data: Record<string, number>
  loading?: boolean
}

export function DomainTimePieChart({ data, loading }: DomainTimePieChartProps) {
  const total = Object.values(data).reduce((a, b) => a + b, 0)
  const entries = Object.entries(data).filter(([, v]) => v > 0)

  if (total === 0) {
    return (
      <Card title="Domain Time Distribution" loading={loading}>
        <div style={{ color: '#64748b', textAlign: 'center', padding: 24 }}>
          No time data for this period. Log activities in Time Tracking.
        </div>
      </Card>
    )
  }

  let cumulative = 0
  const segments = entries.map(([domain, hours]) => {
    const pct = (hours / total) * 100
    const start = cumulative
    cumulative += pct
    return { domain, hours, pct, start }
  })

  return (
    <Card title="Domain Time Distribution" loading={loading}>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: `conic-gradient(${segments
              .map(
                (s) =>
                  `${DOMAIN_COLORS[s.domain] || '#94a3b8'} ${s.start}% ${s.start + s.pct}%`
              )
              .join(', ')})`,
          }}
        />
        <div style={{ flex: 1, minWidth: 200 }}>
          {entries.map(([domain, hours]) => (
            <div
              key={domain}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  background: DOMAIN_COLORS[domain] || '#94a3b8',
                }}
              />
              <span style={{ textTransform: 'capitalize' }}>{domain}</span>
              <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{hours}h</span>
              <span style={{ color: '#64748b', fontSize: 12 }}>
                ({((hours / total) * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
