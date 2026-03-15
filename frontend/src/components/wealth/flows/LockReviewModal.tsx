/**
 * LockReviewModal — Confirm lock rules before locking funds.
 */
import { useState } from 'react'
import { Modal, Typography, Checkbox, Button } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { WealthVault } from '../../../services/wealthVault'
import { useTheme } from '../../../hooks/useTheme'
import { VaultModeBadge } from '../VaultModeBadge'

const { Text } = Typography

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

interface LockReviewModalProps {
  open: boolean
  vault: WealthVault | null
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function LockReviewModal({ open, vault, onConfirm, onCancel, loading }: LockReviewModalProps) {
  const [acknowledged, setAcknowledged] = useState(false)
  const theme = useTheme()

  const handleClose = () => {
    setAcknowledged(false)
    onCancel()
  }

  const handleConfirm = () => {
    if (!acknowledged) return
    onConfirm()
    setAcknowledged(false)
  }

  if (!vault) return null

  return (
    <Modal
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LockOutlined style={{ color: theme.accent }} />
          Review before locking funds
        </span>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={480}
      maskClosable={false}
    >
      <div style={{ padding: '8px 0' }}>
        <div
          style={{
            padding: 16,
            background: theme.hoverBg,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <Text type="secondary" style={{ fontSize: 11 }}>Vault</Text>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{vault.name}</div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Amount being locked</Text>
              <Text strong>{formatMoney(vault.current_amount)}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Unlock date</Text>
              <Text>{dayjs(vault.unlock_date).format('MMM D, YYYY')}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Break early allowed</Text>
              <Text>{vault.break_early_allowed ? 'Yes' : 'No'}</Text>
            </div>
            {vault.break_early_allowed && vault.break_early_penalty_value && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Early break penalty</Text>
                <Text>
                  {vault.break_early_penalty_type === 'percentage'
                    ? `${vault.break_early_penalty_value}%`
                    : formatMoney(vault.break_early_penalty_value)}
                </Text>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary">Vault mode</Text>
              <VaultModeBadge vault={vault} />
            </div>
            {vault.payout_destination_type && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <Text type="secondary">Payout after unlock</Text>
                <Text>{vault.payout_destination_type === 'to_available' ? 'Available balance' : 'External destination'}</Text>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            padding: 12,
            background: 'rgba(99, 102, 241, 0.08)',
            border: `1px solid ${theme.accent}40`,
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 13 }}>
            Locked funds cannot be withdrawn before the unlock date unless early break is allowed.
          </Text>
        </div>

        <Checkbox
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          style={{ marginBottom: 20 }}
        >
          I understand the lock rules and confirm I want to lock these funds.
        </Checkbox>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="primary"
            icon={<LockOutlined />}
            onClick={handleConfirm}
            loading={loading}
            disabled={!acknowledged}
          >
            Lock funds
          </Button>
        </div>
      </div>
    </Modal>
  )
}
