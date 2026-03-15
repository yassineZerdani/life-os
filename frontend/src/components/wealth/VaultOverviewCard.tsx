import { Card, Typography, Button, Tag } from 'antd'
import { LockOutlined, SafetyOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import type { WealthVault } from '../../services/wealthVault'
import { useTheme } from '../../hooks/useTheme'
import { VaultLockStatusBadge } from './VaultLockStatusBadge'
import { VaultProgressCard } from './VaultProgressCard'
import { UnlockCountdownCard } from './UnlockCountdownCard'

const { Title, Text } = Typography

export function VaultOverviewCard({ vault }: { vault: WealthVault }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const target = vault.target_amount ?? 0

  return (
    <Card
      hoverable
      onClick={() => navigate(`/app/wealth/vaults/${vault.id}`)}
      style={{
        borderRadius: 12,
        border: `1px solid ${theme.contentCardBorder}`,
        background: theme.contentCardBg ?? theme.cardBg,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <Title level={5} style={{ margin: '0 0 4px', color: theme.textPrimary }}>
            {vault.name}
          </Title>
          {vault.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>{vault.description}</Text>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <VaultLockStatusBadge vault={vault} />
          <Tag color={vault.vault_type === 'real' ? 'gold' : 'default'} icon={vault.vault_type === 'real' ? <SafetyOutlined /> : <LockOutlined />}>
            {vault.vault_type}
          </Tag>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>Current</Text>
          <div style={{ fontSize: 18, fontWeight: 600, color: theme.textPrimary }}>
            ${vault.current_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        {target > 0 && (
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>Target</Text>
            <div style={{ fontSize: 16 }}>${target.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        )}
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>Unlock</Text>
          <div style={{ fontSize: 13 }}>{dayjs(vault.unlock_date).format('MMM D, YYYY')}</div>
        </div>
      </div>
      <VaultProgressCard vault={vault} />
      <div style={{ marginTop: 12 }}>
        <UnlockCountdownCard vault={vault} />
      </div>
      {vault.break_early_allowed ? (
        <Tag color="orange" style={{ marginTop: 8 }}>Break early allowed</Tag>
      ) : null}
      <Button type="primary" ghost size="small" style={{ marginTop: 12 }} onClick={(e) => { e.stopPropagation(); navigate(`/app/wealth/vaults/${vault.id}`) }}>
        View details
      </Button>
    </Card>
  )
}
