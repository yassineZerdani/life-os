/**
 * VaultActionConfirmation — success screen after important actions.
 */
import { Card, Typography, Button } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'
import { useTheme } from '../../../hooks/useTheme'

const { Text } = Typography

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

interface VaultActionConfirmationProps {
  title: string
  vaultName: string
  amount?: number
  timestamp?: string
  status?: string
  nextStep?: string
  onViewVault?: () => void
  onViewTransactions?: () => void
  primaryCta?: { label: string; onClick: () => void }
}

export function VaultActionConfirmation({
  title,
  vaultName,
  amount,
  timestamp,
  status,
  nextStep,
  onViewVault,
  onViewTransactions,
  primaryCta,
}: VaultActionConfirmationProps) {
  const theme = useTheme()

  return (
    <Card
      style={{
        borderRadius: 16,
        border: `1px solid ${theme.contentCardBorder}`,
        textAlign: 'center',
        padding: 32,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'rgba(34, 197, 94, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <CheckCircleOutlined style={{ fontSize: 32, color: '#22c55e' }} />
      </div>
      <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 8 }}>{title}</Text>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>{vaultName}</Text>
      {amount != null && (
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{formatMoney(amount)}</div>
      )}
      {timestamp && (
        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>{timestamp}</Text>
      )}
      {status && (
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>Status: {status}</Text>
      )}
      {nextStep && (
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 16 }}>{nextStep}</Text>
      )}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
        {primaryCta && (
          <Button type="primary" onClick={primaryCta.onClick}>{primaryCta.label}</Button>
        )}
        {onViewVault && (
          <Button onClick={onViewVault}>View vault</Button>
        )}
        {onViewTransactions && (
          <Button ghost onClick={onViewTransactions}>View transactions</Button>
        )}
      </div>
    </Card>
  )
}
