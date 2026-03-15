/**
 * Vault Unlock Countdown — strong visual countdown with eligibility states.
 * Satisfying and motivating.
 */
import { Card, Typography } from 'antd'
import dayjs from 'dayjs'
import type { WealthVault } from '../../services/wealthVault'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

type CountdownState = 'locked' | 'unlockable_soon' | 'ready' | 'unlocked'

function getCountdownState(vault: WealthVault): CountdownState {
  if (['unlocked', 'withdrawn', 'broken'].includes(vault.lock_status)) return 'unlocked'
  const unlockDate = dayjs(vault.unlock_date)
  const daysRemaining = unlockDate.diff(dayjs(), 'day')
  if (daysRemaining <= 0) return 'ready'
  if (daysRemaining <= 14) return 'unlockable_soon'
  return 'locked'
}

const STATE_CONFIG: Record<CountdownState, { label: string; sublabel: string; color: string; icon: string }> = {
  locked: {
    label: 'Locked until',
    sublabel: 'Funds become available on the unlock date',
    color: '#6366f1',
    icon: '🔒',
  },
  unlockable_soon: {
    label: 'Unlockable in',
    sublabel: 'Almost there',
    color: '#f59e0b',
    icon: '⏳',
  },
  ready: {
    label: 'Ready to unlock',
    sublabel: 'Funds can be released to your available balance',
    color: '#22c55e',
    icon: '✓',
  },
  unlocked: {
    label: 'Unlocked',
    sublabel: 'Funds have been released',
    color: '#64748b',
    icon: '✓',
  },
}

export function VaultUnlockCountdown({ vault }: { vault: WealthVault }) {
  const theme = useTheme()
  const state = getCountdownState(vault)
  const config = STATE_CONFIG[state]
  const unlockDate = dayjs(vault.unlock_date)
  const daysRemaining = unlockDate.diff(dayjs(), 'day')

  return (
    <Card
      style={{
        borderRadius: 12,
        border: `1px solid ${theme.contentCardBorder}`,
        borderLeft: `4px solid ${config.color}`,
        background: theme.contentCardBg ?? theme.cardBg,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `${config.color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}
        >
          {config.icon}
        </div>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>{config.label}</Text>
          <div style={{ fontSize: 20, fontWeight: 700, color: config.color, marginTop: 4 }}>
            {state === 'locked' && `${daysRemaining} days`}
            {state === 'unlockable_soon' && `${daysRemaining} days`}
            {state === 'ready' && 'Unlock now'}
            {state === 'unlocked' && 'Complete'}
          </div>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>
            {unlockDate.format('MMMM D, YYYY')}
          </Text>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
            {config.sublabel}
          </Text>
        </div>
      </div>
    </Card>
  )
}
