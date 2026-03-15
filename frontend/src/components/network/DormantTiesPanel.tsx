/**
 * DormantTiesPanel — valuable connections not contacted recently. Act on them.
 */
import { Card, Typography, Button } from 'antd'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import { ContactCard } from './ContactCard'
import type { DormantTieInfo } from '../../services/network'

const { Text } = Typography

export interface DormantTiesPanelProps {
  dormantTies: DormantTieInfo[]
  onReachOut?: (contactId: string) => void
  onViewAll?: () => void
  loading?: boolean
}

export function DormantTiesPanel({
  dormantTies,
  onReachOut,
  onViewAll,
  loading,
}: DormantTiesPanelProps) {
  const theme = useTheme()

  if (loading) {
    return (
      <Card size="small" style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
        <Text type="secondary">Loading…</Text>
      </Card>
    )
  }

  if (dormantTies.length === 0) {
    return (
      <Card
        size="small"
        style={{
          borderRadius: 16,
          border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
          background: theme.contentCardBg ?? undefined,
        }}
      >
        <Text type="secondary">No dormant ties. Your valuable connections are in touch.</Text>
      </Card>
    )
  }

  return (
    <Card
      size="small"
      title={
        <span style={{ fontWeight: 600, fontSize: 14 }}>
          Dormant ties
          <Text type="secondary" style={{ fontWeight: 400, marginLeft: 8 }}>
            — worth reconnecting
          </Text>
        </span>
      }
      extra={onViewAll && <Button type="link" size="small" onClick={onViewAll}>View graph</Button>}
      style={{
        borderRadius: 16,
        border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
        background: theme.contentCardBg ?? undefined,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {dormantTies.slice(0, 5).map(({ contact, days_since_contact, reason }) => (
          <div
            key={contact.id}
            style={{
              padding: 12,
              borderRadius: 10,
              background: theme.hoverBg ?? 'rgba(0,0,0,0.02)',
              borderLeft: `3px solid ${DOMAIN_COLORS.network}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Text strong>{contact.name}</Text>
                {days_since_contact != null && (
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                    {days_since_contact}+ days ago
                  </Text>
                )}
              </div>
              {onReachOut && (
                <Button type="primary" size="small" ghost onClick={() => onReachOut(contact.id)}>
                  Reach out
                </Button>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>{reason}</Text>
          </div>
        ))}
        {dormantTies.length > 5 && onViewAll && (
          <Button type="link" size="small" onClick={onViewAll}>
            +{dormantTies.length - 5} more
          </Button>
        )}
      </div>
    </Card>
  )
}
