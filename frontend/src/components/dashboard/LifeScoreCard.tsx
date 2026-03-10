import { Card, Progress } from 'antd'
import type { DomainScore } from '../../types'

interface LifeScoreCardProps {
  scores: DomainScore[]
  loading?: boolean
}

export function LifeScoreCard({ scores, loading }: LifeScoreCardProps) {
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length)
    : 0

  return (
    <Card title="Life Score" loading={loading}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Progress
          type="circle"
          percent={avgScore}
          size={120}
          strokeColor={{
            '0%': '#6366f1',
            '100%': '#8b5cf6',
          }}
        />
        <div style={{ marginTop: 12, fontSize: 14, color: '#64748b' }}>
          Overall Life Balance
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {scores.map((s) => (
          <div
            key={s.domain}
            style={{
              flex: '1 1 80px',
              minWidth: 80,
              padding: '8px 12px',
              background: '#f1f5f9',
              borderRadius: 8,
              textAlign: 'center',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 18 }}>{s.score}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{s.domain_name}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
