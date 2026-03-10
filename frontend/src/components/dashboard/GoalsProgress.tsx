import { Card, Progress, Empty } from 'antd'
import type { GoalProgress } from '../../types'
import dayjs from 'dayjs'

interface GoalsProgressProps {
  goals: GoalProgress[]
  loading?: boolean
}

export function GoalsProgress({ goals, loading }: GoalsProgressProps) {
  return (
    <Card title="Goals Progress" loading={loading}>
      {goals.length === 0 ? (
        <Empty description="No active goals" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {goals.map((g) => (
            <div key={g.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 500 }}>{g.title}</span>
                {g.deadline && (
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {dayjs(g.deadline).format('MMM D, YYYY')}
                  </span>
                )}
              </div>
              <Progress
                percent={Math.round(g.progress)}
                size="small"
                strokeColor="#6366f1"
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
