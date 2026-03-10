import { Card } from 'antd'
import { RiseOutlined, FallOutlined, MinusOutlined } from '@ant-design/icons'
import type { Forecast } from '../../types/controlRoom'
import { DOMAIN_COLORS } from './constants'

interface FutureForecastPanelProps {
  forecast: Forecast
  loading?: boolean
}

export function FutureForecastPanel({ forecast, loading }: FutureForecastPanelProps) {
  return (
    <Card
      title={`Future Forecast (${forecast.months_ahead} months)`}
      loading={loading}
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ marginBottom: 16, color: '#64748b', fontSize: 14 }}>
        If current behavior continues for {forecast.months_ahead} months
      </div>
      <div style={{ marginBottom: 20, color: '#0f172a', fontSize: 15 }}>
        {forecast.summary}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {forecast.domains.map((d) => {
          const color = DOMAIN_COLORS[d.domain] || '#94a3b8'
          const change = d.score_change
          const icon =
            change > 0 ? (
              <RiseOutlined style={{ color: '#22c55e' }} />
            ) : change < 0 ? (
              <FallOutlined style={{ color: '#ef4444' }} />
            ) : (
              <MinusOutlined style={{ color: '#64748b' }} />
            )
          return (
            <div
              key={d.domain}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                background: '#f8fafc',
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: color,
                }}
              />
              <span
                style={{
                  width: 100,
                  color: '#0f172a',
                  textTransform: 'capitalize',
                  fontSize: 14,
                }}
              >
                {d.domain}
              </span>
              <span style={{ color: '#64748b', fontSize: 14 }}>
                {d.current_score} → {d.predicted_score}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {icon}
                <span
                  style={{
                    color: change >= 0 ? '#22c55e' : '#ef4444',
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {change >= 0 ? '+' : ''}
                  {change}
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
