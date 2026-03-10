import { Card, Progress } from 'antd'
import { DOMAIN_COLORS } from './constants'

interface WeeklyBalancePanelProps {
  weeklyTime: Record<string, number>
  weeklyBalance: Array<Record<string, string | number>>
  balanceScore: number
  loading?: boolean
}

export function WeeklyBalancePanel({
  weeklyTime,
  weeklyBalance,
  balanceScore,
  loading,
}: WeeklyBalancePanelProps) {
  const totalHours = Object.values(weeklyTime).reduce((a, b) => a + b, 0)
  const entries = Object.entries(weeklyTime).filter(([, v]) => v > 0)
  let cumulative = 0
  const segments = entries.map(([domain, hours]) => {
    const pct = totalHours > 0 ? (hours / totalHours) * 100 : 0
    const start = cumulative
    cumulative += pct
    return { domain, hours, pct, start }
  })
  const domains = Array.from(
    new Set(weeklyBalance.flatMap((d) => Object.keys(d).filter((k) => k !== 'week')))
  ).sort()

  return (
    <Card
      title="Weekly Balance"
      loading={loading}
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 24, flex: 1, minWidth: 200 }}>
            <div
              style={{
                width: 140,
                height: 140,
                flexShrink: 0,
                borderRadius: '50%',
                background:
                  segments.length > 0
                    ? `conic-gradient(${segments
                        .map(
                          (s) =>
                            `${DOMAIN_COLORS[s.domain] || '#94a3b8'} ${s.start}% ${s.start + s.pct}%`
                        )
                        .join(', ')})`
                    : 'rgba(148, 163, 184, 0.2)',
              }}
            />
            <div style={{ flex: 1 }}>
              {entries.length === 0 ? (
                <div style={{ color: '#64748b' }}>No time data this week</div>
              ) : (
                entries.map(([domain, hours]) => (
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
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        background: DOMAIN_COLORS[domain] || '#94a3b8',
                      }}
                    />
                    <span style={{ color: '#0f172a', textTransform: 'capitalize' }}>{domain}</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 600, color: '#0f172a' }}>
                      {hours}h
                    </span>
                    <span style={{ color: '#64748b', fontSize: 12 }}>
                      ({totalHours > 0 ? ((hours / totalHours) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                Balance Score
              </div>
              <Progress
                type="circle"
                percent={Math.round(balanceScore)}
                size={100}
                strokeColor={
                  balanceScore >= 70 ? '#22c55e' : balanceScore >= 40 ? '#eab308' : '#ef4444'
                }
                format={(p) => (
                  <span style={{ color: '#0f172a', fontSize: 18, fontWeight: 700 }}>{p}</span>
                )}
              />
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Total: {totalHours.toFixed(1)}h</div>
          </div>
        </div>
        {weeklyBalance.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
              Weekly stacked distribution
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {weeklyBalance.slice(-6).map((week) => {
                const total = domains.reduce(
                  (a, dom) => a + (Number(week[dom]) || 0),
                  0
                )
                return (
                  <div
                    key={String(week.week)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <div style={{ width: 60, fontSize: 11, color: '#64748b' }}>
                      {String(week.week)}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 20,
                        display: 'flex',
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: '#e2e8f0',
                      }}
                    >
                      {domains.map((dom) => {
                        const val = Number(week[dom]) || 0
                        const w = total > 0 ? (val / total) * 100 : 0
                        return (
                          <div
                            key={dom}
                            style={{
                              width: `${w}%`,
                              background: DOMAIN_COLORS[dom] || '#64748b',
                              minWidth: w > 0 ? 4 : 0,
                            }}
                            title={`${dom}: ${val}h`}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
