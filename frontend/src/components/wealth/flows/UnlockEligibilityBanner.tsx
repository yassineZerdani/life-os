/**
 * UnlockEligibilityBanner — Shows unlock eligibility state.
 */
import { Alert, Typography, Button } from 'antd'
import { UnlockOutlined, CheckCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { WealthVault } from '../../../services/wealthVault'
const { Text } = Typography

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

interface UnlockEligibilityBannerProps {
  vault: WealthVault
  onUnlock?: () => void
  loading?: boolean
}

export function UnlockEligibilityBanner({ vault, onUnlock, loading }: UnlockEligibilityBannerProps) {
  const unlockDate = dayjs(vault.unlock_date)
  const isEligible = unlockDate.isBefore(dayjs()) || unlockDate.isSame(dayjs(), 'day')

  if (!['locked', 'unlockable'].includes(vault.lock_status)) return null
  if (vault.current_amount <= 0) return null

  if (isEligible) {
    return (
      <Alert
        type="success"
        showIcon
        icon={<CheckCircleOutlined />}
        message="Unlock available now"
        description={
          <div>
            <Text style={{ display: 'block' }}>
              {formatMoney(vault.current_amount)} can be released to your available balance.
            </Text>
            {vault.auto_unlock ? (
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                This vault will auto-unlock. You can also unlock manually now.
              </Text>
            ) : null}
            {onUnlock && (
              <Button type="primary" size="small" icon={<UnlockOutlined />} onClick={onUnlock} loading={loading} style={{ marginTop: 12 }}>
                Unlock now
              </Button>
            )}
          </div>
        }
        style={{ borderRadius: 12 }}
      />
    )
  }

  return (
    <Alert
      type="info"
      showIcon
      message={`Unlockable on ${unlockDate.format('MMMM D, YYYY')}`}
      description={
        <Text type="secondary">
          Funds will become available on the unlock date. {vault.break_early_allowed && 'Early break is allowed if you need funds sooner.'}
        </Text>
      }
      style={{ borderRadius: 12 }}
    />
  )
}
