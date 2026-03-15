import { Card, Typography, List, Tag } from 'antd'
import { CreditCardOutlined, BankOutlined } from '@ant-design/icons'
import type { FundingSource } from '../../services/wealthVault'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  bank_transfer: <BankOutlined />,
  debit_card: <CreditCardOutlined />,
  credit_card: <CreditCardOutlined />,
}

export function FundingSourceManager({ sources }: { sources: FundingSource[] }) {
  const theme = useTheme()

  return (
    <Card
      title="Funding Sources"
      style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}
    >
      {sources.length === 0 ? (
        <Text type="secondary">No funding sources. Add a bank account or card to fund your vaults.</Text>
      ) : (
        <List
          dataSource={sources}
          renderItem={(s) => (
            <List.Item>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20, color: theme.accent }}>{SOURCE_ICONS[s.source_type] ?? <BankOutlined />}</span>
                <div>
                  <Text strong>{s.label}</Text>
                  {s.last4 && <Text type="secondary" style={{ marginLeft: 8 }}>•••• {s.last4}</Text>}
                  <div>
                    <Tag>{s.source_type.replace('_', ' ')}</Tag>
                    {s.brand && <Tag>{s.brand}</Tag>}
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  )
}
