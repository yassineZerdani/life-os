import { useQuery } from '@tanstack/react-query'
import { Spin } from 'antd'
import { RocketOutlined } from '@ant-design/icons'
import { useTheme } from '../hooks/useTheme'
import { controlRoomService } from '../services/controlRoom'
import { LifeHeroSection } from '../components/control-room/LifeHeroSection'
import { TopRecommendationsCard } from '../components/control-room/TopRecommendationsCard'
import { CriticalSignalsCard } from '../components/control-room/CriticalSignalsCard'
import { ActiveStrategiesCard } from '../components/control-room/ActiveStrategiesCard'
import { SimulationSnapshotCard } from '../components/control-room/SimulationSnapshotCard'
import { LifeTimelineCard } from '../components/control-room/LifeTimelineCard'
import { ActiveQuestsCard, RecentAchievementsCard } from '../components/control-room/QuestAchievementCards'
import { LearnSuggestionCard } from '../components/control-room/LearnSuggestionCard'

export function ControlRoomPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['control-room', 'full'],
    queryFn: controlRoomService.getFull,
  })
  const theme = useTheme()

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 320,
          padding: theme.crPagePadding,
        }}
      >
        <Spin size="large" />
      </div>
    )
  }

  if (!data) {
    return (
      <div
        style={{
          color: theme.textSecondary,
          textAlign: 'center',
          padding: theme.crPagePadding,
          fontSize: 15,
        }}
      >
        Failed to load control room data.
      </div>
    )
  }

  const {
    summary,
    alerts,
    recommendations,
    forecast,
    timeline,
    quests,
    achievements,
    active_strategies,
    active_protocols,
    recommended_article,
  } = data
  const gap = theme.crGap
  const padding = theme.crPagePadding

  return (
    <div
      style={{
        minHeight: '100%',
        padding: padding,
        paddingBottom: 48,
      }}
      className="control-room-page"
    >
      {/* Page title */}
      <header
        style={{
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <RocketOutlined style={{ fontSize: 28, color: theme.accent }} />
        <h1
          style={{
            margin: 0,
            fontSize: 36,
            fontWeight: 700,
            color: theme.textPrimary,
            letterSpacing: '-0.02em',
          }}
        >
          Control Room
        </h1>
      </header>

      {/* Section 1 — Life Hero */}
      <section style={{ marginBottom: gap }}>
        <LifeHeroSection data={summary} loading={isLoading} />
      </section>

      {/* Section 2 — Main Insights Grid (3 → 2 → 1 columns) */}
      <section
        style={{
          marginBottom: gap,
          display: 'grid',
          gridTemplateColumns: 'repeat(1, 1fr)',
          gap,
        }}
        className="control-room-main-grid"
      >
        <TopRecommendationsCard recommendations={recommendations} loading={isLoading} />
        <CriticalSignalsCard alerts={alerts} loading={isLoading} />
        <ActiveStrategiesCard
          strategies={active_strategies ?? []}
          activeProtocols={active_protocols}
          loading={isLoading}
        />
        <SimulationSnapshotCard forecast={forecast} loading={isLoading} />
      </section>

      {/* Section 3 — Secondary: Timeline (left) | Quests, Achievements, Learn (right) */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap,
        }}
        className="control-room-secondary"
      >
        <div>
          <LifeTimelineCard events={timeline} loading={isLoading} />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap,
          }}
        >
          <ActiveQuestsCard quests={quests} loading={isLoading} />
          <RecentAchievementsCard achievements={achievements} loading={isLoading} />
          <LearnSuggestionCard article={recommended_article ?? null} loading={isLoading} />
        </div>
      </section>
    </div>
  )
}
