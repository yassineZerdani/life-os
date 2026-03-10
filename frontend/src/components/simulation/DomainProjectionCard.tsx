import { Card } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons'
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

interface DomainProjectionCardProps {
  projection: DomainProjection
}

export function DomainProjectionCard({ projection }: DomainProjectionCardProps) {
  const { domain, current_score, predicted_score, score_change } = projection
  const color = DOMAIN_COLORS[domain] || '#94a3b8'
  const isUp = score_change > 0
  const isDown = score_change < 0

  return (
    <Card
      size="small"
      style={{ borderLeft: `4px solid ${color}` }}
      title={
        <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{domain}</span>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#64748b' }}>
          {current_score}
        </div>
        <div style={{ fontSize: 18, color: '#94a3b8' }}>
          {isUp && <ArrowUpOutlined style={{ color: '#22c55e', marginRight: 4 }} />}
          {isDown && <ArrowDownOutlined style={{ color: '#ef4444', marginRight: 4 }} />}
          {!isUp && !isDown && <MinusOutlined style={{ color: '#94a3b8', marginRight: 4 }} />}
          →
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}>
          {predicted_score}
        </div>
        <div
          style={{
            fontSize: 14,
            color: isUp ? '#22c55e' : isDown ? '#ef4444' : '#64748b',
            fontWeight: 500,
          }}
        >
          {score_change > 0 ? '+' : ''}{score_change}
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
        Level {projection.current_level} → {projection.predicted_level} • XP: {projection.current_xp} → {projection.predicted_xp}
      </div>
    </Card>
  )
}
