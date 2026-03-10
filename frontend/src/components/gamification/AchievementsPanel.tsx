import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Empty, Typography, Button, notification } from 'antd'
import { TrophyOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { lifeAchievementsService } from '../../services/lifeAchievements'

interface AchievementsPanelProps {
  limit?: number
  title?: string
  showCheckButton?: boolean
}

export function AchievementsPanel({ limit = 5, title = 'Achievements', showCheckButton = false }: AchievementsPanelProps) {
  const queryClient = useQueryClient()
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['life-achievements', limit],
    queryFn: () => lifeAchievementsService.getUnlocked(limit),
  })

  const checkMutation = useMutation({
    mutationFn: () => lifeAchievementsService.evaluate(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['life-achievements'] })
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
    <Card
      title={
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>
            <TrophyOutlined style={{ marginRight: 8 }} />
            {title}
          </span>
          {showCheckButton && (
            <Button
              size="small"
              icon={<ThunderboltOutlined />}
              loading={checkMutation.isPending}
              onClick={() => checkMutation.mutate()}
            >
              Check
            </Button>
          )}
        </span>
      }
      loading={isLoading}
    >
      {achievements.length === 0 && !isLoading ? (
        <Empty description="No achievements unlocked yet. Keep progressing!" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {achievements.map((a) => (
            <div
              key={a.id}
              style={{
                padding: 8,
                background: '#fefce8',
                borderRadius: 6,
                borderLeft: '4px solid #eab308',
              }}
            >
              <Typography.Text strong>{a.title}</Typography.Text>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                +{a.xp_reward} XP {a.domain && `• ${a.domain}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
