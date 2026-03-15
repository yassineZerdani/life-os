/**
 * Funding sources — bank, debit, credit.
 */
import { useQuery } from '@tanstack/react-query'
import { Typography } from 'antd'
import { wealthVaultService } from '../../services/wealthVault'
import { useTheme } from '../../hooks/useTheme'
import { FundingSourceManager } from '../../components/wealth/FundingSourceManager'

const { Title, Text } = Typography

export function FundingSourcesPage() {
  const theme = useTheme()

  const { data: sources = [] } = useQuery({
    queryKey: ['wealth', 'funding-sources'],
    queryFn: () => wealthVaultService.listFundingSources(),
  })

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: theme.textPrimary }}>Funding Sources</Title>
        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
          Bank accounts and cards for funding your wealth account. (MVP: add via API; UI coming in Phase 2.)
        </Text>
      </div>

      <FundingSourceManager sources={sources} />
    </div>
  )
}
