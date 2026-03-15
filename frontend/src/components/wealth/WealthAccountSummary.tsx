import { Card, Typography, Button } from 'antd'
import { DollarOutlined, PlusOutlined } from '@ant-design/icons'
import type { WealthAccount } from '../../services/wealthVault'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

export function WealthAccountSummary({
  account,
  onAddFunds,
}: {
  account: WealthAccount | null
  onAddFunds?: () => void
}) {
  const theme = useTheme()

  if (!account) {
    return (
      <Card style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}>
        <Text type="secondary">No wealth account yet. Add funds to create one.</Text>
        {onAddFunds && (
          <Button type="primary" icon={<PlusOutlined />} style={{ marginTop: 12 }} onClick={onAddFunds}>
            Add funds
          </Button>
        )}
      </Card>
    )
  }

  const total = account.available_balance + account.locked_balance + account.pending_balance

  return (
    <Card
      style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}
      title={
        <span>
          <DollarOutlined style={{ marginRight: 8 }} />
          Wealth Account
        </span>
      }
      extra={onAddFunds && <Button type="primary" size="small" icon={<PlusOutlined />} onClick={onAddFunds}>Add funds</Button>}
    >
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>Available</Text>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#22c55e' }}>
            ${account.available_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>Locked</Text>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            ${account.locked_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>Pending</Text>
          <div style={{ fontSize: 16 }}>
            ${account.pending_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>Total</Text>
          <div style={{ fontSize: 20, fontWeight: 600 }}>
            ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })} {account.currency}
          </div>
        </div>
      </div>
    </Card>
  )
}
