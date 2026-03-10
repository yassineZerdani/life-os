import { Card, Button, Empty } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ThunderboltOutlined } from '@ant-design/icons'
import { insightsService } from '../../services/insights'
import { InsightCard } from './InsightCard'
import type { Insight } from '../../types'

interface InsightsPanelProps {
  limit?: number
  title?: string
}

export function InsightsPanel({ limit = 5, title = 'Life Insights' }: InsightsPanelProps) {
  const queryClient = useQueryClient()

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['insights', 'panel', limit],
    queryFn: () => insightsService.list({ limit, resolved: false }),
  })

  const runMutation = useMutation({
    mutationFn: () => insightsService.run(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] })
    },
  })

  return (
    <Card
      title={title}
      extra={
        <Button
          type="link"
          icon={<ThunderboltOutlined />}
          loading={runMutation.isPending}
          onClick={() => runMutation.mutate()}
        >
          Run analysis
        </Button>
      }
      loading={isLoading}
    >
      {insights.length === 0 ? (
        <Empty
          description="No insights yet. Run analysis to discover patterns."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(insights as Insight[]).map((i) => (
            <InsightCard key={i.id} insight={i} />
          ))}
        </div>
      )}
    </Card>
  )
}
