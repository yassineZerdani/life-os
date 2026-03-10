import { useQuery } from '@tanstack/react-query'
import { Card, List, Progress, Typography, Empty } from 'antd'
import { goalsService } from '../services/goals'
import { useAppStore } from '../store/useAppStore'
import dayjs from 'dayjs'

const { Text } = Typography

export function GoalsPage() {
  const domains = useAppStore((s) => s.domains)
  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsService.list(),
  })

  const getDomainName = (id: number) => domains.find((d) => d.id === id)?.name || 'Unknown'

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 28 }}>Goals</h1>
      <List
        loading={isLoading}
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3 }}
        dataSource={goals || []}
        locale={{ emptyText: <Empty description="No goals yet" /> }}
        renderItem={(g) => (
          <List.Item>
            <Card>
              <Text type="secondary">{getDomainName(g.domain_id)}</Text>
              <h3 style={{ margin: '8px 0' }}>{g.title}</h3>
              {g.description && (
                <Text style={{ display: 'block', marginBottom: 8 }}>{g.description}</Text>
              )}
              <Progress percent={Math.round(g.progress)} strokeColor="#6366f1" />
              {g.target_value != null && g.target_unit && (
                <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                  Target: {g.target_value} {g.target_unit}
                </Text>
              )}
              {g.deadline && (
                <Text type="secondary" style={{ display: 'block' }}>
                  Deadline: {dayjs(g.deadline).format('MMM D, YYYY')}
                </Text>
              )}
            </Card>
          </List.Item>
        )}
      />
    </div>
  )
}
