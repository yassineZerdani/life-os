import { FlagOutlined, TrophyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { QuestCard, AchievementCard } from '../../types/controlRoom'
import { useTheme } from '../../hooks/useTheme'
import { ControlRoomCard } from './ControlRoomCard'
import { DOMAIN_COLORS } from './constants'

interface ActiveQuestsCardProps {
  quests: QuestCard[]
  loading?: boolean
}

export function ActiveQuestsCard({ quests, loading }: ActiveQuestsCardProps) {
  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <ControlRoomCard>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: theme.textPrimary,
          margin: 0,
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <FlagOutlined style={{ color: theme.accent }} />
        Active Quests
      </h3>
      {loading ? (
        <div style={{ color: theme.textMuted, fontSize: 15 }}>Loading…</div>
      ) : quests.length === 0 ? (
        <div style={{ color: theme.textSecondary, fontSize: 14 }}>No active quests</div>
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
                  background: theme.hoverBg,
                  borderRadius: theme.radius,
                  cursor: 'pointer',
                  borderLeft: '4px solid ' + theme.accent,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.selectedBg
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.hoverBg
                }}
              >
                <div
                  style={{
                    color: theme.textPrimary,
                    fontWeight: 600,
                    fontSize: 13,
                    marginBottom: 6,
                  }}
                >
                  {q.title}
                </div>
                <div
                  style={{
                    height: 6,
                    background: theme.borderLight,
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      height: '100%',
                      background: theme.accent,
                      borderRadius: 3,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>
                  {q.progress}/{q.target_value}
                  {q.xp_reward > 0 && ` · +${q.xp_reward} XP`}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </ControlRoomCard>
  )
}

interface RecentAchievementsCardProps {
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

export function RecentAchievementsCard({
  achievements,
  loading,
}: RecentAchievementsCardProps) {
  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <ControlRoomCard>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: theme.textPrimary,
          margin: 0,
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <TrophyOutlined style={{ color: '#eab308' }} />
        Recent Achievements
      </h3>
      {loading ? (
        <div style={{ color: theme.textMuted, fontSize: 15 }}>Loading…</div>
      ) : achievements.length === 0 ? (
        <div style={{ color: theme.textSecondary, fontSize: 14 }}>No achievements yet</div>
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
                background: theme.hoverBg,
                borderRadius: theme.radius,
                cursor: 'pointer',
                borderLeft: `3px solid ${a.domain ? DOMAIN_COLORS[a.domain] ?? '#eab308' : '#eab308'}`,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.selectedBg
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.hoverBg
              }}
            >
              <TrophyOutlined style={{ color: '#eab308' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: theme.textPrimary, fontSize: 13 }}>{a.title}</div>
                <div style={{ fontSize: 10, color: theme.textMuted }}>
                  {formatDate(a.unlocked_at)}
                  {a.xp_reward ? ` · +${a.xp_reward} XP` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ControlRoomCard>
  )
}
