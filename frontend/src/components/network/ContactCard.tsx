/**
 * ContactCard — trust, warmth, opportunity, last contact. Premium, scannable.
 */
import { Card, Typography, Progress, Tag } from 'antd'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import type { Contact } from '../../services/network'

const { Text } = Typography

const CATEGORY_LABELS: Record<string, string> = {
  mentor: 'Mentor',
  peer: 'Peer',
  collaborator: 'Collaborator',
  client: 'Client',
  other: 'Other',
}

export interface ContactCardProps {
  contact: Contact
  accentColor?: string
  onClick?: () => void
}

export function ContactCard({ contact, accentColor = DOMAIN_COLORS.network, onClick }: ContactCardProps) {
  const theme = useTheme()
  const lastContact = contact.last_contact_at
    ? new Date(contact.last_contact_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No recent contact'

  return (
    <Card
      size="small"
      style={{
        borderRadius: 12,
        border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
        background: theme.contentCardBg ?? undefined,
        cursor: onClick ? 'pointer' : undefined,
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Text strong style={{ fontSize: 15 }}>{contact.name}</Text>
        <Tag color={accentColor}>{CATEGORY_LABELS[contact.category] ?? contact.category}</Tag>
      </div>
      {(contact.company || contact.role) && (
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
          {[contact.role, contact.company].filter(Boolean).join(' · ')}
        </Text>
      )}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        {contact.trust_score != null && (
          <div style={{ flex: 1 }}>
            <Text type="secondary" style={{ fontSize: 10 }}>Trust</Text>
            <Progress percent={Math.round(contact.trust_score * 10)} size="small" showInfo={false} strokeColor={accentColor} />
          </div>
        )}
        {contact.warmth_score != null && (
          <div style={{ flex: 1 }}>
            <Text type="secondary" style={{ fontSize: 10 }}>Warmth</Text>
            <Progress percent={Math.round(contact.warmth_score * 10)} size="small" showInfo={false} strokeColor="#f59e0b" />
          </div>
        )}
        {contact.opportunity_score != null && (
          <div style={{ flex: 1 }}>
            <Text type="secondary" style={{ fontSize: 10 }}>Opportunity</Text>
            <Progress percent={Math.round(contact.opportunity_score * 10)} size="small" showInfo={false} strokeColor="#22c55e" />
          </div>
        )}
      </div>
      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>{lastContact}</Text>
    </Card>
  )
}
