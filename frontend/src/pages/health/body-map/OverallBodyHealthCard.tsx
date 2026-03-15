/**
 * Empty state: overall body health, strongest/weakest systems, quick recommendation.
 * Shown when no organ is selected. Invites user to click an organ.
 */
import { Typography, Progress } from 'antd'
import { useTheme } from '../../../hooks/useTheme'
import type { BodySystem } from '../../../services/bodyIntelligence'
import { getHealthColor, HEALTH_COLORS } from './constants'

const { Text } = Typography

interface OverallBodyHealthCardProps {
  overallScore: number | null
  systems: BodySystem[]
  stressedSystems: string[]
  strongSystems: string[]
}

export function OverallBodyHealthCard({
  overallScore,
  systems: _systems,
  stressedSystems,
  strongSystems,
}: OverallBodyHealthCardProps) {
  const theme = useTheme()
  const hasStressed = stressedSystems.length > 0
  const hasStrong = strongSystems.length > 0

  const quickRecommendation = hasStressed
    ? 'Prioritise sleep, hydration, and the nutrients for your weaker systems. Track relevant metrics to improve scores.'
    : hasStrong
      ? 'Keep supporting your strong systems. Consider adding metrics for other areas to get a fuller picture.'
      : 'Add health metrics and link organs to see support needs and get personalised recommendations.'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Text
          strong
          style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.textMuted }}
        >
          Overall body health
        </Text>
        {overallScore != null ? (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 20 }}>
            <Progress
              type="circle"
              percent={Math.round(overallScore)}
              size={80}
              strokeColor={getHealthColor(overallScore)}
              format={() => (
                <span style={{ fontSize: 22, fontWeight: 700, color: getHealthColor(overallScore) }}>
                  {Math.round(overallScore)}
                </span>
              )}
            />
            <div>
              <Text strong style={{ fontSize: 16, color: theme.textPrimary }}>
                Body support score
              </Text>
              <br />
              <Text style={{ fontSize: 13, color: theme.textMuted }}>
                Based on nutrition, sleep, movement & signals
              </Text>
            </div>
          </div>
        ) : (
          <Text style={{ display: 'block', marginTop: 8, color: theme.textMuted, fontSize: 13 }}>
            Complete health metrics and link organs to see your overall score.
          </Text>
        )}
      </div>

      {stressedSystems.length > 0 && (
        <div>
          <Text strong style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.textMuted }}>
            Needs attention
          </Text>
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {stressedSystems.slice(0, 5).map((s) => (
              <span
                key={s}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: `${HEALTH_COLORS.stressed}22`,
                  color: HEALTH_COLORS.stressed,
                  fontSize: 12,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {strongSystems.length > 0 && (
        <div>
          <Text strong style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.textMuted }}>
            Strongest systems
          </Text>
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {strongSystems.slice(0, 5).map((s) => (
              <span
                key={s}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: `${HEALTH_COLORS.healthy}22`,
                  color: HEALTH_COLORS.healthy,
                  fontSize: 12,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          padding: '12px 14px',
          borderRadius: 12,
          background: theme.hoverBg,
          border: `1px solid ${theme.contentCardBorder}`,
        }}
      >
        <Text strong style={{ fontSize: 12, color: theme.textSecondary, display: 'block', marginBottom: 4 }}>
          Quick recommendation
        </Text>
        <Text style={{ fontSize: 13, color: theme.textMuted }}>{quickRecommendation}</Text>
      </div>

      <div
        style={{
          padding: '14px 16px',
          borderRadius: 12,
          background: theme.contentCardBg,
          border: `1px dashed ${theme.contentCardBorder}`,
        }}
      >
        <Text style={{ fontSize: 13, color: theme.textMuted }}>
          Click an organ on the body map to see its support needs, signals, and recommendations.
        </Text>
      </div>
    </div>
  )
}
