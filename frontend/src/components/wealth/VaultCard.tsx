/**
 * Vault Card — premium card with category icon, progress, countdown.
 * Elegant, trustworthy, high legibility.
 */
import { Card, Typography, Progress } from 'antd'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import type { WealthVault } from '../../services/wealthVault'
import { useTheme } from '../../hooks/useTheme'
import { getVaultCategory } from './vaultDesign'
import { VaultStatusBadge } from './VaultStatusBadge'
import { VaultModeBadge } from './VaultModeBadge'

const { Text } = Typography

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

export function VaultCard({ vault }: { vault: WealthVault }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const category = getVaultCategory(vault.name, vault.description)
  const target = vault.target_amount ?? 0
  const pct = target > 0 ? Math.min(100, (vault.current_amount / target) * 100) : 0
  const unlockDate = dayjs(vault.unlock_date)
  const daysRemaining = unlockDate.diff(dayjs(), 'day')
  const isEligible = daysRemaining <= 0

  return (
    <Card
      hoverable
      onClick={() => navigate(`/app/wealth/vaults/${vault.id}`)}
      style={{
        borderRadius: 16,
        border: `1px solid ${theme.contentCardBorder}`,
        background: theme.contentCardBg ?? theme.cardBg,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        overflow: 'hidden',
      }}
      styles={{
        body: { padding: 20 },
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = theme.crShadowHover ?? theme.shadowMd
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Subtle category accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${category.color} 0%, ${category.color}80 100%)`,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `${category.color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            {category.icon}
          </div>
          <div>
            <Text strong style={{ fontSize: 16, color: theme.textPrimary, display: 'block' }}>
              {vault.name}
            </Text>
            {vault.description && (
              <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.4 }} ellipsis>
                {vault.description}
              </Text>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <VaultStatusBadge vault={vault} />
          <VaultModeBadge vault={vault} />
        </div>
      </div>

      {/* Amount — large typography */}
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Current balance
        </Text>
        <div style={{ fontSize: 24, fontWeight: 700, color: theme.textPrimary, letterSpacing: '-0.02em', marginTop: 2 }}>
          {formatMoney(vault.current_amount)}
        </div>
        {target > 0 && (
          <Text type="secondary" style={{ fontSize: 13 }}>of {formatMoney(target)} target</Text>
        )}
      </div>

      {/* Progress bar */}
      {target > 0 && (
        <Progress
          percent={Math.round(pct)}
          showInfo={false}
          strokeColor={category.color}
          trailColor={theme.hoverBg}
          strokeWidth={6}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Unlock info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 12,
          borderTop: `1px solid ${theme.contentCardBorder}`,
        }}
      >
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>Unlock date</Text>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{unlockDate.format('MMM D, YYYY')}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Text type="secondary" style={{ fontSize: 11 }}>Time remaining</Text>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: isEligible ? '#22c55e' : theme.textPrimary,
            }}
          >
            {isEligible ? 'Ready to unlock' : `${daysRemaining} days`}
          </div>
        </div>
      </div>

      {vault.break_early_allowed && (
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
          Early break allowed
        </Text>
      )}
    </Card>
  )
}
