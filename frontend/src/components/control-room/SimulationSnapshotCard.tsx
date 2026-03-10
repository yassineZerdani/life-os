import { RiseOutlined, FallOutlined, MinusOutlined } from '@ant-design/icons'
import type { Forecast } from '../../types/controlRoom'
import { useTheme } from '../../hooks/useTheme'
import { ControlRoomCard } from './ControlRoomCard'
import { DOMAIN_COLORS } from './constants'

interface SimulationSnapshotCardProps {
  forecast: Forecast
  loading?: boolean
}

export function SimulationSnapshotCard({ forecast, loading }: SimulationSnapshotCardProps) {
  const theme = useTheme()

  return (
    <ControlRoomCard>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: theme.textPrimary,
          margin: 0,
          marginBottom: 8,
        }}
      >
        Simulation Snapshot
      </h3>
      <p
        style={{
          fontSize: 13,
          color: theme.textMuted,
          marginBottom: 16,
        }}
      >
        Next {forecast.months_ahead} months at current pace
      </p>
      {loading ? (
        <div style={{ color: theme.textMuted, fontSize: 15 }}>Loading…</div>
      ) : (
        <>
          <p
            style={{
              fontSize: 15,
              color: theme.textSecondary,
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            {forecast.summary}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {forecast.domains.map((d) => {
              const color = DOMAIN_COLORS[d.domain] ?? theme.textMuted
              const change = d.score_change
              const icon =
                change > 0 ? (
                  <RiseOutlined style={{ color: '#22c55e' }} />
                ) : change < 0 ? (
                  <FallOutlined style={{ color: '#ef4444' }} />
                ) : (
                  <MinusOutlined style={{ color: theme.textMuted }} />
                )
              return (
                <div
                  key={d.domain}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    background: theme.hoverBg,
                    borderRadius: theme.radius,
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
                      color: theme.textPrimary,
                      textTransform: 'capitalize',
                      fontSize: 14,
                    }}
                  >
                    {d.domain}
                  </span>
                  <span style={{ color: theme.textSecondary, fontSize: 13 }}>
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
        </>
      )}
    </ControlRoomCard>
  )
}
