/**
 * Vault detail — dedicated financial product screen.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Button, Space } from 'antd'
import { LockOutlined, UnlockOutlined, WarningOutlined, ArrowLeftOutlined, DollarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { wealthVaultService } from '../../services/wealthVault'
import { useTheme } from '../../hooks/useTheme'
import { VaultStatusBadge } from '../../components/wealth/VaultStatusBadge'
import { VaultModeBadge } from '../../components/wealth/VaultModeBadge'
import { VaultProgressCard } from '../../components/wealth/VaultProgressCard'
import { VaultUnlockCountdown } from '../../components/wealth/VaultUnlockCountdown'
import { VaultLedgerTimeline } from '../../components/wealth/VaultLedgerTimeline'
import { BreakEarlyWarningModal } from '../../components/wealth/BreakEarlyWarningModal'
import {
  FundingFlowModal,
  LockReviewModal,
  LockSuccessCard,
  UnlockFlowCard,
  UnlockEligibilityBanner,
  VaultActionConfirmation,
  TransactionStatusBanner,
  BreakEarlyReviewCard,
  PayoutFlowModal,
} from '../../components/wealth/flows'

const { Title, Text } = Typography

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

export function WealthVaultDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [breakModalOpen, setBreakModalOpen] = useState(false)
  const [fundingModalOpen, setFundingModalOpen] = useState(false)
  const [lockReviewOpen, setLockReviewOpen] = useState(false)
  const [lockSuccess, setLockSuccess] = useState(false)
  const [fundSuccess, setFundSuccess] = useState<{ amount: number } | null>(null)
  const [breakSuccess, setBreakSuccess] = useState<{ penalty: number; net: number } | null>(null)
  const [payoutModalOpen, setPayoutModalOpen] = useState(false)

  const { data: vault, isLoading } = useQuery({
    queryKey: ['wealth', 'vault', id],
    queryFn: () => wealthVaultService.getVault(id!),
    enabled: !!id,
  })

  const { data: transactions = [] } = useQuery({
    queryKey: ['wealth', 'vault', id, 'transactions'],
    queryFn: () => wealthVaultService.listVaultTransactions(id!),
    enabled: !!id,
  })

  const { data: accounts = [] } = useQuery({
    queryKey: ['wealth', 'accounts'],
    queryFn: () => wealthVaultService.listAccounts(),
  })
  const { data: fundingSources = [] } = useQuery({
    queryKey: ['wealth', 'funding-sources'],
    queryFn: () => wealthVaultService.listFundingSources(),
  })
  const account = accounts[0]
  const availableBalance = account?.available_balance ?? 0

  const fundMutation = useMutation({
    mutationFn: (amount: number) => wealthVaultService.fundVault(id!, { amount }),
    onSuccess: (_, amount) => {
      queryClient.invalidateQueries({ queryKey: ['wealth'] })
      setFundingModalOpen(false)
      setFundSuccess({ amount })
      setTimeout(() => setFundSuccess(null), 5000)
    },
  })

  const lockMutation = useMutation({
    mutationFn: () => wealthVaultService.lockVault(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wealth'] })
      setLockReviewOpen(false)
      setLockSuccess(true)
    },
  })

  const unlockMutation = useMutation({
    mutationFn: () => wealthVaultService.unlockVault(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wealth'] }),
  })

  const breakMutation = useMutation({
    mutationFn: () => wealthVaultService.breakVault(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wealth'] })
      setBreakModalOpen(false)
      const amount = vault?.current_amount ?? 0
      const penalty = vault?.break_early_penalty_type && vault?.break_early_penalty_value
        ? vault.break_early_penalty_type === 'percentage'
          ? (amount * vault.break_early_penalty_value) / 100
          : Math.min(vault.break_early_penalty_value, amount)
        : 0
      setBreakSuccess({ penalty, net: amount - penalty })
    },
  })

  const payoutMutation = useMutation({
    mutationFn: (_dest: 'available' | 'bank') => Promise.resolve(), // Phase 2: implement payout API
    onSuccess: () => {
      setPayoutModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['wealth'] })
    },
  })

  if (isLoading || !vault) {
    return <div style={{ padding: 24 }}>Loading...</div>
  }

  const canFund = ['draft', 'active'].includes(vault.lock_status)
  const canLock = ['draft', 'active'].includes(vault.lock_status) && vault.current_amount > 0
  const canUnlock = ['locked', 'unlockable'].includes(vault.lock_status) && (dayjs(vault.unlock_date).isBefore(dayjs()) || vault.break_early_allowed)
  const canBreak = vault.break_early_allowed && ['locked', 'active'].includes(vault.lock_status)

  return (
    <div>
      {/* Back */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/app/wealth/vaults')}
        style={{ marginBottom: 16, color: theme.textSecondary }}
      >
        Back to vaults
      </Button>

      {/* Detail Hero */}
      <div
        style={{
          background: `linear-gradient(135deg, ${theme.contentCardBg} 0%, ${theme.hoverBg} 100%)`,
          border: `1px solid ${theme.contentCardBorder}`,
          borderRadius: 16,
          padding: 28,
          marginBottom: 24,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <VaultStatusBadge vault={vault} />
              <VaultModeBadge vault={vault} />
            </div>
            <Title level={3} style={{ margin: '0 0 4px', color: theme.textPrimary }}>
              {vault.name}
            </Title>
            {vault.description && (
              <Text type="secondary" style={{ fontSize: 14 }}>{vault.description}</Text>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Current balance</Text>
            <div style={{ fontSize: 32, fontWeight: 700, color: theme.textPrimary, letterSpacing: '-0.02em' }}>
              {formatMoney(vault.current_amount)}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <VaultProgressCard vault={vault} />
        </div>
      </div>

      {/* Unlock countdown */}
      <div style={{ marginBottom: 24 }}>
        <VaultUnlockCountdown vault={vault} />
      </div>

      {/* Unlock flow — card with eligibility, unlock, and payout actions */}
      {['locked', 'unlockable', 'unlocked'].includes(vault.lock_status) && (
        <div style={{ marginBottom: 24 }}>
          <UnlockFlowCard
            vault={vault}
            onUnlock={() => unlockMutation.mutate()}
            onPayout={() => setPayoutModalOpen(true)}
            loading={unlockMutation.isPending}
          />
        </div>
      )}

      {/* Success states */}
      {lockSuccess && (
        <div style={{ marginBottom: 24 }}>
          <LockSuccessCard vault={vault} onViewVault={() => setLockSuccess(false)} />
        </div>
      )}
      {breakSuccess && (
        <div style={{ marginBottom: 24 }}>
          <BreakEarlyReviewCard
            vaultName={vault.name}
            penaltyAmount={breakSuccess.penalty}
            netAmount={breakSuccess.net}
            onViewVault={() => setBreakSuccess(null)}
            onViewTransactions={() => navigate(`/app/wealth/vaults/${id}`)}
          />
        </div>
      )}
      {fundSuccess && !lockSuccess && !breakSuccess && (
        <div style={{ marginBottom: 24 }}>
          <VaultActionConfirmation
            title="Money added successfully"
            vaultName={vault.name}
            amount={fundSuccess.amount}
            timestamp={new Date().toLocaleString()}
            status="Posted"
            nextStep="Funds are now in your vault."
            onViewVault={() => setFundSuccess(null)}
          />
        </div>
      )}

      {/* Actions — hide when showing success states */}
      {!lockSuccess && !fundSuccess && !breakSuccess && (
      <Card
        title="Actions"
        style={{ marginBottom: 24, borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}
      >
        <Space wrap size="middle">
          {canFund && !fundSuccess && (
            <Button
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => setFundingModalOpen(true)}
            >
              Add money
            </Button>
          )}
          {canLock && !lockSuccess && (
            <Button
              icon={<LockOutlined />}
              onClick={() => setLockReviewOpen(true)}
              loading={lockMutation.isPending}
            >
              Lock vault
            </Button>
          )}
          {canUnlock && !['locked', 'unlockable'].includes(vault.lock_status) && (
            <Button type="primary" icon={<UnlockOutlined />} onClick={() => unlockMutation.mutate()} loading={unlockMutation.isPending}>
              Unlock
            </Button>
          )}
          {canBreak && (
            <Button danger icon={<WarningOutlined />} onClick={() => setBreakModalOpen(true)} loading={breakMutation.isPending}>
              Break early
            </Button>
          )}
        </Space>
        {canFund && (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Available balance: {formatMoney(availableBalance)}
            </Text>
          </div>
        )}
      </Card>
      )}

      {/* Unlock rules & Break policy */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card title="Unlock rules" size="small" style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Funds become available on {dayjs(vault.unlock_date).format('MMMM D, YYYY')}.{vault.auto_unlock ? ' This vault will auto-unlock on that date.' : ' You can unlock manually when eligible.'}
          </Text>
        </Card>
        {vault.break_early_allowed && (
          <Card title="Break early policy" size="small" style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {vault.break_early_penalty_value
                ? `Breaking this vault early may reduce your locked amount by ${vault.break_early_penalty_type === 'percentage' ? vault.break_early_penalty_value + '%' : formatMoney(vault.break_early_penalty_value)}.`
                : 'You can break this vault early. Funds will return to your available balance.'}
            </Text>
          </Card>
        )}
      </div>

      {/* Ledger / Transactions */}
      <Card
        title="Transaction history"
        style={{ borderRadius: 12, border: `1px solid ${theme.contentCardBorder}` }}
      >
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
          Audit trail available. Every balance movement is recorded.
        </Text>
        <VaultLedgerTimeline transactions={transactions} />
      </Card>

      <FundingFlowModal
        open={fundingModalOpen}
        vault={vault}
        availableBalance={availableBalance}
        fundingSources={fundingSources}
        onConfirm={(amount) => fundMutation.mutate(amount)}
        onCancel={() => setFundingModalOpen(false)}
        loading={fundMutation.isPending}
      />
      <LockReviewModal
        open={lockReviewOpen}
        vault={vault}
        onConfirm={() => lockMutation.mutate()}
        onCancel={() => setLockReviewOpen(false)}
        loading={lockMutation.isPending}
      />
      <BreakEarlyWarningModal
        open={breakModalOpen}
        vault={vault}
        onConfirm={() => breakMutation.mutate()}
        onCancel={() => setBreakModalOpen(false)}
        loading={breakMutation.isPending}
      />
      <PayoutFlowModal
        open={payoutModalOpen}
        vault={vault}
        amount={account?.available_balance ?? 0}
        onConfirm={(dest) => payoutMutation.mutate(dest)}
        onCancel={() => setPayoutModalOpen(false)}
        loading={payoutMutation.isPending}
      />
    </div>
  )
}
