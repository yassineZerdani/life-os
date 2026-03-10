import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Row, Col } from 'antd'
import { dashboardService } from '../services/dashboard'
import { timelineService } from '../services/timeline'
import { metricsService } from '../services/metrics'
import { analyticsService } from '../services/analytics'
import { LifeScoreGauge } from '../components/rpg/LifeScoreGauge'
import { DomainLevelCard } from '../components/rpg/DomainLevelCard'
import { TimelineView } from '../components/rpg/TimelineView'
import { XPProgressChart } from '../components/rpg/XPProgressChart'
import { MetricInputForm } from '../components/rpg/MetricInputForm'
import { XPEventForm } from '../components/rpg/XPEventForm'
import { MetricsChart } from '../components/dashboard/MetricsChart'
import { GoalsProgress } from '../components/dashboard/GoalsProgress'
import { WeeklyLifeBalanceCard } from '../components/analytics/WeeklyLifeBalanceCard'
import { DomainTimePieChart } from '../components/analytics/DomainTimePieChart'
import { MonthlyHeatmap } from '../components/analytics/MonthlyHeatmap'
import { InsightsPanel } from '../components/insights/InsightsPanel'
import { LifeRecommendations } from '../components/recommendations/LifeRecommendations'
import { AchievementsPanel } from '../components/gamification/AchievementsPanel'
import { QuestList } from '../components/gamification/QuestList'
import dayjs from 'dayjs'

export function DashboardPage() {
  const [xpChartDomain, setXpChartDomain] = useState<string | undefined>()

  const { data: scores, isLoading: scoresLoading } = useQuery({
    queryKey: ['dashboard', 'scores'],
    queryFn: dashboardService.getScores,
  })

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['timeline'],
    queryFn: () => timelineService.get(20),
  })

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['dashboard', 'trends'],
    queryFn: () => dashboardService.getMetricsTrends(30),
  })

  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['dashboard', 'goals'],
    queryFn: dashboardService.getGoalsProgress,
  })

  const { data: metrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => metricsService.list(),
  })

  const domainForXp = xpChartDomain ?? scores?.[0]?.domain
  const analyticsStart = dayjs().subtract(30, 'day').format('YYYY-MM-DD')
  const analyticsEnd = dayjs().format('YYYY-MM-DD')

  const { data: xpGrowth, isLoading: xpGrowthLoading } = useQuery({
    queryKey: ['dashboard', 'xp-growth', domainForXp],
    queryFn: () => dashboardService.getXPGrowth(domainForXp!, 30),
    enabled: !!domainForXp,
  })

  const { data: timeDistribution } = useQuery({
    queryKey: ['analytics', 'time-distribution', analyticsStart, analyticsEnd],
    queryFn: () => analyticsService.timeDistribution(analyticsStart, analyticsEnd),
  })

  const { data: heatmapData } = useQuery({
    queryKey: ['analytics', 'heatmap', analyticsStart, analyticsEnd],
    queryFn: () => analyticsService.dailyHeatmap(analyticsStart, analyticsEnd),
  })

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 28, color: '#0f172a' }}>Dashboard</h1>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <LifeScoreGauge scores={scores || []} loading={scoresLoading} />
        </Col>
        <Col xs={24} lg={8}>
          <GoalsProgress goals={goals || []} loading={goalsLoading} />
        </Col>
        <Col xs={24} lg={4}>
          <MetricInputForm metrics={Array.isArray(metrics) ? metrics : []} />
        </Col>
        <Col xs={24} lg={4}>
          <XPEventForm />
        </Col>
        <Col xs={24} lg={4}>
          <WeeklyLifeBalanceCard />
        </Col>
        <Col xs={24} lg={12}>
          <InsightsPanel limit={5} title="Life Insights" />
        </Col>
        <Col xs={24} lg={12}>
          <LifeRecommendations limit={3} title="Recommended Actions" />
        </Col>
        <Col xs={24} lg={12}>
          <AchievementsPanel limit={5} title="Achievements" showCheckButton />
        </Col>
        <Col xs={24} lg={12}>
          <QuestList showGenerate />
        </Col>
        <Col xs={24}>
          <h3 style={{ marginBottom: 16, color: '#0f172a' }}>Domain Levels</h3>
          <Row gutter={[24, 24]}>
            {(scores || []).map((s) => (
              <Col xs={12} sm={8} md={6} lg={4} key={s.domain}>
                <DomainLevelCard score={s} loading={scoresLoading} />
              </Col>
            ))}
          </Row>
        </Col>
        <Col xs={24} lg={12}>
          <TimelineView events={timeline || []} loading={timelineLoading} />
        </Col>
        <Col xs={24} lg={12}>
          <XPProgressChart
            domainScores={scores || []}
            xpGrowth={xpGrowth || []}
            domain={domainForXp ?? ''}
            onDomainChange={setXpChartDomain}
            loading={xpGrowthLoading}
          />
        </Col>
        <Col xs={24} lg={12}>
          <MetricsChart trends={trends || []} loading={trendsLoading} />
        </Col>
        <Col xs={24} lg={12}>
          <DomainTimePieChart data={timeDistribution || {}} />
        </Col>
        <Col xs={24} lg={12}>
          <MonthlyHeatmap data={heatmapData || []} />
        </Col>
      </Row>
    </div>
  )
}
