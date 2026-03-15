import { RiseOutlined, FallOutlined, MinusOutlined } from '@ant-design/icons'
import type { ControlRoomSummary } from '../../types/controlRoom'
import { useTheme } from '../../hooks/useTheme'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { useCountUp } from '../../hooks/useCountUp'
import { ControlRoomCard } from './ControlRoomCard'
import { DomainRadarChart } from './DomainRadarChart'
import { STATUS_COLORS } from './constants'

interface LifeHeroSectionProps {
  data: ControlRoomSummary
  loading?: boolean
}

export function LifeHeroSection({ data, loading }: LifeHeroSectionProps) {
  const theme = useTheme()
  const screens = useBreakpoint()
  const chartSize = screens.xs ? 260 : 320
  const score = useCountUp(Math.round(data.life_score), 900, !loading)
  const level = useCountUp(data.total_level, 700, !loading)
  const xp = useCountUp(data.total_xp, 1000, !loading, 0)

  const trendIcon =
    data.score_trend_week > 0 ? (
      <RiseOutlined style={{ color: '#22c55e' }} />
    ) : data.score_trend_week < 0 ? (
      <FallOutlined style={{ color: '#ef4444' }} />
    ) : (
      <MinusOutlined style={{ color: theme.textMuted }} />
    )
  const statusColor = STATUS_COLORS[data.status] ?? theme.accent

  return (
    <ControlRoomCard gradient>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: theme.crGap,
          alignItems: 'center',
        }}
        className="life-hero-grid"
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                background: statusColor,
                color: '#fff',
                padding: '4px 10px',
                borderRadius: theme.radiusSm,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {data.status}
            </span>
            <span style={{ color: theme.textSecondary, fontSize: 15 }}>
              {trendIcon} {data.score_trend_week > 0 ? '+' : ''}
              {data.score_trend_week} vs last week
            </span>
          </div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: theme.textPrimary,
              margin: 0,
              marginBottom: 8,
              lineHeight: 1.2,
            }}
          >
            {loading ? '—' : score}
            <span style={{ fontSize: 18, fontWeight: 600, color: theme.textMuted, marginLeft: 8 }}>
              Life Score
            </span>
          </h1>
          <p
            style={{
              fontSize: 15,
              color: theme.textSecondary,
              marginBottom: 24,
              maxWidth: 480,
              lineHeight: 1.5,
            }}
          >
            {data.summary}
          </p>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: theme.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 4,
                }}
              >
                Level
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: theme.textPrimary }}>
                {loading ? '—' : level}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: theme.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 4,
                }}
              >
                Total XP
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: theme.textPrimary }}>
                {loading ? '—' : xp.toLocaleString()}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: theme.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 4,
                }}
              >
                XP progress
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: theme.textPrimary }}>
                {loading
                  ? '—'
                  : data.domains.length
                    ? Math.round(
                        data.domains.reduce((acc, d) => acc + d.xp_progress, 0) /
                          data.domains.length
                      )
                    : 0}
                %
              </div>
            </div>
          </div>
        </div>
        <div
          className="life-hero-chart-wrap"
          style={{
            width: 320,
            minHeight: 320,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <DomainRadarChart domains={data.domains} loading={loading} size={chartSize} />
        </div>
      </div>
    </ControlRoomCard>
  )
}
