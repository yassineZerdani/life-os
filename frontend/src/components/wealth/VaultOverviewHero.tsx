/**
 * Vault Overview Hero — total vaulted, available, locked, next unlock, vault count.
 * Premium banking-style summary.
 */
import { Typography } from 'antd'
import { LockOutlined, WalletOutlined, CalendarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useTheme } from '../../hooks/useTheme'

const { Text } = Typography

interface VaultOverviewHeroProps {
  totalVaulted: number
  availableBalance: number
  lockedBalance: number
  nextUnlock?: { vault_name: string; date: string; amount: number } | null
  vaultCount: number
  currency?: string
}

const formatMoney = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n)

export function VaultOverviewHero({
  totalVaulted,
  availableBalance,
  lockedBalance,
  nextUnlock,
  vaultCount,
  currency = 'USD',
}: VaultOverviewHeroProps) {
  const theme = useTheme()

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${theme.contentCardBg} 0%, ${theme.hoverBg} 100%)`,
        border: `1px solid ${theme.contentCardBorder}`,
        borderRadius: 16,
        padding: 28,
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle accent glow */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.accentLight} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total vaulted
          </Text>
          <div style={{ fontSize: 28, fontWeight: 700, color: theme.textPrimary, marginTop: 4, letterSpacing: '-0.02em' }}>
            {formatMoney(totalVaulted, currency)}
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>{vaultCount} active vault{vaultCount !== 1 ? 's' : ''}</Text>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(34, 197, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <WalletOutlined style={{ fontSize: 18, color: '#22c55e' }} />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>Available</Text>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#22c55e' }}>{formatMoney(availableBalance, currency)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: theme.accentLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockOutlined style={{ fontSize: 18, color: theme.accent }} />
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>Locked</Text>
              <div style={{ fontSize: 18, fontWeight: 600, color: theme.textPrimary }}>{formatMoney(lockedBalance, currency)}</div>
            </div>
          </div>
        </div>

        {nextUnlock && (
          <div
            style={{
              paddingLeft: 24,
              borderLeft: `2px solid ${theme.contentCardBorder}`,
            }}
          >
            <Text type="secondary" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CalendarOutlined /> Next unlock
            </Text>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary, marginTop: 4 }}>
              {nextUnlock.vault_name}
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {dayjs(nextUnlock.date).format('MMM D, YYYY')} · {formatMoney(nextUnlock.amount, currency)}
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}
