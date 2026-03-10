import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Row, Col, Button, Segmented, Empty, Spin } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import { insightsService } from '../services/insights'
import { InsightCard } from '../components/insights/InsightCard'
import type { Insight } from '../types'

export function InsightsPage() {
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved')
  const queryClient = useQueryClient()

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['insights', 'all', filter],
    queryFn: () =>
      insightsService.list({
        limit: 100,
        resolved: filter === 'all' ? undefined : filter === 'resolved',
      } as { limit: number; resolved?: boolean }),
  })

  const runMutation = useMutation({
    mutationFn: () => insightsService.run(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] })
    },
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) => insightsService.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] })
    },
  })

  const filtered = insights as Insight[]

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 28 }}>Life Insights</h1>
      <p style={{ marginBottom: 24, color: '#64748b' }}>
        Automatic analysis of your life patterns, trends, and imbalances.
      </p>

      <div style={{ marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Segmented
          options={[
            { label: 'Unresolved', value: 'unresolved' },
            { label: 'Resolved', value: 'resolved' },
            { label: 'All', value: 'all' },
          ]}
          value={filter}
          onChange={(v) => setFilter(v as typeof filter)}
        />
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          loading={runMutation.isPending}
          onClick={() => runMutation.mutate()}
        >
          Run insight engine
        </Button>
      </div>

      {isLoading ? (
        <Spin size="large" />
      ) : filtered.length === 0 ? (
        <Empty
          description={
            filter === 'unresolved'
              ? 'No unresolved insights. Run the engine to discover patterns.'
              : 'No insights in this category.'
          }
        />
      ) : (
        <Row gutter={[24, 24]}>
          {(filtered as Insight[]).map((i) => (
            <Col xs={24} md={12} lg={8} key={i.id}>
              <InsightCard
                insight={i}
                showResolve
                onResolve={(id) => resolveMutation.mutate(id)}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
