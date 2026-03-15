import { Card, Typography, Progress } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { wealthVaultService } from '../../services/wealthVault'
import { useTheme } from '../../hooks/useTheme'
import dayjs from 'dayjs'

const { Text } = Typography

export function WealthVaultWidget() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['wealth', 'widgets'],
    queryFn: () => wealthVaultService.getWidgets(),
  })

  if (isLoading || !data) return null
  if (data.vault_count === 0 && data.total_vaulted === 0 && data.available_balance === 0) return null

  return (
    <Card
      hoverable
      onClick={() => navigate('/app/wealth/vaults')}
      style={{
        borderRadius: 12,
        border: `1px solid ${theme.contentCardBorder}`,
        background: theme.contentCardBg ?? theme.cardBg,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <LockOutlined style={{ fontSize: 20, color: theme.accent }} />
        <Text strong style={{ color: theme.textPrimary }}>Money Vaults</Text>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>Available</Text>
          <div style={{ fontSize: 16, fontWeight: 600 }}>${data.available_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>Locked</Text>
          <div style={{ fontSize: 16, fontWeight: 600 }}>${data.locked_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>Vaulted</Text>
          <div style={{ fontSize: 16, fontWeight: 600 }}>${data.total_vaulted.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>
      {data.emergency_fund_progress > 0 && (
        <div style={{ marginBottom: 8 }}>
          <Text type="secondary" style={{ fontSize: 11 }}>Emergency fund</Text>
          <Progress percent={Math.round(data.emergency_fund_progress)} size="small" strokeColor={theme.accent} />
        </div>
      )}
      {data.next_unlock && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Next unlock: {data.next_unlock.vault_name} on {dayjs(data.next_unlock.date).format('MMM D')}
        </Text>
      )}
      <div style={{ marginTop: 8 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>Discipline score</Text>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{data.vault_discipline_score}/100</div>
      </div>
    </Card>
  )
}
