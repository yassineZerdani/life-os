/**
 * Skill tree view: recursive tree of skills with level, XP, decay indicator.
 */
import { Typography } from 'antd'
import { RightOutlined, DownOutlined } from '@ant-design/icons'
import { useState } from 'react'
import type { SkillTreeNode } from '../../services/skills'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

interface SkillTreeViewProps {
  nodes: SkillTreeNode[]
  accentColor: string
  onSelectSkill: (skillId: string) => void
  depth?: number
}

export function SkillTreeView({ nodes, accentColor, onSelectSkill, depth = 0 }: SkillTreeViewProps) {
  return (
    <div style={{ paddingLeft: depth > 0 ? 24 : 0 }}>
      {nodes.map((node) => (
        <SkillTreeNodeRow
          key={node.skill.id}
          node={node}
          accentColor={accentColor}
          onSelectSkill={onSelectSkill}
          depth={depth}
        />
      ))}
    </div>
  )
}

function SkillTreeNodeRow({
  node,
  accentColor,
  onSelectSkill,
  depth,
}: {
  node: SkillTreeNode
  accentColor: string
  onSelectSkill: (skillId: string) => void
  depth: number
}) {
  const theme = useTheme()
  const [expanded, setExpanded] = useState(depth < 1)
  const hasChildren = node.children && node.children.length > 0
  const level = node.skill.progress?.level ?? 1

  return (
    <div style={{ marginBottom: 4 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderRadius: 10,
          cursor: 'pointer',
          background: theme.hoverBg,
          border: `1px solid ${theme.contentCardBorder}`,
        }}
        onClick={() => onSelectSkill(node.skill.id)}
      >
        <span
          style={{ width: 20, cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); setExpanded((x) => !x) }}
        >
          {hasChildren ? (expanded ? <DownOutlined /> : <RightOutlined />) : <span style={{ width: 20, display: 'inline-block' }} />}
        </span>
        <Text strong style={{ flex: 1, fontSize: 14 }}>{node.skill.name}</Text>
        <span style={{ fontSize: 12, color: accentColor }}>Lv.{level}</span>
        <span style={{ fontSize: 12, color: theme.textMuted }}>{node.total_xp} XP</span>
        {node.days_since_practice != null && node.days_since_practice > 0 && (
          <span style={{ fontSize: 11, color: theme.textMuted }}>{node.days_since_practice}d ago</span>
        )}
        {node.decay_risk != null && node.decay_risk > 0.3 && (
          <span style={{ fontSize: 11, color: '#f59e0b' }}>Decay risk</span>
        )}
      </div>
      {hasChildren && expanded && (
        <SkillTreeView
          nodes={node.children}
          accentColor={accentColor}
          onSelectSkill={onSelectSkill}
          depth={depth + 1}
        />
      )}
    </div>
  )
}
