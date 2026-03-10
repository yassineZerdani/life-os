import { useNavigate } from 'react-router-dom'
import type { ActiveStrategyCard, ActiveProtocolCard } from '../../types/controlRoom'
import type { ActiveStrategy } from '../../types/strategy'
import { useTheme } from '../../hooks/useTheme'
import { ControlRoomCard } from './ControlRoomCard'
import { DOMAIN_COLORS } from './constants'

interface ActiveStrategiesCardProps {
  strategies: ActiveStrategyCard[] | ActiveStrategy[]
  activeProtocols?: ActiveProtocolCard[]
  loading?: boolean
}

export function ActiveStrategiesCard({
  strategies,
  activeProtocols = [],
  loading,
}: ActiveStrategiesCardProps) {
  const theme = useTheme()
  const navigate = useNavigate()
  const items = activeProtocols.length > 0 ? activeProtocols : strategies
  const isProtocols = activeProtocols.length > 0

  return (
    <ControlRoomCard>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: theme.textPrimary,
          margin: 0,
          marginBottom: 16,
        }}
      >
        Active Strategies
      </h3>
      {loading ? (
        <div style={{ color: theme.textMuted, fontSize: 15 }}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{ color: theme.textSecondary, fontSize: 15 }}>
          No active protocols. Start one from the Strategy Library.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((s) => {
            const domain = isProtocols
              ? (s as ActiveProtocolCard).domain_key
              : (s as ActiveStrategyCard).domain
            const name = isProtocols
              ? (s as ActiveProtocolCard).protocol_name
              : (s as ActiveStrategyCard).name
            const color = DOMAIN_COLORS[domain] ?? theme.accent
            const adherence = Math.round(s.adherence_score)
            return (
              <div
                key={s.id}
                onClick={() =>
                  navigate(
                    isProtocols ? `/app/strategies/${domain}` : `/app/${domain}`
                  )
                }
                style={{
                  padding: 14,
                  background: theme.hoverBg,
                  borderRadius: theme.radius,
                  borderLeft: `4px solid ${color}`,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.selectedBg
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.hoverBg
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: theme.textPrimary,
                      fontSize: 14,
                    }}
                  >
                    {name}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: theme.textMuted,
                      textTransform: 'capitalize',
                    }}
                  >
                    {domain}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: theme.borderLight,
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${adherence}%`,
                      height: '100%',
                      background: color,
                      borderRadius: 3,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 6 }}>
                  Adherence: {adherence}%
                </div>
              </div>
            )
          })}
        </div>
      )}
    </ControlRoomCard>
  )
}
