import { Card, Progress } from 'antd'
import type { DomainScore } from '../../types'

interface LifeScoreGaugeProps {
  scores: DomainScore[]
  loading?: boolean
}

export function LifeScoreGauge({ scores, loading }: LifeScoreGaugeProps) {
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length)
    : 0
  const totalLevel = scores.reduce((a, s) => a + (s.level ?? 1), 0)
  return (
    <Card title="Life Score Overview" loading={loading}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <Progress
            type="circle"
            percent={avgScore}
            size={100}
            strokeColor={{
              '0%': '#6366f1',
              '50%': '#8b5cf6',
              '100%': '#a855f7',
            }}
          />
          <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600 }}>Overall</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>{avgScore}/100</div>
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#6366f1' }}>{totalLevel}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Total Domain Levels</div>
        </div>
      </div>
    </Card>
  )
}
