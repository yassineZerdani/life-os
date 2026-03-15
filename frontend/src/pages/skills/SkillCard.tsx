/**
 * Single skill card for list/dashboard: name, level, XP, decay hint, subskills count.
 */
import { Card, Typography, Progress } from 'antd'
import { RightOutlined } from '@ant-design/icons'
import type { SkillTreeNode } from '../../services/skills'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

interface SkillCardProps {
  node: SkillTreeNode
  accentColor: string
  onOpen: () => void
}

export function SkillCard({ node, accentColor, onOpen }: SkillCardProps) {
  const theme = useTheme()
  const { skill, total_xp, session_count, days_since_practice, decay_risk } = node
  const level = skill.progress?.level ?? 1
  const xp = skill.progress?.xp ?? 0
  const nextLevelXp = level * 100
  const progressPct = nextLevelXp > 0 ? Math.min(100, (xp / nextLevelXp) * 100) : 0
  const subCount = node.children?.length ?? 0

  return (
    <Card
      size="small"
      style={{
        borderRadius: 12,
        border: `1px solid ${theme.contentCardBorder}`,
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      bodyStyle={{ padding: 16 }}
      onClick={onOpen}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor
        e.currentTarget.style.boxShadow = `0 2px 8px ${accentColor}20`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = theme.contentCardBorder
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Text strong style={{ fontSize: 15 }}>{skill.name}</Text>
          {skill.category && (
            <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>{skill.category}</Text>
          )}
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: accentColor }}>Lv.{level}</span>
            <span style={{ fontSize: 12, color: theme.textMuted }}>{total_xp} XP</span>
            {session_count > 0 && (
              <span style={{ fontSize: 12, color: theme.textMuted }}>{session_count} sessions</span>
            )}
            {subCount > 0 && (
              <span style={{ fontSize: 12, color: theme.textMuted }}>{subCount} subskills</span>
            )}
            {days_since_practice != null && days_since_practice > 0 && (
              <span style={{ fontSize: 11, color: theme.textMuted }}>Last practiced {days_since_practice}d ago</span>
            )}
          </div>
          {decay_risk != null && decay_risk > 0.3 && (
            <div style={{ marginTop: 6 }}>
              <Progress
                percent={Math.round(decay_risk * 100)}
                size="small"
                status="exception"
                showInfo={false}
                strokeColor="#f59e0b"
              />
              <Text type="secondary" style={{ fontSize: 11 }}>Decay risk</Text>
            </div>
          )}
        </div>
        <RightOutlined style={{ color: theme.textMuted, fontSize: 14 }} />
      </div>
      {nextLevelXp > 0 && (
        <div style={{ marginTop: 10 }}>
          <Progress percent={progressPct} size="small" strokeColor={accentColor} />
        </div>
      )}
    </Card>
  )
}
