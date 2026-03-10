import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Empty, Spin, notification } from 'antd'
import { ThunderboltOutlined, TrophyOutlined } from '@ant-design/icons'
import { lifeAchievementsService } from '../services/lifeAchievements'

export function LifeAchievementsPage() {
  const queryClient = useQueryClient()

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['life-achievements', 'all'],
    queryFn: () => lifeAchievementsService.getUnlocked(100),
  })

  const evaluateMutation = useMutation({
    mutationFn: () => lifeAchievementsService.evaluate(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['life-achievements'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      data.newly_unlocked?.forEach((a) => {
        notification.success({
          message: 'Achievement Unlocked!',
          description: a.message,
          placement: 'topRight',
          duration: 5,
        })
      })
    },
  })

  return (
    <div>
      <h1 style={{ marginBottom: 8, fontSize: 28 }}>Life Achievements</h1>
      <p style={{ marginBottom: 24, color: '#64748b' }}>
        Permanent milestones that reward your life progress. Run the engine to check for new unlocks.
      </p>

      <div style={{ marginBottom: 24 }}>
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          loading={evaluateMutation.isPending}
          onClick={() => evaluateMutation.mutate()}
        >
          Check for new achievements
        </Button>
      </div>

      {isLoading ? (
        <Spin size="large" />
      ) : achievements.length === 0 ? (
        <Card>
          <Empty
            description="No achievements unlocked yet. Keep progressing and run the engine to unlock milestones!"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {achievements.map((a) => (
            <Card key={a.id} size="small" style={{ borderTop: '4px solid #eab308' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <TrophyOutlined style={{ fontSize: 24, color: '#eab308' }} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.title}</div>
                  {a.description && (
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{a.description}</div>
                  )}
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    +{a.xp_reward} XP {a.domain && `• ${a.domain}`}
                    {a.unlocked_at && ` • ${new Date(a.unlocked_at).toLocaleDateString()}`}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
