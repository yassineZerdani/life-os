import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Row,
  Col,
  Card,
  Button,
  Slider,
  Select,
  Spin,
  Empty,
  Typography,
  Checkbox,
  Collapse,
  Divider,
} from 'antd'
import { ThunderboltOutlined, HistoryOutlined, SettingOutlined } from '@ant-design/icons'
import { simulationService } from '../services/simulation'
import type { SimulationScenarioInput, SimulationContext } from '../services/simulation'
import { DomainProjectionCard } from '../components/simulation/DomainProjectionCard'
import { FutureScoreChart } from '../components/simulation/FutureScoreChart'
import { useTheme } from '../hooks/useTheme'

const { Text } = Typography

const MONTH_OPTIONS = [
  { value: 3, label: '3 months' },
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' },
]

export function SimulationPage() {
  const [months, setMonths] = useState(6)
  const [activateStrategy, setActivateStrategy] = useState<Set<string>>(new Set())
  const [habitFrequency, setHabitFrequency] = useState<Record<string, number>>({})
  const [reduceBehavior, setReduceBehavior] = useState<Record<string, number>>({})
  const [timeAllocation, setTimeAllocation] = useState<Record<string, number>>({})
  const theme = useTheme()
  const queryClient = useQueryClient()

  const { data: context, isLoading: contextLoading } = useQuery({
    queryKey: ['simulation', 'context'],
    queryFn: () => simulationService.context(),
  })

  const scenario: SimulationScenarioInput = useMemo(
    () => {
      const baseRates = context?.habits ?? []
      const incFreq: Record<string, number> = {}
      Object.entries(habitFrequency).forEach(([id, v]) => {
        const base = baseRates.find((h) => h.action_template_id === id)?.completions_per_week
        if (base != null && Math.abs(v - base) > 0.01) incFreq[id] = v
      })
      const redBeh: Record<string, number> = {}
      Object.entries(reduceBehavior).forEach(([k, v]) => {
        if (v < 100) redBeh[k] = v / 100
      })
      return {
        activate_strategy: Array.from(activateStrategy),
        increase_habit_frequency: Object.keys(incFreq).length ? incFreq : undefined,
        reduce_behavior: Object.keys(redBeh).length ? redBeh : undefined,
        change_time_allocation:
          Object.keys(timeAllocation).length &&
          Object.values(timeAllocation).some((v) => v !== 0)
            ? timeAllocation
            : undefined,
      }
    },
    [context?.habits, activateStrategy, habitFrequency, reduceBehavior, timeAllocation]
  )

  const runMutation = useMutation({
    mutationFn: () =>
      simulationService.run({
        months,
        scenario: Object.fromEntries(
          Object.entries(scenario).filter(
            ([_, v]) =>
              v !== undefined &&
              v !== null &&
              (Array.isArray(v) ? v.length > 0 : Object.keys(v as object).length > 0)
          )
        ) as SimulationScenarioInput,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulation'] })
    },
  })

  const { data: history = [] } = useQuery({
    queryKey: ['simulation', 'history'],
    queryFn: () => simulationService.history(10),
  })

  const displayResult = runMutation.data ?? history[0]?.result
  const isLoading = runMutation.isPending

  const toggleStrategy = (protocolId: string, checked: boolean) => {
    setActivateStrategy((prev) => {
      const next = new Set(prev)
      if (checked) next.add(protocolId)
      else next.delete(protocolId)
      return next
    })
  }

  const setHabitFreq = (templateId: string, value: number | null) => {
    setHabitFrequency((prev) => {
      if (value == null) {
        const { [templateId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [templateId]: value }
    })
  }

  const setReduce = (templateId: string, pct: number) => {
    setReduceBehavior((prev) =>
      pct >= 100
        ? (() => {
            const { [templateId]: _, ...r } = prev
            return r
          })()
        : { ...prev, [templateId]: pct }
    )
  }

  const setTimeAlloc = (domain: string, delta: number) => {
    setTimeAllocation((prev) =>
      delta === 0 ? (() => { const { [domain]: _, ...r } = prev; return r })() : { ...prev, [domain]: delta }
    )
  }

  return (
    <div>
      <h1 style={{ marginBottom: 8, fontSize: 28, color: theme.textPrimary }}>
        Life Simulation Engine
      </h1>
      <p style={{ marginBottom: 24, color: theme.textSecondary }}>
        Model how your life domains evolve using real data: domain scores, habits, strategies, goals, and time
        allocation. Adjust scenarios and run week-by-week projections.
      </p>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={10}>
          <Card
            title={
              <span>
                <SettingOutlined style={{ marginRight: 8 }} />
                Scenario
              </span>
            }
            style={{ marginBottom: 24 }}
          >
            <div style={{ marginBottom: 20 }}>
              <Text strong>Months ahead</Text>
              <Select
                value={months}
                onChange={setMonths}
                options={MONTH_OPTIONS}
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>

            {contextLoading ? (
              <Spin />
            ) : (
              <>
                {/* Strategy toggles */}
                {context?.available_protocols && context.available_protocols.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <Text strong>Activate strategy (add in simulation)</Text>
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {context.available_protocols.map((p) => (
                        <Checkbox
                          key={p.id}
                          checked={activateStrategy.has(p.id)}
                          onChange={(e) => toggleStrategy(p.id, e.target.checked)}
                        >
                          <span style={{ textTransform: 'capitalize' }}>{p.name}</span>
                          <Text type="secondary" style={{ marginLeft: 6, fontSize: 12 }}>
                            ({p.domain_key})
                          </Text>
                        </Checkbox>
                      ))}
                    </div>
                  </div>
                )}

                {/* Habit frequency */}
                {context?.habits && context.habits.length > 0 && (
                  <Collapse
                    size="small"
                    items={[
                      {
                        key: 'habits',
                        label: `Habit frequency (completions per week)`,
                        children: (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {context.habits.map((h) => (
                              <div key={h.action_template_id}>
                                <Text style={{ fontSize: 13 }}>{h.title}</Text>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <Slider
                                    min={0}
                                    max={20}
                                    value={habitFrequency[h.action_template_id] ?? h.completions_per_week}
                                    onChange={(v) => setHabitFreq(h.action_template_id, v)}
                                    style={{ flex: 1 }}
                                  />
                                  <span style={{ width: 36, fontSize: 12 }}>
                                    {(habitFrequency[h.action_template_id] ?? h.completions_per_week).toFixed(1)}/wk
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ),
                      },
                    ]}
                  />
                )}

                {/* Behavior reduction */}
                {context?.habits && context.habits.length > 0 && (
                  <Collapse
                    size="small"
                    style={{ marginTop: 12 }}
                    items={[
                      {
                        key: 'reduce',
                        label: 'Reduce behavior (%)',
                        children: (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {context.habits.map((h) => (
                              <div key={h.action_template_id}>
                                <Text style={{ fontSize: 13 }}>{h.title}</Text>
                                <Slider
                                  min={0}
                                  max={100}
                                  value={reduceBehavior[h.action_template_id] ?? 100}
                                  onChange={(v) => setReduce(h.action_template_id, v)}
                                  marks={{ 0: '0%', 50: '50%', 100: '100%' }}
                                />
                              </div>
                            ))}
                          </div>
                        ),
                      },
                    ]}
                  />
                )}

                {/* Time allocation */}
                {context?.domains && context.domains.length > 0 && (
                  <div style={{ marginTop: 16, marginBottom: 24 }}>
                    <Text strong>Time allocation (extra hours per week)</Text>
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {context.domains.map((domain) => (
                        <div key={domain}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ textTransform: 'capitalize', fontSize: 13 }}>{domain}</Text>
                            <Text type="secondary">
                              +{timeAllocation[domain] ?? 0}h
                            </Text>
                          </div>
                          <Slider
                            min={0}
                            max={20}
                            value={timeAllocation[domain] ?? 0}
                            onChange={(v) => setTimeAlloc(domain, v)}
                            marks={{ 0: '0', 10: '10', 20: '20' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Divider style={{ margin: '16px 0' }} />

                <Button
                  type="primary"
                  size="large"
                  icon={<ThunderboltOutlined />}
                  loading={runMutation.isPending}
                  onClick={() => runMutation.mutate()}
                  block
                >
                  Run Simulation
                </Button>
              </>
            )}
          </Card>

          {history.length > 0 && (
            <Card title={<><HistoryOutlined /> Previous Runs</>} size="small">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.slice(0, 5).map((run) => (
                  <div
                    key={run.id}
                    style={{
                      padding: 8,
                      background: theme.hoverBg || '#f1f5f9',
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  >
                    {run.months_ahead} months
                    {run.scenario_parameters?.activate_strategy?.length
                      ? ` • +${run.scenario_parameters.activate_strategy.length} strategy`
                      : ''}
                    {run.scenario_parameters?.change_time_allocation &&
                    Object.keys(run.scenario_parameters.change_time_allocation).length
                      ? ' • time alloc'
                      : ''}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={14}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <Spin size="large" />
            </div>
          ) : !displayResult ? (
            <Card>
              <Empty
                description="Run a simulation to see predicted domain scores, XP, goal completion, and trends."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          ) : (
            <>
              {displayResult.life_state_summary && (
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Text type="secondary">
                    Based on {displayResult.analysis_period_days}-day baseline •{' '}
                    {displayResult.life_state_summary.habits_count} habits •{' '}
                    {displayResult.life_state_summary.active_strategies_count} active strategies
                  </Text>
                </Card>
              )}

              <FutureScoreChart
                domains={displayResult.domains}
                monthsAhead={displayResult.months_ahead}
              />

              <Card title="Domain Projections" style={{ marginTop: 24 }}>
                <Row gutter={[16, 16]}>
                  {displayResult.domains.map((p) => (
                    <Col xs={24} sm={12} lg={8} key={p.domain}>
                      <DomainProjectionCard projection={p} />
                    </Col>
                  ))}
                </Row>
              </Card>

              {displayResult.goal_predictions.length > 0 && (
                <Card title="Goal Predictions" style={{ marginTop: 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {displayResult.goal_predictions.map((g) => (
                      <div
                        key={g.goal_id}
                        style={{
                          padding: 12,
                          background: theme.hoverBg || '#f8fafc',
                          borderRadius: 6,
                          borderLeft: `4px solid ${theme.accent || '#6366f1'}`,
                        }}
                      >
                        <Text strong>{g.title}</Text>
                        {g.domain && (
                          <Text type="secondary" style={{ marginLeft: 8 }}>
                            ({g.domain})
                          </Text>
                        )}
                        <div style={{ marginTop: 4, color: theme.textSecondary, fontSize: 13 }}>
                          {g.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {displayResult.baseline_rates && Object.keys(displayResult.baseline_rates).length > 0 && (
                <Card title="Baseline Rates (from past 90 days)" size="small" style={{ marginTop: 24 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13 }}>
                    {Object.entries(displayResult.baseline_rates)
                      .filter(([k]) => !k.startsWith('xp_') || k === 'xp_total_per_week')
                      .slice(0, 12)
                      .map(([k, v]) => (
                        <span key={k}>
                          <Text type="secondary">{k.replace(/_/g, ' ')}:</Text>{' '}
                          {typeof v === 'number' ? v.toFixed(1) : v}
                        </span>
                      ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </Col>
      </Row>
    </div>
  )
}
