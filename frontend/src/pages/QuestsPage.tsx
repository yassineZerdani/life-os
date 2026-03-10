import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Empty, Spin, notification } from 'antd'
import { CheckOutlined, PlusOutlined } from '@ant-design/icons'
import { questsService } from '../services/quests'
export function QuestsPage() {
  const queryClient = useQueryClient()

  const { data: quests = [], isLoading } = useQuery({
    queryKey: ['quests'],
    queryFn: questsService.list,
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => questsService.complete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      notification.success({
        message: 'Quest completed!',
        description: `${data?.title} (+${data?.xp_awarded} XP)`,
        placement: 'topRight',
      })
    },
  })

  const generateMutation = useMutation({
    mutationFn: () => questsService.generate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })

  return (
    <div>
      <h1 style={{ marginBottom: 8, fontSize: 28 }}>Quests</h1>
      <p style={{ marginBottom: 24, color: '#64748b' }}>
        Short-term missions to level up your life. Complete quests to earn XP.
      </p>

      <div style={{ marginBottom: 24 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          loading={generateMutation.isPending}
          onClick={() => generateMutation.mutate()}
        >
          Generate new quests
        </Button>
      </div>

      {isLoading ? (
        <Spin size="large" />
      ) : quests.length === 0 ? (
        <Card>
          <Empty
            description="No active quests. Generate new quests based on your progress."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" loading={generateMutation.isPending} onClick={() => generateMutation.mutate()}>
              Generate Quests
            </Button>
          </Empty>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {quests.map((q) => (
            <Card key={q.id} size="small" style={{ borderLeft: '4px solid #6366f1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{q.title}</div>
                  {q.description && (
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{q.description}</div>
                  )}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span>Progress</span>
                      <span>
                        {q.progress} / {q.target_value}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: '#e2e8f0',
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, (q.progress / q.target_value) * 100)}%`,
                          height: '100%',
                          background: '#6366f1',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    +{q.xp_reward} XP {q.domain && `• ${q.domain}`}
                    {q.deadline && ` • Due ${new Date(q.deadline).toLocaleDateString()}`}
                  </div>
                </div>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={completeMutation.isPending && completeMutation.variables === q.id}
                  onClick={() => completeMutation.mutate(q.id)}
                  disabled={q.progress < q.target_value}
                >
                  Complete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
