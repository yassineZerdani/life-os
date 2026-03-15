/**
 * Overview card when no organ is selected — overall health score, systems summary, prompt.
 */
import { Card, Typography, Progress } from 'antd'
import { useTheme } from '../../../hooks/useTheme'
import type { BodySystem } from '../../../services/bodyIntelligence'
import { getHealthColor } from './constants'

const { Text } = Typography

interface BodyHealthOverviewCardProps {
  overallScore: number | null
  systems: BodySystem[]
  stressedSystems: string[]
  strongSystems: string[]
}

export function BodyHealthOverviewCard({
  overallScore,
  systems: _systems,
  stressedSystems,
  strongSystems,
}: BodyHealthOverviewCardProps) {
  const theme = useTheme()

  return (
    <Card
      style={{
        background: theme.contentCardBg,
        border: `1px solid ${theme.contentCardBorder}`,
        borderRadius: 18,
        boxShadow: theme.shadowMd,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <Text strong style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.textMuted }}>
          Overall body health
        </Text>
        {overallScore != null ? (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
            <Progress
              type="circle"
              percent={overallScore}
              size={72}
              strokeColor={getHealthColor(overallScore)}
              format={() => (
                <span style={{ fontSize: 20, fontWeight: 700, color: getHealthColor(overallScore) }}>
                  {overallScore}
                </span>
              )}
            />
            <div>
              <Text strong style={{ fontSize: 16 }}>Body support score</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 13 }}>Based on nutrition, sleep, movement & signals</Text>
            </div>
          </div>
        ) : (
          <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
            Complete health metrics to see your overall score.
          </Text>
        )}
      </div>

      {stressedSystems.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 12, color: theme.textSecondary }}>Needs attention</Text>
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {stressedSystems.slice(0, 4).map((s) => (
              <span
                key={s}
                style={{
                  padding: '4px 10px',
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
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
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 12, color: theme.textSecondary }}>Strong systems</Text>
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {strongSystems.slice(0, 4).map((s) => (
              <span
                key={s}
                style={{
                  padding: '4px 10px',
                  borderRadius: 8,
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#4ade80',
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
          padding: '14px 16px',
          borderRadius: 12,
          background: theme.hoverBg,
          border: `1px solid ${theme.contentCardBorder}`,
        }}
      >
        <Text type="secondary" style={{ fontSize: 13 }}>
          Click an organ on the body map to see its support needs, signals, and recommendations.
        </Text>
      </div>
    </Card>
  )
}
