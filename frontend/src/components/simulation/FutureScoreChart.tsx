import { Card } from 'antd'
import type { DomainProjection } from '../../services/simulation'

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

interface FutureScoreChartProps {
  domains: DomainProjection[]
  monthsAhead: number
  loading?: boolean
}

export function FutureScoreChart({ domains, monthsAhead, loading }: FutureScoreChartProps) {
  if (domains.length === 0) {
    return (
      <Card title={`Predicted Score Evolution (${monthsAhead} months)`} loading={loading}>
        <div style={{ color: '#64748b', textAlign: 'center', padding: 24 }}>
          No domain data. Run a simulation to see projections.
        </div>
      </Card>
    )
  }

  const maxScore = 100
  const sorted = [...domains].sort((a, b) => b.predicted_score - a.predicted_score)

  return (
    <Card title={`Predicted Score Evolution (${monthsAhead} months)`} loading={loading}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sorted.map((d) => {
          const color = DOMAIN_COLORS[d.domain] || '#94a3b8'
          const pct = (d.predicted_score / maxScore) * 100
          return (
            <div key={d.domain} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 90, fontSize: 12, textTransform: 'capitalize' }}>
                {d.domain}
              </div>
              <div
                style={{
                  flex: 1,
                  height: 28,
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: '#e2e8f0',
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    minWidth: d.predicted_score > 0 ? 8 : 0,
                    height: '100%',
                    background: color,
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              <div style={{ width: 80, fontSize: 13, fontWeight: 600, textAlign: 'right' }}>
                {d.current_score} → {d.predicted_score}
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
        {sorted.map((d) => (
          <div key={d.domain} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: DOMAIN_COLORS[d.domain] || '#94a3b8',
              }}
            />
            <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{d.domain}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
