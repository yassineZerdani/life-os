/**
 * Break Early Warning Modal — serious, friction-inducing confirmation.
 * Two-step: Warning screen + Explicit confirmation.
 */
import { useState } from 'react'
import { Modal, Typography, Input, Button } from 'antd'
import { WarningOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import type { WealthVault } from '../../services/wealthVault'

const { Text } = Typography

const CONFIRM_TEXT = 'BREAK VAULT'

interface BreakEarlyWarningModalProps {
  open: boolean
  vault: WealthVault | null
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

export function BreakEarlyWarningModal({ open, vault, onConfirm, onCancel, loading }: BreakEarlyWarningModalProps) {
  const [confirmInput, setConfirmInput] = useState('')
  const [step, setStep] = useState(0)

  const handleClose = () => {
    setConfirmInput('')
    setStep(0)
    onCancel()
  }

  const handleBack = () => {
    if (step === 1) {
      setConfirmInput('')
      setStep(0)
    } else {
      handleClose()
    }
  }

  const handleConfirm = () => {
    if (step === 0) {
      setStep(1)
      return
    }
    if (confirmInput === CONFIRM_TEXT) {
      onConfirm()
      setConfirmInput('')
      setStep(0)
    }
  }

  if (!vault) return null

  const hasPenalty = vault.break_early_penalty_type && vault.break_early_penalty_value
  const penaltyText =
    vault.break_early_penalty_type === 'percentage' && vault.break_early_penalty_value != null
      ? `${vault.break_early_penalty_value}% of the locked amount`
      : vault.break_early_penalty_type === 'fixed' && vault.break_early_penalty_value != null
        ? formatMoney(vault.break_early_penalty_value)
        : null

  const isStep2 = step === 1

  return (
    <Modal
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ExclamationCircleOutlined style={{ color: '#f59e0b', fontSize: 22 }} />
          {isStep2 ? 'Confirm break' : 'Break vault early'}
        </span>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={440}
      maskClosable={false}
      closable={true}
    >
      <div style={{ padding: '8px 0' }}>
        <Text strong style={{ display: 'block', marginBottom: 12 }}>
          You are about to break the vault &quot;{vault.name}&quot; before the unlock date.
        </Text>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          This vault cannot be withdrawn early under normal rules. Breaking it will release funds to your available balance.
        </Text>

        {hasPenalty && penaltyText && (
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              marginBottom: 16,
            }}
          >
            <Text strong style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 8 }}>
              <WarningOutlined /> Early break penalty
            </Text>
            <Text style={{ display: 'block', marginTop: 4 }}>
              A penalty of {penaltyText} will be deducted from your locked amount.
            </Text>
          </div>
        )}

        {!isStep2 ? (
          <Text type="secondary" style={{ fontSize: 13 }}>
            Review vault rules before confirming. This action cannot be undone.
          </Text>
        ) : (
          <div style={{ marginTop: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Type &quot;{CONFIRM_TEXT}&quot; to confirm</Text>
            <Input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value.toUpperCase())}
              placeholder={CONFIRM_TEXT}
              status={confirmInput && confirmInput !== CONFIRM_TEXT ? 'error' : undefined}
              style={{ marginBottom: 16 }}
            />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
        <Button onClick={handleBack}>{isStep2 ? 'Back' : 'Cancel'}</Button>
        <Button
          danger
          onClick={handleConfirm}
          loading={loading}
          disabled={isStep2 && confirmInput !== CONFIRM_TEXT}
        >
          {isStep2 ? 'Break vault early' : 'Continue'}
        </Button>
      </div>
    </Modal>
  )
}
