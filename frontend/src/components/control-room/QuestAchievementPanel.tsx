import { Card, Progress } from 'antd'
import { FlagOutlined, TrophyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { QuestCard, AchievementCard } from '../../types/controlRoom'
import { DOMAIN_COLORS } from './constants'

interface QuestAchievementPanelProps {
  quests: QuestCard[]
  achievements: AchievementCard[]
  loading?: boolean
}

function formatDate(ts: string | undefined): string {
  if (!ts) return ''
  try {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 86400000) return 'Today'
    if (diff < 172800000) return 'Yesterday'
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export function QuestAchievementPanel({
  quests,
  achievements,
  loading,
}: QuestAchievementPanelProps) {
  const navigate = useNavigate()

  return (
    <Card
      title="Quests & Achievements"
      loading={loading}
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
              fontSize: 13,
              color: '#64748b',
            }}
          >
            <FlagOutlined /> Active Quests
          </div>
          {quests.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 12 }}>No active quests</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quests.map((q) => {
                const pct = q.target_value > 0 ? (q.progress / q.target_value) * 100 : 0
                return (
                  <div
                    key={q.id}
                    onClick={() => navigate('/app/quests')}
                    style={{
                      padding: 12,
                      background: '#f8fafc',
                      borderRadius: 8,
                      cursor: 'pointer',
                      borderLeft: '4px solid #6366f1',
                    }}
                  >
                    <div style={{ color: '#0f172a', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                      {q.title}
                    </div>
                    <Progress
                      percent={Math.min(100, pct)}
                      showInfo={false}
                      size="small"
                      strokeColor="#6366f1"
                    />
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                      {q.progress}/{q.target_value}
                      {q.xp_reward > 0 && ` · +${q.xp_reward} XP`}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
              fontSize: 13,
              color: '#64748b',
            }}
          >
            <TrophyOutlined /> Recent Achievements
          </div>
          {achievements.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 12 }}>No achievements yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {achievements.map((a) => (
                <div
                  key={a.id}
                  onClick={() => navigate('/app/achievements')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: 10,
                    background: '#f8fafc',
                    borderRadius: 8,
                    cursor: 'pointer',
                    borderLeft: `3px solid ${a.domain ? DOMAIN_COLORS[a.domain] || '#eab308' : '#eab308'}`,
                  }}
                >
                  <TrophyOutlined style={{ color: '#eab308' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#0f172a', fontSize: 13 }}>{a.title}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>
                      {formatDate(a.unlocked_at)}
                      {a.xp_reward ? ` · +${a.xp_reward} XP` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
