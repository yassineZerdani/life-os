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

interface WeeklyBalanceChartProps {
  data: Array<Record<string, string | number>>
  loading?: boolean
}

export function WeeklyBalanceChart({ data, loading }: WeeklyBalanceChartProps) {
  const domains = Array.from(
    new Set(data.flatMap((d) => Object.keys(d).filter((k) => k !== 'week')))
  ).sort()

  if (data.length === 0) {
    return (
      <Card title="Weekly Balance" loading={loading}>
        <div style={{ color: '#64748b', textAlign: 'center', padding: 24 }}>
          No weekly data for this period.
        </div>
      </Card>
    )
  }

  return (
    <Card title="Weekly Balance" loading={loading}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.slice(-8).map((week) => {
          const total = domains.reduce((a, dom) => a + (Number(week[dom]) || 0), 0)
          return (
            <div key={String(week.week)} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 70, fontSize: 12 }}>{String(week.week)}</div>
              <div
                style={{
                  flex: 1,
                  height: 24,
                  display: 'flex',
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: '#e2e8f0',
                }}
              >
                {domains.map((dom) => {
                  const hours = Number(week[dom]) || 0
                  const pct = total > 0 ? (hours / total) * 100 : 0
                  return (
                    <div
                      key={dom}
                      title={`${dom}: ${hours}h`}
                      style={{
                        width: `${pct}%`,
                        minWidth: hours > 0 ? 4 : 0,
                        background: DOMAIN_COLORS[dom] || '#94a3b8',
                      }}
                    />
                  )
                })}
              </div>
              <div style={{ width: 50, fontSize: 12, textAlign: 'right' }}>{total}h</div>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
        {domains.map((d) => (
          <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: DOMAIN_COLORS[d] || '#94a3b8',
              }}
            />
            <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{d}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
