import { Card } from 'antd'
import { XPProgressBar } from './XPProgressBar'
import type { DomainScore } from '../../types'

interface DomainLevelCardProps {
  score: DomainScore
  loading?: boolean
}

export function DomainLevelCard({ score, loading }: DomainLevelCardProps) {
  const xpRequired = score.xp_required ?? 100

  return (
    <Card size="small" loading={loading} style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{score.domain_name}</span>
        <span
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Lv.{score.level ?? 1}
        </span>
      </div>
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Score</div>
        <div
          style={{
            height: 6,
            background: '#e2e8f0',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${score.score}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #22c55e, #10b981)',
              borderRadius: 3,
              transition: 'width 0.3s',
            }}
          />
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{Math.round(score.score)}/100</div>
      </div>
      <XPProgressBar
        current={score.xp ?? 0}
        required={xpRequired}
        level={score.level ?? 1}
        showLevel={false}
      />
    </Card>
  )
}
