/**
 * OpportunityNetworkPanel — open opportunities linked to contacts.
 */
import { Card, Typography, Button, Tag } from 'antd'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import type { ConnectionOpportunity } from '../../services/network'
import type { Contact } from '../../services/network'

const { Text } = Typography

export interface OpportunityNetworkPanelProps {
  opportunities: ConnectionOpportunity[]
  getContactName?: (contactId: string) => string
  onAdd?: () => void
  onOpen?: (id: string) => void
  loading?: boolean
}

export function OpportunityNetworkPanel({
  opportunities,
  getContactName,
  onAdd,
  onOpen,
  loading,
}: OpportunityNetworkPanelProps) {
  const theme = useTheme()

  if (loading) {
    return (
      <Card size="small" style={{ borderRadius: 16, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
        <Text type="secondary">Loading…</Text>
      </Card>
    )
  }

  return (
    <Card
      size="small"
      title={<span style={{ fontWeight: 600, fontSize: 14 }}>Opportunity map</span>}
      extra={onAdd && <Button type="link" size="small" onClick={onAdd}>Add</Button>}
      style={{
        borderRadius: 16,
        border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
        background: theme.contentCardBg ?? undefined,
      }}
    >
      {opportunities.length === 0 ? (
        <Text type="secondary">No open opportunities. Link opportunities to contacts to see them here.</Text>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {opportunities.slice(0, 10).map((opp) => (
            <div
              key={opp.id}
              role={onOpen ? 'button' : undefined}
              onClick={() => onOpen?.(opp.id)}
              style={{
                padding: 10,
                borderRadius: 10,
                background: theme.hoverBg ?? 'rgba(0,0,0,0.02)',
                cursor: onOpen ? 'pointer' : undefined,
                borderLeft: `3px solid ${DOMAIN_COLORS.network}`,
              }}
            >
              <Text strong style={{ fontSize: 13 }}>{opp.title}</Text>
              <div style={{ marginTop: 4 }}>
                <Tag style={{ margin: 0 }}>{opp.opportunity_type}</Tag>
                {getContactName && (
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                    {getContactName(opp.contact_id)}
                  </Text>
                )}
              </div>
              {opp.potential_value != null && (
                <Text type="secondary" style={{ fontSize: 11 }}>Value: {opp.potential_value}</Text>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
