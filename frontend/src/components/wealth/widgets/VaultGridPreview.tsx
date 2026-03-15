import { Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import type { WealthVault } from '../../../services/wealthVault'
import { useTheme } from '../../../hooks/useTheme'
import { VaultCard } from '../VaultCard'

const { Text } = Typography

interface VaultGridPreviewProps {
  vaults: WealthVault[]
  maxItems?: number
}

export function VaultGridPreview({ vaults, maxItems = 3 }: VaultGridPreviewProps) {
  const theme = useTheme()
  const navigate = useNavigate()
  const display = vaults.slice(0, maxItems)

  if (vaults.length === 0) return null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text strong style={{ fontSize: 14 }}>Your vaults</Text>
        {vaults.length > maxItems && (
          <Text
            type="secondary"
            style={{ fontSize: 12, cursor: 'pointer', color: theme.accent }}
            onClick={() => navigate('/app/wealth/vaults')}
          >
            View all ({vaults.length})
          </Text>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {display.map((v) => (
          <VaultCard key={v.id} vault={v} />
        ))}
      </div>
    </div>
  )
}
