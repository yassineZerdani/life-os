/**
 * Money Vaults — premium overview with hero, grid, sections.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Row, Col, Typography, Button } from 'antd'
import { LockOutlined, PlusOutlined, BankOutlined, CreditCardOutlined } from '@ant-design/icons'
import { wealthVaultService } from '../../services/wealthVault'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { VaultOverviewHero } from '../../components/wealth/VaultOverviewHero'
import { VaultCard } from '../../components/wealth/VaultCard'
import { CreateVaultModal, type CreateVaultFormValues } from '../../components/wealth/CreateVaultModal'

const { Title, Text } = Typography

export function WealthVaultsPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)

  const { data: vaults = [], isLoading } = useQuery({
    queryKey: ['wealth', 'vaults'],
    queryFn: () => wealthVaultService.listVaults(),
  })

  const { data: widgets } = useQuery({
    queryKey: ['wealth', 'widgets'],
    queryFn: () => wealthVaultService.getWidgets(),
  })

  const createMutation = useMutation({
    mutationFn: (values: CreateVaultFormValues) =>
      wealthVaultService.createVault({
        name: values.name,
        description: values.description,
        target_amount: values.target_amount,
        unlock_date: values.unlock_date.toISOString(),
        vault_type: values.vault_type,
        break_early_allowed: values.break_early_allowed,
        break_early_penalty_type: values.break_early_penalty_type,
        break_early_penalty_value: values.break_early_penalty_value,
        auto_unlock: values.auto_unlock,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wealth'] })
      setCreateOpen(false)
    },
  })

  const totalVaulted = widgets?.total_vaulted ?? vaults.reduce((s, v) => s + v.current_amount, 0)
  const availableBalance = widgets?.available_balance ?? 0
  const lockedBalance = widgets?.locked_balance ?? 0
  const nextUnlock = widgets?.next_unlock ?? null

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, color: theme.textPrimary, fontWeight: 600 }}>
            Money Vaults
          </Title>
          <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 14 }}>
            Lock savings until a date. Organize money for goals you care about.
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button type="text" icon={<BankOutlined />} onClick={() => navigate('/app/wealth/accounts')} style={{ color: theme.textSecondary }}>
            Account
          </Button>
          <Button type="text" icon={<CreditCardOutlined />} onClick={() => navigate('/app/wealth/funding-sources')} style={{ color: theme.textSecondary }}>
            Funding
          </Button>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setCreateOpen(true)}>
            Create Vault
          </Button>
        </div>
      </div>

      {/* Overview Hero */}
      <VaultOverviewHero
        totalVaulted={totalVaulted}
        availableBalance={availableBalance}
        lockedBalance={lockedBalance}
        nextUnlock={nextUnlock}
        vaultCount={vaults.length}
      />

      {isLoading ? (
        <Text>Loading vaults...</Text>
      ) : vaults.length === 0 ? (
        /* Empty state */
        <Card
          style={{
            borderRadius: 16,
            border: `1px solid ${theme.contentCardBorder}`,
            background: theme.contentCardBg ?? theme.cardBg,
            textAlign: 'center',
            padding: 64,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: theme.accentLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 36,
            }}
          >
            <LockOutlined style={{ color: theme.accent }} />
          </div>
          <Title level={4} style={{ marginBottom: 8, color: theme.textPrimary }}>
            No vaults yet
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Create a vault to lock money until a target date. Great for emergency funds, vacations, tax reserves, and big purchases.
          </Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Examples: Build a travel fund · Lock tax money · Grow an emergency reserve</Text>
          </div>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Create your first vault
          </Button>
        </Card>
      ) : (
        <>
          {/* Vault grid */}
          <div style={{ marginBottom: 32 }}>
            <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 16 }}>Your vaults</Text>
            <Row gutter={[16, 16]}>
              {vaults.map((v) => (
                <Col xs={24} sm={12} lg={8} key={v.id}>
                  <VaultCard vault={v} />
                </Col>
              ))}
            </Row>
          </div>

          {/* Upcoming unlocks */}
          {vaults.filter((v) => v.lock_status === 'locked' && v.current_amount > 0).length > 0 && (
            <Card
              title="Upcoming unlocks"
              style={{ marginBottom: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}
            >
              <Row gutter={[16, 16]}>
                {vaults
                  .filter((v) => v.lock_status === 'locked' && v.current_amount > 0)
                  .sort((a, b) => new Date(a.unlock_date).getTime() - new Date(b.unlock_date).getTime())
                  .slice(0, 3)
                  .map((v) => (
                    <Col xs={24} sm={8} key={v.id}>
                      <div style={{ padding: 12, background: theme.hoverBg, borderRadius: 8 }}>
                        <Text strong>{v.name}</Text>
                        <div style={{ fontSize: 13, color: theme.textSecondary }}>
                          {new Date(v.unlock_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · $
                          {v.current_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </Col>
                  ))}
              </Row>
            </Card>
          )}
        </>
      )}

      <CreateVaultModal
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onSubmit={(v) => createMutation.mutate(v)}
        loading={createMutation.isPending}
      />
    </div>
  )
}
