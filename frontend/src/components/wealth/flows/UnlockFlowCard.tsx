/**
 * UnlockFlowCard — Full unlock flow states and actions.
 * Supports: not yet eligible, unlockable now, auto-unlocked, unlocked, payout in progress.
 */
import { Card, Typography, Button } from 'antd'
import { UnlockOutlined, CheckCircleOutlined, ClockCircleOutlined, SendOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { WealthVault } from '../../../services/wealthVault'
import { useTheme } from '../../../hooks/useTheme'

const { Text } = Typography

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

type UnlockState = 'not_eligible' | 'unlockable' | 'unlocked' | 'payout_in_progress' | 'payout_complete'

interface UnlockFlowCardProps {
  vault: WealthVault
  onUnlock?: () => void
  onPayout?: () => void
  loading?: boolean
  payoutLoading?: boolean
}

function getUnlockState(vault: WealthVault): UnlockState {
  if (vault.lock_status === 'unlocked') return 'unlocked'
  if (vault.lock_status === 'withdrawn') return 'payout_complete'
  const unlockDate = dayjs(vault.unlock_date)
  const isEligible = unlockDate.isBefore(dayjs()) || unlockDate.isSame(dayjs(), 'day')
  if (['locked', 'unlockable'].includes(vault.lock_status) && isEligible) return 'unlockable'
  if (['locked', 'unlockable'].includes(vault.lock_status)) return 'not_eligible'
  return 'unlocked'
}

export function UnlockFlowCard({ vault, onUnlock, onPayout, loading, payoutLoading }: UnlockFlowCardProps) {
  const theme = useTheme()
  const state = getUnlockState(vault)

  if (!['locked', 'unlockable', 'unlocked', 'withdrawn'].includes(vault.lock_status)) return null

  return (
    <Card
      style={{
        borderRadius: 12,
        border: `1px solid ${theme.contentCardBorder}`,
        background: theme.contentCardBg ?? theme.cardBg,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: state === 'unlockable' || state === 'unlocked' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(100, 116, 139, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {state === 'unlockable' || state === 'unlocked' ? (
            <UnlockOutlined style={{ fontSize: 24, color: '#22c55e' }} />
          ) : (
            <ClockCircleOutlined style={{ fontSize: 24, color: theme.textSecondary }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ fontSize: 16, display: 'block' }}>{vault.name}</Text>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>
            {state === 'not_eligible' && `Unlockable on ${dayjs(vault.unlock_date).format('MMMM D, YYYY')}`}
            {state === 'unlockable' && `${formatMoney(vault.current_amount)} ready to release`}
            {state === 'unlocked' && 'Funds released to available balance'}
            {state === 'payout_complete' && 'Payout completed'}
          </Text>
          {state === 'unlockable' && vault.auto_unlock && (
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
              This vault will auto-unlock. You can also unlock manually now.
            </Text>
          )}
          <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {state === 'unlockable' && onUnlock && (
              <Button type="primary" icon={<UnlockOutlined />} onClick={onUnlock} loading={loading}>
                Unlock now
              </Button>
            )}
            {state === 'unlocked' && vault.current_amount === 0 && onPayout && (
              <Button type="primary" icon={<SendOutlined />} onClick={onPayout} loading={payoutLoading}>
                Send to destination
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
