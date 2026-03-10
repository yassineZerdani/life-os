import { Card } from 'antd'
import type { DomainScore } from '../../types'

interface DomainProgressChartProps {
  scores: DomainScore[]
  loading?: boolean
}

export function DomainProgressChart({ scores, loading }: DomainProgressChartProps) {
  return (
    <Card title="Domain Scores" loading={loading}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {scores.map((s) => (
          <div key={s.domain}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>{s.domain_name}</span>
              <span style={{ fontWeight: 600 }}>{s.score}%</span>
            </div>
            <div
              style={{
                height: 8,
                background: '#e2e8f0',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${s.score}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  borderRadius: 4,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
