/**
 * ReciprocityBalanceCard — support given vs received for a contact.
 */
import { Card, Typography } from 'antd'
import { useTheme } from '../../hooks/useTheme'
import { DOMAIN_COLORS } from '../control-room/constants'
import type { ReciprocityEntry } from '../../services/network'

const { Text } = Typography

export interface ReciprocityBalanceCardProps {
  entries: ReciprocityEntry[]
  contactName?: string
  loading?: boolean
}

export function ReciprocityBalanceCard({
  entries,
  contactName,
  loading,
}: ReciprocityBalanceCardProps) {
  const theme = useTheme()

  const given = entries.filter((e) => e.support_given?.trim()).length
  const received = entries.filter((e) => e.support_received?.trim()).length
  const balance = given - received

  if (loading) {
    return (
      <Card size="small" style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}` }}>
        <Text type="secondary">Loading…</Text>
      </Card>
    )
  }

  return (
    <Card
      size="small"
      title={contactName ? `Reciprocity — ${contactName}` : 'Reciprocity'}
      style={{
        borderRadius: 12,
        border: `1px solid ${theme.contentCardBorder ?? '#e2e8f0'}`,
        background: theme.contentCardBg ?? undefined,
      }}
    >
      <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>Given</Text>
          <div style={{ fontSize: 20, fontWeight: 700, color: DOMAIN_COLORS.network }}>{given}</div>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>Received</Text>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>{received}</div>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>Balance</Text>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: balance > 0 ? '#f59e0b' : balance < 0 ? '#22c55e' : theme.textSecondary,
            }}
          >
            {balance > 0 ? '+' : ''}{balance}
          </div>
        </div>
      </div>
      {entries.length === 0 && (
        <Text type="secondary" style={{ fontSize: 12 }}>No reciprocity entries yet.</Text>
      )}
      {entries.length > 0 && (
        <div style={{ maxHeight: 200, overflow: 'auto' }}>
          {entries.slice(0, 5).map((e) => (
            <div
              key={e.id}
              style={{
                padding: '6px 0',
                borderBottom: `1px solid ${theme.border ?? '#e2e8f0'}`,
                fontSize: 12,
              }}
            >
              {e.date && (
                <Text type="secondary">{new Date(e.date).toLocaleDateString()}</Text>
              )}
              {e.support_given && <div><Text strong>Given: </Text>{e.support_given}</div>}
              {e.support_received && <div><Text strong>Received: </Text>{e.support_received}</div>}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
