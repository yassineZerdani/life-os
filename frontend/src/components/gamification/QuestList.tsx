import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Progress, Empty } from 'antd'
import { CheckOutlined, PlusOutlined } from '@ant-design/icons'
import { questsService } from '../../services/quests'

interface QuestListProps {
  title?: string
  showGenerate?: boolean
}

export function QuestList({ title = 'Active Quests', showGenerate = true }: QuestListProps) {
  const queryClient = useQueryClient()

  const { data: quests = [], isLoading } = useQuery({
    queryKey: ['quests'],
    queryFn: questsService.list,
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => questsService.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const generateMutation = useMutation({
    mutationFn: () => questsService.generate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })

  return (
    <Card
      title={
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{title}</span>
          {showGenerate && (
            <Button
              size="small"
              icon={<PlusOutlined />}
              loading={generateMutation.isPending}
              onClick={() => generateMutation.mutate()}
            >
              Generate
            </Button>
          )}
        </span>
      }
      loading={isLoading}
    >
      {quests.length === 0 && !isLoading ? (
        <Empty
          description="No active quests. Generate new quests based on your progress."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          {showGenerate && (
            <Button type="primary" loading={generateMutation.isPending} onClick={() => generateMutation.mutate()}>
              Generate Quests
            </Button>
          )}
        </Empty>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {quests.map((q) => (
            <div
              key={q.id}
              style={{
                padding: 12,
                background: '#f8fafc',
                borderRadius: 6,
                borderLeft: '4px solid #6366f1',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>{q.title}</span>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  loading={completeMutation.isPending && completeMutation.variables === q.id}
                  onClick={() => completeMutation.mutate(q.id)}
                  disabled={q.progress < q.target_value}
                >
                  Complete
                </Button>
              </div>
              <Progress
                percent={Math.round((q.progress / q.target_value) * 100)}
                size="small"
                status={q.progress >= q.target_value ? 'success' : 'active'}
              />
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                {q.progress}/{q.target_value} • +{q.xp_reward} XP
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
