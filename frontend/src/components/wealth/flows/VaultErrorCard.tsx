/**
 * VaultErrorCard — Polished error display for vault edge cases.
 * Insufficient balance, unverified source, provider timeout, etc.
 */
import { Card, Typography, Button } from 'antd'
import { CloseCircleOutlined } from '@ant-design/icons'
import { useTheme } from '../../../hooks/useTheme'

const { Text } = Typography

export type VaultErrorCode =
  | 'insufficient_balance'
  | 'funding_source_unverified'
  | 'unlock_too_early'
  | 'payout_destination_missing'
  | 'provider_timeout'
  | 'funding_failed'
  | 'generic'

const ERROR_CONFIG: Record<
  VaultErrorCode,
  { title: string; description: string; retryLabel?: string }
> = {
  insufficient_balance: {
    title: 'Insufficient available balance',
    description: 'Add funds to your account before funding this vault.',
    retryLabel: 'Add funds',
  },
  funding_source_unverified: {
    title: 'Funding source not verified',
    description: 'Verify your funding source before adding money.',
    retryLabel: 'Verify source',
  },
  unlock_too_early: {
    title: 'Unlock date not reached',
    description: 'Funds become available on the scheduled unlock date.',
  },
  payout_destination_missing: {
    title: 'Payout destination required',
    description: 'Add a linked bank account or choose available balance.',
    retryLabel: 'Add destination',
  },
  provider_timeout: {
    title: 'Request timed out',
    description: 'The request took too long. Please try again.',
    retryLabel: 'Try again',
  },
  funding_failed: {
    title: 'Funding failed',
    description: 'We could not complete the transfer. Please try again.',
    retryLabel: 'Try again',
  },
  generic: {
    title: 'Something went wrong',
    description: 'Please try again or contact support.',
    retryLabel: 'Try again',
  },
}

interface VaultErrorCardProps {
  code: VaultErrorCode
  detail?: string
  onRetry?: () => void
}

export function VaultErrorCard({ code, detail, onRetry }: VaultErrorCardProps) {
  const theme = useTheme()
  const config = ERROR_CONFIG[code] ?? ERROR_CONFIG.generic

  return (
    <Card
      style={{
        borderRadius: 12,
        border: `1px solid rgba(239, 68, 68, 0.4)`,
        background: 'rgba(239, 68, 68, 0.06)',
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <CloseCircleOutlined style={{ fontSize: 24, color: '#ef4444', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ color: '#ef4444', display: 'block' }}>{config.title}</Text>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>
            {detail ?? config.description}
          </Text>
          {config.retryLabel && onRetry && (
            <Button size="small" style={{ marginTop: 12 }} onClick={onRetry}>
              {config.retryLabel}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
