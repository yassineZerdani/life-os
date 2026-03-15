import { Card, Empty } from 'antd'
import { useTheme } from '../../hooks/useTheme'

export interface WeatherPoint {
  date: string
  primary_emotion: string
  avg_intensity: number | null
  count: number
}

interface EmotionalWeatherChartProps {
  data: WeatherPoint[]
  loading?: boolean
}

const EMOTION_COLORS: Record<string, string> = {
  calm: '#7dd3fc',
  anxious: '#fbbf24',
  sad: '#94a3b8',
  happy: '#86efac',
  angry: '#f87171',
  tired: '#a78bfa',
  irritable: '#fb923c',
  neutral: '#cbd5e1',
}

function emotionColor(emotion: string): string {
  return EMOTION_COLORS[emotion.toLowerCase()] ?? '#94a3b8'
}

export function EmotionalWeatherChart({ data, loading }: EmotionalWeatherChartProps) {
  const theme = useTheme()
  if (loading) return null
  if (!data?.length) {
    return (
      <Card size="small" title="Emotional weather" style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Log emotions to see your weather" />
      </Card>
    )
  }
  const byDate: Record<string, WeatherPoint[]> = {}
  for (const p of data) {
    if (!byDate[p.date]) byDate[p.date] = []
    byDate[p.date].push(p)
  }
  const dates = Object.keys(byDate).sort()
  return (
    <Card size="small" title="Emotional weather" style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {dates.slice(0, 10).map((d) => {
          const points = byDate[d]
          return (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: theme.textMuted, width: 72 }}>{d}</span>
              <div style={{ flex: 1, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {points.map((p) => (
                  <span key={d + p.primary_emotion} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, background: emotionColor(p.primary_emotion), color: '#1e293b' }}>
                    {p.primary_emotion}{p.avg_intensity != null ? ' ' + p.avg_intensity.toFixed(0) : ''}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
