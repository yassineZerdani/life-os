/**
 * Family member card: name, relationship, closeness/tension hint, support level.
 */
import { Card, Typography, Progress } from 'antd'
import type { FamilyMember } from '../../services/family'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

const REL_LABELS: Record<string, string> = {
  parent: 'Parent',
  sibling: 'Sibling',
  partner: 'Partner',
  child: 'Child',
  extended: 'Extended',
  other: 'Other',
}

export function FamilyMemberCard({
  member,
  accentColor,
  onOpen,
}: {
  member: FamilyMember
  accentColor: string
  onOpen: () => void
}) {
  const theme = useTheme()
  const rel = REL_LABELS[member.relationship_type] || member.relationship_type
  const closeness = member.closeness_score != null ? Math.round(member.closeness_score * 10) : null
  const tension = member.tension_score != null ? Math.round(member.tension_score * 10) : null

  return (
    <Card
      size="small"
      style={{
        borderRadius: 12,
        border: `1px solid ${theme.contentCardBorder}`,
        cursor: 'pointer',
        background: theme.hoverBg,
      }}
      bodyStyle={{ padding: 14 }}
      onClick={onOpen}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Text strong style={{ fontSize: 15 }}>{member.name}</Text>
          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>{rel}</Text>
          {member.support_level && (
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>Support: </Text>
              <Text style={{ fontSize: 11 }}>{member.support_level}</Text>
            </div>
          )}
        </div>
      </div>
      {(closeness != null || tension != null) && (
        <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
          {closeness != null && (
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 10 }}>Closeness</Text>
              <Progress percent={closeness} size="small" strokeColor={accentColor} showInfo={false} />
            </div>
          )}
          {tension != null && (
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 10 }}>Tension</Text>
              <Progress percent={tension} size="small" strokeColor="#f43f5e" showInfo={false} />
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
