import { Card, Select } from 'antd'
import type { DomainScore } from '../../types'
import dayjs from 'dayjs'

interface XPDataPoint {
  timestamp: string
  xp: number
  cumulative: number
}

interface XPProgressChartProps {
  domainScores: DomainScore[]
  xpGrowth: XPDataPoint[]
  domain: string
  onDomainChange?: (domain: string) => void
  loading?: boolean
}

export function XPProgressChart({
  domainScores,
  xpGrowth,
  domain,
  onDomainChange,
  loading,
}: XPProgressChartProps) {
  const data = xpGrowth

  if (!domain && domainScores.length > 0) return null

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>XP Growth</span>
          {domainScores.length > 1 && onDomainChange && (
            <Select
              size="small"
              value={domain}
              onChange={onDomainChange}
              options={domainScores.map((s) => ({ label: s.domain_name, value: s.domain }))}
              style={{ width: 120 }}
            />
          )}
        </div>
      }
      loading={loading}
    >
      {data.length === 0 ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: 24 }}>
          No XP events yet. Log activities to earn XP!
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 4,
            height: 80,
          }}
        >
          {data.slice(-14).map((d, i) => {
            const max = Math.max(...data.map((x) => x.cumulative), 1)
            const pct = (d.cumulative / max) * 100
            return (
              <div
                key={i}
                title={`${dayjs(d.timestamp).format('MMM D')}: +${d.xp} XP (${d.cumulative} total)`}
                style={{
                  flex: 1,
                  minWidth: 4,
                  height: `${Math.max(pct, 5)}%`,
                  background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                  borderRadius: 4,
                  opacity: 0.9,
                }}
              />
            )
          })}
        </div>
      )}
    </Card>
  )
}
