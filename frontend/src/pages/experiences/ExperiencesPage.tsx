/**
 * Life Memory Engine — dashboard: timeline preview, peak experiences, suggestions.
 */
import { useQuery } from '@tanstack/react-query'
import { Card, Typography, Button } from 'antd'
import { CompassOutlined, HistoryOutlined, EnvironmentOutlined, BookOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { lifeMemoryService } from '../../services/lifeMemory'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../../components/control-room/constants'
import { ExperienceTimeline, PeakExperiencePanel, FutureExperienceSuggestions } from '../../components/experiences'

const { Title, Text } = Typography

export function ExperiencesPage() {
  const theme = useTheme()
  const navigate = useNavigate()

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['life-memory', 'dashboard'],
    queryFn: () => lifeMemoryService.getDashboard(),
  })

  const { data: timeline } = useQuery({
    queryKey: ['life-memory', 'timeline'],
    queryFn: () => lifeMemoryService.getTimeline({ limit: 5 }),
    enabled: !!dashboard,
  })

  const { data: peakAliveness } = useQuery({
    queryKey: ['life-memory', 'peak-aliveness'],
    queryFn: () => lifeMemoryService.listPeakAliveness(5),
    enabled: !!dashboard,
  })

  const { data: peakMeaning } = useQuery({
    queryKey: ['life-memory', 'peak-meaning'],
    queryFn: () => lifeMemoryService.listPeakMeaning(5),
    enabled: !!dashboard,
  })

  if (isLoading || !dashboard) {
    return (
      <div style={{ padding: 24, color: theme.textMuted }}>
        Loading life memory…
      </div>
    )
  }

  const { experiences_count, peak_aliveness_count, peak_meaning_count, insights, future_suggestions } = dashboard

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
            Life memory
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Moments that felt vivid, meaningful, or transformative
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            icon={<HistoryOutlined />}
            onClick={() => navigate('/app/experiences/timeline')}
            style={{ borderRadius: 10 }}
          >
            Timeline
          </Button>
          <Button
            icon={<EnvironmentOutlined />}
            onClick={() => navigate('/app/experiences/map')}
            style={{ borderRadius: 10 }}
          >
            Map
          </Button>
          <Button
            icon={<BookOutlined />}
            onClick={() => navigate('/app/experiences/seasons')}
            style={{ borderRadius: 10 }}
          >
            Seasons
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <Card size="small" style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Experiences</Text>
              <div style={{ fontSize: 28, fontWeight: 700, color: DOMAIN_COLORS.experiences }}>{experiences_count}</div>
            </Card>
            <Card size="small" style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Peak aliveness</Text>
              <div style={{ fontSize: 28, fontWeight: 700, color: DOMAIN_COLORS.experiences }}>{peak_aliveness_count}</div>
            </Card>
            <Card size="small" style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Peak meaning</Text>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{peak_meaning_count}</div>
            </Card>
          </div>

          <Card
            title={<span style={{ fontWeight: 600 }}>Recent timeline</span>}
            extra={<Button type="link" size="small" onClick={() => navigate('/app/experiences/timeline')}>View all</Button>}
            style={{
              marginBottom: 24,
              borderRadius: 16,
              border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
              background: theme.contentCardBg ?? undefined,
            }}
          >
            <ExperienceTimeline
              items={timeline ?? []}
              onSelect={(id) => navigate(`/app/experiences/timeline?highlight=${id}`)}
              loading={false}
            />
          </Card>

          {insights.length > 0 && (
            <Card
              size="small"
              style={{
                borderRadius: 16,
                border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
                background: theme.contentCardBg ?? undefined,
              }}
            >
              <Text strong style={{ fontSize: 13 }}>Insights</Text>
              <ul style={{ margin: '8px 0 0', paddingLeft: 20, color: theme.textSecondary, fontSize: 13 }}>
                {insights.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div style={{ position: 'sticky', top: 24 }}>
          <PeakExperiencePanel
            peakAliveness={peakAliveness ?? []}
            peakMeaning={peakMeaning ?? []}
          />
          <div style={{ marginTop: 16 }}>
            <FutureExperienceSuggestions suggestions={future_suggestions} />
          </div>
        </div>
      </div>
    </div>
  )
}
