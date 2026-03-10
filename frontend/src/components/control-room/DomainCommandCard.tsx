import { Card, Progress } from 'antd'
import { useNavigate } from 'react-router-dom'
import type { DomainCard } from '../../types/controlRoom'
import { DOMAIN_COLORS, RISK_COLORS } from './constants'

interface DomainCommandCardProps {
  domain: DomainCard
  loading?: boolean
}

export function DomainCommandCard({ domain, loading }: DomainCommandCardProps) {
  const navigate = useNavigate()
  const color = DOMAIN_COLORS[domain.domain] || '#94a3b8'
  const riskColor = RISK_COLORS[domain.risk] || '#64748b'

  return (
    <Card
      size="small"
      loading={loading}
      hoverable
      onClick={() => navigate(`/app/${domain.domain}`)}
      style={{
        height: '100%',
        borderLeft: `4px solid ${color}`,
        background: '#fff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>
          {domain.domain_name}
        </span>
        <span
          style={{
            background: riskColor,
            color: '#fff',
            padding: '2px 8px',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {domain.risk}
        </span>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span style={{ color: '#64748b' }}>Score</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{domain.score}/100</span>
        </div>
        <Progress
          percent={domain.score}
          showInfo={false}
          strokeColor={color}
          trailColor="#e2e8f0"
          size="small"
        />
      </div>
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
          <span style={{ color: '#64748b' }}>Lv.{domain.level} XP</span>
          <span style={{ color: '#64748b' }}>
            {domain.xp}/{Math.round(domain.xp_required)}
          </span>
        </div>
        <Progress
          percent={domain.xp_progress}
          showInfo={false}
          strokeColor={color}
          trailColor="#e2e8f0"
          size="small"
        />
      </div>
      {domain.last_activity && (
        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 8 }}>
          Last activity: {domain.last_activity}
        </div>
      )}
    </Card>
  )
}
